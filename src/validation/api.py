import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional

import uvicorn

from fastapi import FastAPI, HTTPException, File, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from .schema import ExtractedDocuments
from .hs_code_predictor import predict_hs_code
from .confidence_engine import ConfidenceEngine
from . import store
from .extract_pipeline import (
    ExtractError,
    REQUIRED_FIELDS,
    fixture_with_cache_note,
    load_canonical_extract,
    load_fixture_extract,
    run_pipeline,
    validate_upload,
)

app = FastAPI(title="Validation Intelligence Layer API", version="0.1.0")

app.middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

engine = ConfidenceEngine()

def _error_response(error_code: str, message: str, details: Optional[dict] = None, status_code: int = 400):
    return JSONResponse(
        status_code=status_code,
        content={"error_code": error_code, "message": message, "details": details or {}},
    )

class ValidationRequest(BaseModel):
    extraction_id: str
    documents:ExtractedDocuments

class PredictHsCodeRequest(BaseModel):
    item_description: str
    country_of_origin: Optional[str] = None
    unit_of_measure: Optional[str] = None

class SubmitCeisaRequest(BaseModel):
    validation_id: str

@app.post("/api/extract")
async def extract_documents(commercial_invoice: Optional[UploadFile] = File(None),
                            packing_list: Optional[UploadFile] = File(None),
                            bill_of_lading: Optional[UploadFile] = File(None),
                            mode: Optional[str] = Query(None),
                            cached: bool = Query(False)):
    
    uploads = {
        "commercial_invoice": commercial_invoice,
        "packing_list": packing_list,
        "bill_of_lading": bill_of_lading
    }

    files: dict = {}
    try:
        for field in REQUIRED_FIELDS:
            upload = uploads[field]
            filename = upload.filename if upload is not None else None
            data = await upload.read() if upload is not None else b""
            validate_upload(field, filename, data)
            files [field] = (filename, data)
    except ExtractError as e:
        return _error_response(e.error_code, e.message, e.details, e.status_code)
    
    if mode == "fixture":
        response = load_fixture_extract()
        store.extractions[response["extraction_id"]] = response["documents"]
        return response
    
    if cached:
        canonical = load_canonical_extract()
        if canonical is not None:
            store.extractions[canonical["extraction_id"]] = canonical["documents"]
            return canonical
        
        response = fixture_with_cache_note()
        store.extractions[response["extraction_id"]] = response["documents"]
        return response
    
    try:
        return run_pipeline(files)
    except ExtractError as e:
        return _error_response(e.error_code, e.message, e.details, e.status_code)
    except _error_response as e:
        return _error_response("OCR_PIPELINE_FAILURE", str(e), status_code=500)
    



@app.post("/api/validate")
async def validate_declaration(payload: ValidationRequest):
    try:
        result = engine.process_declaration(payload.documents, extraction_id=payload.extraction_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict-hs-code")
async def predict_hs_code_endpoint(payload: PredictHsCodeRequest):
    return predict_hs_code(
        payload.item_description, 
        payload.country_of_origin or "", 
        payload.unit_of_measure or "",
    )

@app.post("/api/submit-ceisa")
async def submit_ceisa(payload: SubmitCeisaRequest):
    record = store.validations.get(payload.validation_id)
    if record is None:
        return _error_response(
            "VALIDATION_NOT_FOUND",
            f"No validation found for validation_id '{payload.validation_id}'.",
            {"validation_id": payload.validation_id},
            status_code=404,
        )
    
    documents: ExtractedDocuments = record["documents"]
    result = record["result"]

    ci = documents.commercial_invoice if documents else None
    first_item = ci.items[0] if ci and ci.items else None
    hs_code = first_item.hs_code if first_item else None
    total_value = ci.total_value if ci else None

    now = datetime.now(timezone(timedelta(hours=7)))    # Time zone WIB

    # No real CEISA numbering system or FX feed exists in this build
    # identifiers are deterministically derived from validation_id so repeat
    # calls are stable; cif_idr uses a flat demo FX rate (not a live rate) and
    # ppn applies Indonesia's current 11% VAT straight to that naive IDR figure.

    digest = hashlib.sha256(payload.validation_id.encode()).hexdigest()
    registration_no = str(int(digest[:6], 16) % 1_000_000).zfill(6)
    nomor_aju = f"{digest[6:12]}-{now.strftime('%m%Y')}-{now.strftime('%d%m%y')}"
    pib_number = f"PIB-{now.year}-{digest[:6]}"

    DEMO_FIX_RATE_IDR_PER_USD = 18000
    cif_idr = round((total_value or 0) * DEMO_FIX_RATE_IDR_PER_USD)
    ppn = round(cif_idr * 0.11)

    ceisa_payload ={
        "registration_no": registration_no,
        "nomor_aju": nomor_aju,
        "pib": pib_number,
        "hs_code": hs_code or "000000",
        "cif_idr": cif_idr,
        "ppn": ppn,
        "status": "RECEIVED",
        "mode": "SIMULATED",
    }

    lane_map = {"Low": "GREEN", "Medium": "YELLOW", "High": "RED"}
    lane = lane_map.get(result.get("risk_level"), "YELLOW")

    return {
        "simulated": True,
        "ceisa_payload": ceisa_payload,
        "ceisa_ack": {
            "status": "RECEIVED",
            "pib_number": pib_number,
            "received_at": now.isoformat(),
            "estimated_clearance_lane": lane,
        },
    }

@app.get("/api/health")
async def healt():
    checks = {}
    try:
        import ollama as ollama_client
        ollama_client.list()
        checks["ollama"] = "reachable"
    except Exception:
        checks["ollama"] = "unreachable"

    try:
        import paddleocr  # noqa: F401
        checks["paddleocr"] = "loaded"
    except Exception:
        checks["paddleocr"] = "not_loaded"

    try:
        import docling  # noqa: F401
        checks["docling"] = "loaded"
    except Exception:
        checks["docling"] = "not_loaded"

    # Never implemented in this codebase (src/module has no layoutlmv3 or
    # table_transformer modules) - reported honestly, but not treated as
    # critical so the endpoint doesn't permanently read "degraded".
    checks["layoutlmv3"] = "not_loaded"
    checks["table_transformer"] = "not_loaded"

    checks["xgboost_model"] = "loaded" if engine.risk_scorer.explainer is not None else "not_loaded"

    critical_ok = (
        checks["ollama"] == "reachable"
        and checks["paddleocr"] == "loaded"
        and checks["docling"] == "loaded"
        and checks["xgboost_model"] == "loaded"
    )

    if critical_ok:
        return {"status": "healthy", "checks": checks, "version": "0.1.0"}

    if checks["ollama"] == "unreachable":
        recommendation = "Run with ?mode=fixture until Ollama is restarted"
    else:
        recommendation = "Run with ?mode=fixture until backend dependencies are restored"

    return JSONResponse(
        status_code=503,
        content={"status": "degraded", "checks": checks, "recommendation": recommendation},
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
