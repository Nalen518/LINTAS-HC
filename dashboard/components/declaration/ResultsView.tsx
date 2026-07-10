"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TabBar } from "@/components/ui/tab-bar";
import { ResultsSummary } from "@/components/declaration/ResultsSummary";
import { ExtractedFieldsTab } from "@/components/declaration/ExtractedFieldsTab";
import { ValidationTab } from "@/components/declaration/ValidationTab";
import { RiskShapTab } from "@/components/declaration/RiskShapTab";
import { HsCodeTab } from "@/components/declaration/HsCodeTab";
import { ImpactTab } from "@/components/declaration/ImpactTab";
import { ConfirmCeisaModal } from "@/components/declaration/ConfirmCeisaModal";
import { CeisaSubmitModal } from "@/components/declaration/CeisaSubmitModal";
import { ShareModal } from "@/components/declaration/ShareModal";
import { flattenExtractedFields } from "@/lib/results";
import {
  submitCeisa,
  type ExtractResponse,
  type ValidateResponse,
  type PredictHsCodeResponse,
  type SubmitCeisaResponse,
} from "@/lib/api";

// The Results review screen (PRD §5.3–5.4): summary + 5 tabs, all rendered
// from the real /api/extract + /api/validate + /api/predict-hs-code responses.
// Figma: 84:534 / 86:337 / 85:296 / 87:378 / 88:419.
const TABS = [
  { id: "fields", label: "Extracted fields" },
  { id: "validation", label: "Validation" },
  { id: "risk", label: "Risk & SHAP" },
  { id: "hs", label: "HS code" },
  { id: "impact", label: "Impact" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type CiItem = { description?: string; hs_code?: string };
type CiDoc = { country_of_origin?: string; items?: CiItem[] };

export function ResultsView({
  extraction,
  validation,
  hsPrediction,
  readOnly = false,
  shareId,
}: {
  extraction: ExtractResponse;
  validation: ValidateResponse;
  hsPrediction: PredictHsCodeResponse | null;
  /** History detail reuses this view without the submit action. */
  readOnly?: boolean;
  /** When set (a PIB), shows a Share action that opens the copy-link modal. */
  shareId?: string;
}) {
  const router = useRouter();
  const [active, setActive] = useState<TabId>("fields");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResponse, setSubmitResponse] =
    useState<SubmitCeisaResponse | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const fields = flattenExtractedFields(extraction.documents);
  const ci = extraction.documents.commercial_invoice as CiDoc;
  const primaryItem = ci?.items?.[0];

  async function handleConfirmSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // SIMULATED submission only (ADR-002) — the backend returns a synthetic
      // acknowledgment; nothing reaches DJBC.
      const response = await submitCeisa({
        validation_id: validation.validation_id,
      });
      setSubmitResponse(response);
      setConfirmOpen(false);
    } catch (err) {
      setSubmitError(
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Submission failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ResultsSummary validation={validation} fields={fields} />

      <div className="flex items-center justify-between">
        <TabBar
          tabs={TABS}
          active={active}
          onChange={(id) => setActive(id as TabId)}
        />
        <div className="flex items-center gap-3">
          {shareId && (
            <Button
              size="md"
              variant="secondary"
              onClick={() => setShareOpen(true)}
            >
              Share
            </Button>
          )}
          {!readOnly && (
            <Button size="md" onClick={() => setConfirmOpen(true)}>
              Continue to submit
            </Button>
          )}
        </div>
      </div>

      <div>
        {active === "fields" && (
          <ExtractedFieldsTab documents={extraction.documents} />
        )}
        {active === "validation" && (
          <ValidationTab
            validation={validation}
            documents={extraction.documents}
          />
        )}
        {active === "risk" && <RiskShapTab validation={validation} />}
        {active === "hs" && (
          <HsCodeTab
            prediction={hsPrediction}
            declaredHsCode={primaryItem?.hs_code ?? null}
            goodsDescription={primaryItem?.description ?? null}
          />
        )}
        {active === "impact" && <ImpactTab documents={extraction.documents} />}
      </div>

      {!readOnly && (
        <>
          <ConfirmCeisaModal
            open={confirmOpen}
            validation={validation}
            submitting={submitting}
            error={submitError}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={handleConfirmSubmit}
          />

          <CeisaSubmitModal
            open={submitResponse !== null}
            response={submitResponse}
            onClose={() => setSubmitResponse(null)}
            onDone={() => router.push("/dashboard")}
          />
        </>
      )}

      {shareId && (
        <ShareModal
          open={shareOpen}
          pibNumber={shareId}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
