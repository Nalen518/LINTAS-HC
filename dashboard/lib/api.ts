import { z } from "zod";

// Typed fetch wrappers matching docs/API_CONTRACT.md exactly. Do not invent
// endpoints, fields, or shapes here — update API_CONTRACT.md first.
const BASE_URL = "/api/backend";

const ErrorResponseSchema = z.object({
  error_code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

const HealthResponseSchema = z.object({
  status: z.enum(["healthy", "degraded"]),
  checks: z.record(z.string()),
  version: z.string().optional(),
  recommendation: z.string().optional(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/health`);
  return HealthResponseSchema.parse(await res.json());
}

// POST /api/extract response per API_CONTRACT §1. Document bodies are
// backend-owned Pydantic shapes (schema.py) — passthrough keeps unknown
// fields intact for the review tabs.
const ExtractedDocumentSchema = z
  .object({ document_type: z.string() })
  .passthrough();

const ExtractResponseSchema = z.object({
  extraction_id: z.string(),
  documents: z
    .object({
      commercial_invoice: ExtractedDocumentSchema,
      packing_list: ExtractedDocumentSchema,
      bill_of_lading: ExtractedDocumentSchema,
    })
    .passthrough(),
  ocr_meta: z.object({
    total_runtime_seconds: z.number(),
    modules_used: z.array(z.string()),
    errors: z.array(
      z.object({ stage: z.string(), document: z.string(), message: z.string() }),
    ),
  }),
});
export type ExtractResponse = z.infer<typeof ExtractResponseSchema>;

// Fixture mode (API_CONTRACT §9): develop against fixtures/*.json while the
// backend is being built. Opt-in via NEXT_PUBLIC_USE_FIXTURES=true so it can
// never silently mask a dead backend on demo day.
const USE_FIXTURES = process.env.NEXT_PUBLIC_USE_FIXTURES === "true";
// Long enough for the processing-screen pipeline animation to play through.
const FIXTURE_DELAY_MS = 2600;
// Follow-up calls (validate, predict) run after extraction — keep them snappy.
const FIXTURE_SHORT_MS = 500;

export async function extractDocuments(files: {
  commercial_invoice: File;
  packing_list: File;
  bill_of_lading: File;
}): Promise<ExtractResponse> {
  if (USE_FIXTURES) {
    const fixture = (await import("@/fixtures/extract.json")).default;
    await new Promise((resolve) => setTimeout(resolve, FIXTURE_DELAY_MS));
    return ExtractResponseSchema.parse(fixture);
  }

  const formData = new FormData();
  formData.append("commercial_invoice", files.commercial_invoice);
  formData.append("packing_list", files.packing_list);
  formData.append("bill_of_lading", files.bill_of_lading);

  const res = await fetch(`${BASE_URL}/extract`, { method: "POST", body: formData });
  if (!res.ok) throw ErrorResponseSchema.parse(await res.json());
  return ExtractResponseSchema.parse(await res.json());
}

// POST /api/validate response per API_CONTRACT §2 — the Validation Intelligence
// Layer output (Permendag rules + cross-doc checks + XGBoost/SHAP risk).
const WarningSchema = z.object({
  severity: z.enum(["high", "medium", "low"]),
  rule_id: z.string(),
  message: z.string(),
  affected_fields: z.array(z.string()),
  suggested_fix: z.string(),
});
export type ValidationWarning = z.infer<typeof WarningSchema>;

const ShapFeatureSchema = z.object({
  feature: z.string(),
  value: z.number(),
  label: z.string(),
});
export type ShapFeature = z.infer<typeof ShapFeatureSchema>;

const ValidateResponseSchema = z.object({
  validation_id: z.string(),
  confidence_score: z.number(),
  compliance_score: z.number(),
  risk_level: z.enum(["Low", "Medium", "High"]),
  ml_risk_probability: z.number(),
  warnings: z.array(WarningSchema),
  shap_top_features: z.array(ShapFeatureSchema),
});
export type ValidateResponse = z.infer<typeof ValidateResponseSchema>;

export async function validateDocuments(payload: {
  extraction_id: string;
  documents: unknown;
}): Promise<ValidateResponse> {
  if (USE_FIXTURES) {
    const fixture = (await import("@/fixtures/validate.json")).default;
    await new Promise((resolve) => setTimeout(resolve, FIXTURE_SHORT_MS));
    return ValidateResponseSchema.parse(fixture);
  }
  const res = await fetch(`${BASE_URL}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw ErrorResponseSchema.parse(await res.json());
  return ValidateResponseSchema.parse(await res.json());
}

// POST /api/predict-hs-code response per API_CONTRACT §3.
const PredictHsCodeResponseSchema = z.object({
  suggested_hs_code: z.string(),
  confidence: z.number(),
  reasoning: z.string(),
  alternative_codes: z.array(
    z.object({ code: z.string(), reasoning: z.string() }),
  ),
});
export type PredictHsCodeResponse = z.infer<typeof PredictHsCodeResponseSchema>;

export async function predictHsCode(payload: {
  item_description: string;
  country_of_origin: string;
  unit_of_measure: string;
}): Promise<PredictHsCodeResponse> {
  if (USE_FIXTURES) {
    const fixture = (await import("@/fixtures/predict-hs-code.json")).default;
    await new Promise((resolve) => setTimeout(resolve, FIXTURE_SHORT_MS));
    return PredictHsCodeResponseSchema.parse(fixture);
  }
  const res = await fetch(`${BASE_URL}/predict-hs-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw ErrorResponseSchema.parse(await res.json());
  return PredictHsCodeResponseSchema.parse(await res.json());
}

// POST /api/submit-ceisa response per API_CONTRACT §4. SIMULATED only (ADR-002)
// — `simulated: true` is required in every response and drives the Demo Mode
// label. ceisa_payload is an opaque backend-built object (rendered as JSON).
const CeisaAckSchema = z.object({
  status: z.string(),
  pib_number: z.string(),
  received_at: z.string(),
  estimated_clearance_lane: z.enum(["GREEN", "YELLOW", "RED"]),
});

const SubmitCeisaResponseSchema = z.object({
  simulated: z.literal(true),
  ceisa_payload: z.record(z.unknown()),
  ceisa_ack: CeisaAckSchema,
});
export type SubmitCeisaResponse = z.infer<typeof SubmitCeisaResponseSchema>;

export async function submitCeisa(payload: {
  validation_id: string;
}): Promise<SubmitCeisaResponse> {
  if (USE_FIXTURES) {
    const fixture = (await import("@/fixtures/submit-ceisa.json")).default;
    await new Promise((resolve) => setTimeout(resolve, FIXTURE_SHORT_MS));
    return SubmitCeisaResponseSchema.parse(fixture);
  }
  const res = await fetch(`${BASE_URL}/submit-ceisa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw ErrorResponseSchema.parse(await res.json());
  return SubmitCeisaResponseSchema.parse(await res.json());
}
