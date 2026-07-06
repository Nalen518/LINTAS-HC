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
const FIXTURE_DELAY_MS = 1400;

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

export async function validateDocuments(payload: { extraction_id: string; documents: unknown }) {
  const res = await fetch(`${BASE_URL}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw ErrorResponseSchema.parse(await res.json());
  return res.json();
}

export async function predictHsCode(payload: {
  item_description: string;
  country_of_origin: string;
  unit_of_measure: string;
}) {
  const res = await fetch(`${BASE_URL}/predict-hs-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw ErrorResponseSchema.parse(await res.json());
  return res.json();
}

export async function submitCeisa(payload: { validation_id: string }) {
  const res = await fetch(`${BASE_URL}/submit-ceisa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw ErrorResponseSchema.parse(await res.json());
  return res.json();
}
