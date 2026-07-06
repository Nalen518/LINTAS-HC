"use client";

import { useState } from "react";
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
import { extractDocuments, type ExtractResponse } from "@/lib/api";

// New declaration workflow — PRD §5.1–5.5. Phases map to Figma frames:
//   upload     → 69:383  (built)
//   processing → 75:620  (minimal; full Figma build in step 5)
//   review     → 84:534 / 86:337 / 85:296 / 87:378 / 88:419  (step 5)
//   submit     → 94:460 → 96:503  (step 5)
type Phase = "upload" | "processing";

export default function NewDeclarationPage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [files, setFiles] = useState<SlotFiles>(EMPTY_SLOT_FILES);
  const [extraction, setExtraction] = useState<ExtractResponse | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);

  const allFilesPresent = Object.values(files).every(Boolean);

  function handleFileChange(slot: DocumentSlot, file: File | null) {
    setFiles((prev) => ({ ...prev, [slot]: file }));
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
    } catch (err) {
      // ErrorResponse from the contract, zod failure, or network failure —
      // return to upload with an inline message; never crash (ARCHITECTURE §6).
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Backend unreachable — start the FastAPI server or set NEXT_PUBLIC_USE_FIXTURES=true.";
      setExtractError(message);
      setPhase("upload");
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="New declaration"
        subtitle={
          phase === "upload"
            ? "Upload the trade documents to begin."
            : "Reading your documents — this can take a moment."
        }
      >
        {phase === "upload" && (
          <Button size="md" disabled={!allFilesPresent} onClick={handleExtract}>
            <IconPlus size={18} stroke={1.5} />
            Extract data
          </Button>
        )}
      </PageHeader>

      <Stepper current={phase === "upload" ? 1 : 2} />

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
        <ExtractionProgress
          status={extraction ? "done" : "running"}
          runtimeSeconds={extraction?.ocr_meta.total_runtime_seconds}
        />
      )}
    </div>
  );
}
