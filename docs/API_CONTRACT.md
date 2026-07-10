# API Contract

**The frontend and backend both code against this document.** Any change requires PR approval from both owners (Radit + backend teammate). Extracted from PRD §7 into a standalone doc for easy reference.

Base URL during demo: `http://localhost:8000`

All responses are `Content-Type: application/json` unless stated otherwise. All request bodies are JSON unless stated otherwise (upload endpoint uses multipart).

---

## Endpoint index

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/extract` | Run OCR pipeline on three files |
| POST | `/api/validate` | Run validation intelligence |
| POST | `/api/predict-hs-code` | Suggest HS code for one item |
| POST | `/api/submit-ceisa` | Build CEISA JSON and return simulated ack |
| GET | `/api/health` | Backend health check |

---

## 1. `POST /api/extract`

Runs the full OCR + Layout Intelligence pipeline and returns structured extracted data.

### Request

`Content-Type: multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `commercial_invoice` | file | yes | .pdf / .png / .jpg / .jpeg, max 10 MB |
| `packing_list` | file | yes | same |
| `bill_of_lading` | file | yes | same |

Optional query params:
- `?mode=fixture` — return a canned fixture response for frontend testing (never invokes real pipeline)
- `?cached=true` — return the cached canonical demo run if available

### Response 200

```json
{
  "extraction_id": "ext_abc123",
  "documents": {
    "commercial_invoice": { /* ExtractedInvoice */ },
    "packing_list":       { /* ExtractedPackingList */ },
    "bill_of_lading":     { /* ExtractedBillOfLading */ }
  },
  "ocr_meta": {
    "total_runtime_seconds": 47.3,
    "modules_used": ["docling", "paddleocr", "layoutlmv3", "tabletransformer", "ollama"],
    "errors": []
  }
}
```

**`errors[]` shape:** `{ "stage": "layoutlmv3", "document": "packing_list", "message": "..." }`

### Response 4xx / 5xx

```json
{
  "error_code": "INVALID_FILE_TYPE",
  "message": "commercial_invoice must be PDF, PNG, or JPG",
  "details": { "field": "commercial_invoice", "received_type": "docx" }
}
```

### Standard error codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `INVALID_FILE_TYPE` | 400 | Uploaded file has unsupported extension |
| `FILE_TOO_LARGE` | 400 | Any file exceeds 10 MB |
| `MISSING_FIELD` | 400 | Required file slot is empty |
| `OCR_PIPELINE_FAILURE` | 500 | Non-recoverable pipeline crash |
| `MODEL_UNAVAILABLE` | 503 | LayoutLMv3 / TableTransformer failed to load; recommend `?mode=fixture` |

---

## 2. `POST /api/validate`

Runs the Validation Intelligence Layer on extracted data.

### Request

```json
{
  "extraction_id": "ext_abc123",
  "documents": {
    "commercial_invoice": { /* ExtractedInvoice */ },
    "packing_list":       { /* ExtractedPackingList */ },
    "bill_of_lading":     { /* ExtractedBillOfLading */ }
  }
}
```

### Response 200

```json
{
  "validation_id": "val_xyz789",
  "confidence_score": 54.33,
  "compliance_score": 75.0,
  "risk_level": "High",
  "ml_risk_probability": 99.97,
  "warnings": [
    {
      "severity": "high",
      "rule_id": "PI_BESI_BAJA",
      "message": "Item Besi Baja Coil (HS 720810): Import Permit PI_Besi_Baja required for HS 72.",
      "affected_fields": ["items[0].hs_code"],
      "suggested_fix": "Attach PI_Besi_Baja document or update HS code."
    }
  ],
  "shap_top_features": [
    { "feature": "weight_mismatch",  "value": 0.42, "label": "Weight mismatch across documents" },
    { "feature": "missing_permit",   "value": 0.31, "label": "Missing required import permit" },
    { "feature": "qty_mismatch",     "value": 0.18, "label": "Total quantity mismatch (CI vs PL)" }
  ]
}
```

### Fields

| Field | Type | Range | Meaning |
|---|---|---|---|
| `confidence_score` | float | 0–100 | Aggregate OCR confidence across all documents |
| `compliance_score` | float | 0–100 | Percentage of Permendag rules passed |
| `risk_level` | string | "Low" / "Medium" / "High" | XGBoost risk class |
| `ml_risk_probability` | float | 0–100 | Probability of CEISA rejection per XGBoost |
| `warnings[].severity` | string | "high" / "medium" / "low" | Rendered as color-coded badge |
| `shap_top_features[].value` | float | any | Positive = increases risk, negative = decreases risk |

---

## 3. `POST /api/predict-hs-code`

Suggests an HS code for a line item based on its description. Called from the frontend when a line item's `hs_code` is null or has confidence < 70%.

### Request

```json
{
  "item_description": "Iron Steel Coil, cold-rolled, 3mm thickness",
  "country_of_origin": "China",
  "unit_of_measure": "MT"
}
```

### Response 200

```json
{
  "suggested_hs_code": "720810",
  "confidence": 87,
  "reasoning": "Cold-rolled iron/steel coil matches HS Chapter 72 (Iron and Steel), subheading 720810.",
  "alternative_codes": [
    { "code": "720825", "reasoning": "Also cold-rolled coil but for narrower thickness" },
    { "code": "720839", "reasoning": "General flat-rolled products of iron" }
  ]
}
```

---

## 4. `POST /api/submit-ceisa`

Builds a CEISA-compliant JSON payload from a validated declaration and returns a **simulated** acknowledgment. Does NOT contact real CEISA.

### Request

```json
{ "validation_id": "val_xyz789" }
```

### Response 200

```json
{
  "simulated": true,
  "ceisa_payload": {
    /* full CEISA 4.0-compliant JSON built from ExtractedDocuments */
  },
  "ceisa_ack": {
    "status": "RECEIVED",
    "pib_number": "PIB-2026-123456",
    "received_at": "2026-06-29T14:23:15+07:00",
    "estimated_clearance_lane": "GREEN",
    "response_code": "200",
    "response_message": "Request diterima (request accepted)"
  }
}
```

### Rejected outcome

CEISA (beacukai) assigns a response code to every submission. When the payload
fails validation it returns a domain error code instead of a PIB:

```json
{
  "simulated": true,
  "ceisa_payload": { /* the payload that was sent */ },
  "ceisa_ack": {
    "status": "REJECTED",
    "pib_number": "",
    "received_at": "2026-06-29T14:23:15+07:00",
    "response_code": "1028",
    "response_message": "Elemen mandatory, wajib terdapat pada data json yang dikirimkan (mandatory element missing)"
  }
}
```

**`status`** — `"RECEIVED"` (accepted, PIB assigned) or `"REJECTED"` (no PIB).

**`response_code` / `response_message`** — the code beacukai returns. On accept
it's a REST code (`200`/`201`); on reject it's a CEISA error code (e.g. `1008`,
`1023`, `1028`, `1042`) with the Indonesian description. Source of codes:
`openapi.beacukai.go.id` (REST + Error Response Code pages). The backend relays
whatever beacukai returns; the frontend just displays it.

**`estimated_clearance_lane`** (accepted only) values: `"GREEN"` (low risk,
auto-release), `"YELLOW"` (doc review), `"RED"` (physical inspection). Derived
from our internal risk score, not from real CEISA. Omitted on rejection.

**`simulated: true`** is required in every response from this endpoint. Frontend uses this flag to render the "Demo Mode" label.

---

## 5. `GET /api/health`

Backend health check. Used by frontend on load to verify the backend is up.

### Response 200

```json
{
  "status": "healthy",
  "checks": {
    "ollama": "reachable",
    "paddleocr": "loaded",
    "docling": "loaded",
    "layoutlmv3": "loaded",
    "table_transformer": "loaded",
    "xgboost_model": "loaded"
  },
  "version": "0.1.0"
}
```

### Response 503

If any critical dependency is missing:
```json
{
  "status": "degraded",
  "checks": {
    "ollama": "unreachable",
    "paddleocr": "loaded",
    "docling": "loaded",
    "layoutlmv3": "not_loaded",
    "table_transformer": "loaded",
    "xgboost_model": "loaded"
  },
  "recommendation": "Run with ?mode=fixture until Ollama is restarted"
}
```

---

## 6. CORS

The backend allows origin `http://localhost:3000` during demo. Production CORS hardening is out of scope for the semifinal MVP.

Headers allowed: `Content-Type`, `Authorization` (unused for now).

Methods allowed: `GET`, `POST`, `OPTIONS`.

---

## 7. Rate limiting

None during demo. Post-hackathon: consider limiting `/api/extract` to 1 concurrent request per client since it's compute-heavy.

---

## 8. Versioning

Not versioned yet (single-client demo). If we survive past semifinal, prefix routes with `/api/v1/` before adding V2.

---

## 9. Fixtures for frontend development

While the backend is being built, the frontend should code against `fixtures/*.json` files. Fixtures live in the frontend repo at `apps/dashboard/fixtures/`. Both teams commit to these fixtures matching the shapes above exactly.

| Fixture file | Endpoint |
|---|---|
| `fixtures/extract.json` | `/api/extract` |
| `fixtures/validate.json` | `/api/validate` |
| `fixtures/predict-hs-code.json` | `/api/predict-hs-code` |
| `fixtures/submit-ceisa.json` | `/api/submit-ceisa` |
| `fixtures/health.json` | `/api/health` |

Backend delivers these in Phase 0 as part of the API contract lock (per PRD Phase 0 checklist).
