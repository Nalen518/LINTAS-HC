"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TabBar } from "@/components/ui/tab-bar";
import { ResultsSummary } from "@/components/declaration/ResultsSummary";
import { ExtractedFieldsTab } from "@/components/declaration/ExtractedFieldsTab";
import { ValidationTab } from "@/components/declaration/ValidationTab";
import { RiskShapTab } from "@/components/declaration/RiskShapTab";
import { HsCodeTab } from "@/components/declaration/HsCodeTab";
import { ImpactTab } from "@/components/declaration/ImpactTab";
import { flattenExtractedFields } from "@/lib/results";
import type {
  ExtractResponse,
  ValidateResponse,
  PredictHsCodeResponse,
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
  onSubmit,
}: {
  extraction: ExtractResponse;
  validation: ValidateResponse;
  hsPrediction: PredictHsCodeResponse | null;
  onSubmit: () => void;
}) {
  const [active, setActive] = useState<TabId>("fields");
  const fields = flattenExtractedFields(extraction.documents);

  const ci = extraction.documents.commercial_invoice as CiDoc;
  const primaryItem = ci?.items?.[0];

  return (
    <div className="flex flex-col gap-6">
      <ResultsSummary validation={validation} fields={fields} />

      <div className="flex items-center justify-between">
        <TabBar
          tabs={TABS}
          active={active}
          onChange={(id) => setActive(id as TabId)}
        />
        <Button size="md" onClick={onSubmit}>
          Continue to submit
        </Button>
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
    </div>
  );
}
