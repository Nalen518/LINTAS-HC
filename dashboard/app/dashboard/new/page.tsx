"use client";

import { useEffect, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/declaration/Stepper";
import {
  UploadZone,
  EMPTY_SLOT_FILES,
  type DocumentSlot,
  type SlotFiles,
} from "@/components/declaration/UploadZone";
import { ExtractionProgress } from "@/components/declaration/ExtractionProgress";
import { ExtractionDegraded } from "@/components/declaration/ExtractionDegraded";
import { ResultsView } from "@/components/declaration/ResultsView";
import {
  PIPELINE_STAGES,
  type StageStatus,
} from "@/components/declaration/StageList";
import {
  extractDocuments,
  validateDocuments,
  predictHsCode,
  type ExtractResponse,
  type ValidateResponse,
  type PredictHsCodeResponse,
} from "@/lib/api";

// New declaration workflow — PRD §5.1–5.5. Phases map to Figma frames:
//   upload     → 69:383
//   processing → 75:620  (animated pipeline)
//   degraded   → 100:1785 (ADR-003 fallback, when ocr_meta.errors is non-empty)
//   review     → 84:534 / 86:337 / 85:296 / 87:378 / 88:419 (real ML results)
type Phase = "upload" | "processing" | "degraded" | "review";

const STAGE_COUNT = PIPELINE_STAGES.length;
const STAGE_INTERVAL_MS = 550;

type OcrError = ExtractResponse["ocr_meta"]["errors"][number];
type CiItem = { description?: string; unit_of_measure?: string };
type CiDoc = { country_of_origin?: string; items?: CiItem[] };

function degradedMessage(errors: OcrError[]): string {
  const stageKey = errors[0]?.stage ?? "";
  const stage = PIPELINE_STAGES.find((s) => s.key === stageKey);
  const name = stage?.name ?? "A stage";
  return `${name} didn't complete on this document. LINTAS finished using the remaining stages, so some fields may be less complete and should be reviewed.`;
}

const ALL_WAITING: StageStatus[] = Array(STAGE_COUNT).fill("waiting");

export default function NewDeclarationPage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [files, setFiles] = useState<SlotFiles>(EMPTY_SLOT_FILES);
  const [statuses, setStatuses] = useState<StageStatus[]>(ALL_WAITING);
  const [errors, setErrors] = useState<OcrError[]>([]);
  const [extraction, setExtraction] = useState<ExtractResponse | null>(null);
  const [validation, setValidation] = useState<ValidateResponse | null>(null);
  const [hsPrediction, setHsPrediction] = useState<PredictHsCodeResponse | null>(
    null,
  );
  const [extractError, setExtractError] = useState<string | null>(null);

  const allFilesPresent = Object.values(files).every(Boolean);
  const stages = PIPELINE_STAGES.map((stage, i) => ({
    name: stage.name,
    desc: stage.desc,
    status: statuses[i],
  }));

  // Animate the pipeline while extraction runs (see task #4). The real backend
  // returns everything in one response, so this is an honest progress bar.
  useEffect(() => {
    if (phase !== "processing") return;
    setStatuses(["processing", ...Array(STAGE_COUNT - 1).fill("waiting")]);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      if (i >= STAGE_COUNT) {
        clearInterval(id);
        return;
      }
      setStatuses((prev) =>
        prev.map((_, idx) =>
          idx < i ? "done" : idx === i ? "processing" : "waiting",
        ),
      );
    }, STAGE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [phase]);

  function handleFileChange(slot: DocumentSlot, file: File | null) {
    setFiles((prev) => ({ ...prev, [slot]: file }));
  }

  // Run validation + HS prediction on the extracted documents, then show the
  // real Results. Called on a clean extract and on "review anyway" from the
  // degraded screen.
  async function proceedToReview(result: ExtractResponse) {
    const validationResult = await validateDocuments({
      extraction_id: result.extraction_id,
      documents: result.documents,
    });
    setValidation(validationResult);

    const ci = result.documents.commercial_invoice as CiDoc;
    const item = ci?.items?.[0];
    if (item?.description) {
      try {
        const hs = await predictHsCode({
          item_description: item.description,
          country_of_origin: ci?.country_of_origin ?? "Unknown",
          unit_of_measure: item.unit_of_measure ?? "unit",
        });
        setHsPrediction(hs);
      } catch {
        setHsPrediction(null); // best-effort — HS tab degrades gracefully
      }
    }
    setPhase("review");
  }

  async function handleExtract() {
    if (!allFilesPresent) return;
    setExtractError(null);
    setPhase("processing");
    try {
      const result = await extractDocuments({
        commercial_invoice: files.commercial_invoice as File,
        packing_list: files.packing_list as File,
        bill_of_lading: files.bill_of_lading as File,
      });
      setExtraction(result);

      // Demo hook: /dashboard/new?sim=degraded forces the fallback path.
      const simDegraded =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("sim") === "degraded";
      const ocrErrors: OcrError[] = simDegraded
        ? [
            {
              stage: "tabletransformer",
              document: "packing_list",
              message: "TableTransformer failed to load",
            },
          ]
        : result.ocr_meta.errors;

      if (ocrErrors.length > 0) {
        const failed = new Set(ocrErrors.map((e) => e.stage));
        setErrors(ocrErrors);
        setStatuses(
          PIPELINE_STAGES.map((s) => (failed.has(s.key) ? "skipped" : "done")),
        );
        setPhase("degraded");
      } else {
        setStatuses(Array(STAGE_COUNT).fill("done"));
        await proceedToReview(result);
      }
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Backend unreachable. Start the FastAPI server or set NEXT_PUBLIC_USE_FIXTURES=true.";
      setExtractError(message);
      setPhase("upload");
    }
  }

  function resetToUpload() {
    setStatuses(ALL_WAITING);
    setErrors([]);
    setExtraction(null);
    setValidation(null);
    setHsPrediction(null);
    setPhase("upload");
  }

  const subtitle = {
    upload: "Upload the trade documents to begin.",
    processing: "Reading and validating your documents…",
    degraded: "Extraction finished with a fallback.",
    review: "Review the extracted data before submitting.",
  }[phase];

  const stepperCurrent = phase === "review" ? 3 : phase === "upload" ? 1 : 2;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader title="New declaration" subtitle={subtitle}>
        {phase === "upload" && (
          <Button size="md" disabled={!allFilesPresent} onClick={handleExtract}>
            <IconPlus size={18} stroke={1.5} />
            Extract data
          </Button>
        )}
      </PageHeader>

      {phase !== "degraded" && <Stepper current={stepperCurrent} />}

      {phase === "upload" && (
        <>
          {extractError && (
            <div className="rounded border border-destructive bg-card px-4 py-3 text-body-sm text-destructive">
              {extractError}
            </div>
          )}
          <UploadZone files={files} onFileChange={handleFileChange} />
        </>
      )}

      {phase === "processing" && (
        <ExtractionProgress documentCount={3} stages={stages} />
      )}

      {phase === "degraded" && (
        <ExtractionDegraded
          stages={stages}
          message={degradedMessage(errors)}
          onRetry={resetToUpload}
          onContinue={() => extraction && proceedToReview(extraction)}
        />
      )}

      {phase === "review" && extraction && validation && (
        <ResultsView
          extraction={extraction}
          validation={validation}
          hsPrediction={hsPrediction}
        />
      )}
    </div>
  );
}
