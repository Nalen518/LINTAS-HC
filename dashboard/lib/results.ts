import type { ExtractResponse, ValidateResponse } from "@/lib/api";

// Derivations that turn the real /api/extract + /api/validate responses into
// the shapes the Results screen renders. No fabricated values — everything
// here is computed from the ML/OCR output.

type Doc = Record<string, unknown> & {
  confidence_scores?: Record<string, number>;
  items?: Record<string, unknown>[];
};

const DOC_ORDER: { key: string; title: string }[] = [
  { key: "commercial_invoice", title: "Commercial Invoice" },
  { key: "packing_list", title: "Packing List" },
  { key: "bill_of_lading", title: "Bill of Lading" },
];

// Display labels for known extraction keys; unknown keys are humanized.
const FIELD_LABELS: Record<string, string> = {
  invoice_number: "Invoice number",
  importer_name: "Importer",
  importer_tax_id: "Importer tax ID (NPWP)",
  currency: "Currency",
  total_value: "Total value",
  pl_number: "Packing list number",
  total_gross_weight: "Gross weight",
  bl_number: "B/L number",
  shipper_name: "Shipper",
  consignee_name: "Consignee",
  description: "Description",
  quantity: "Quantity",
  hs_code: "HS code",
  unit_price: "Unit price",
  total_price: "Total price",
};

function humanize(key: string): string {
  const spaced = key.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function labelFor(key: string): string {
  return FIELD_LABELS[key] ?? humanize(key);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return value.toLocaleString("en-US");
  return String(value);
}

export type ExtractedFieldRow = {
  label: string;
  value: string;
  /** OCR confidence 0–1, or null when the stage did not score this field. */
  confidence: number | null;
};

export type ExtractedFieldGroup = { title: string; rows: ExtractedFieldRow[] };

export type ExtractedFieldsSummary = {
  groups: ExtractedFieldGroup[];
  fieldCount: number;
  /** Mean confidence over scored fields, 0–1. */
  avgConfidence: number;
};

export function flattenExtractedFields(
  documents: ExtractResponse["documents"],
): ExtractedFieldsSummary {
  const groups: ExtractedFieldGroup[] = [];
  let confSum = 0;
  let confCount = 0;
  let fieldCount = 0;

  for (const { key, title } of DOC_ORDER) {
    const doc = (documents as Record<string, Doc | undefined>)[key];
    if (!doc) continue;
    const scores = doc.confidence_scores ?? {};
    const rows: ExtractedFieldRow[] = [];

    for (const [fieldKey, value] of Object.entries(doc)) {
      if (
        fieldKey === "document_type" ||
        fieldKey === "confidence_scores" ||
        fieldKey === "items"
      )
        continue;
      const confidence =
        typeof scores[fieldKey] === "number" ? scores[fieldKey] : null;
      rows.push({ label: labelFor(fieldKey), value: formatValue(value), confidence });
    }

    const items = Array.isArray(doc.items) ? doc.items : [];
    items.forEach((item, i) => {
      const prefix = items.length > 1 ? `Item ${i + 1} · ` : "Item · ";
      for (const [fieldKey, value] of Object.entries(item)) {
        if (value === null || value === undefined) continue;
        rows.push({
          label: prefix + labelFor(fieldKey),
          value: formatValue(value),
          confidence: null,
        });
      }
    });

    for (const row of rows) {
      fieldCount += 1;
      if (row.confidence !== null) {
        confSum += row.confidence;
        confCount += 1;
      }
    }
    if (rows.length) groups.push({ title, rows });
  }

  return {
    groups,
    fieldCount,
    avgConfidence: confCount ? confSum / confCount : 0,
  };
}

// Resolve a warning's affected_fields path ("packing_list.total_gross_weight",
// "items[0].hs_code") against the documents, for the evidence chips.
export function resolveFieldPath(
  documents: ExtractResponse["documents"],
  path: string,
): string | null {
  const parts = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
  let current: unknown = documents;
  for (const part of parts) {
    if (current && typeof current === "object") {
      current = (current as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }
  if (current === null || current === undefined) return null;
  return formatValue(current);
}

// The risk score shown in the summary is the XGBoost rejection probability
// (ml_risk_probability, 0–100) — the model's actual risk output.
export function riskScore(validation: ValidateResponse): number {
  return Math.round(validation.ml_risk_probability);
}

export function topRiskFactors(validation: ValidateResponse, limit = 3): string {
  return validation.shap_top_features
    .slice(0, limit)
    .map((f) => f.label)
    .join(" · ");
}
