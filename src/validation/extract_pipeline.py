import json
import os
import tempfile
import time
import uuid
from pathlib import Path
from typing import Dict, Optional, Tuple

from .schema import CommercialInvoice, PackingList, BillOfLading
from . import store

REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURES_DIR = REPO_ROOT / "dashboard" / "fixtures"

ALLOWED_EXTENSION = {".pdf", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
REQUIRED_FIELDS = ("commercial_invoice", "packing_list", "bill_of_lading")

DOC_MODELS = {
    "commercial_invoice": CommercialInvoice,
    "packing_list": PackingList,
    "bill_of_lading": BillOfLading,
}

# Ollama is used directly as the structuring step (raw docling/paddleocr output
# has no existing mapping into ExtractedDocuments), so each document type gets
# its own prompt asking for exactly the schema.py field names.
DOC_PROMPTS = {
    "commercial_invoice": (
        "Extract data from this Commercial Invoice image. Respond with ONLY a JSON object "
        "with exactly these keys: invoice_number, importer_name, importer_tax_id, currency, "
        "total_value, items (a list of objects with description, quantity, hs_code, unit_price, "
        "total_price). Use null for any value you cannot read."
    ),
    "packing_list": (
        "Extract data from this Packing List image. Respond with ONLY a JSON object with exactly "
        "these keys: pl_number, total_gross_weight, items (a list of objects with description, "
        "quantity, hs_code, unit_price, total_price). Use null for any value you cannot read."
    ),
    "bill_of_lading": (
        "Extract data from this Bill of Lading image. Respond with ONLY a JSON object with exactly "
        "these keys: bl_number, shipper_name, consignee_name, total_gross_weight. Use null for any "
        "value you cannot read."
    ),
}

class ExtractError(Exception):
    def __init__(self, error_code: str, message: str, details: Optional[dict] = None, status_code: int = 400):
        super().__init__(message)
        self.error_code = error_code
        self.message = message
        self.details = details or {}
        self.status_code = status_code

def validate_upload(field: str, filename: Optional[str], data: bytes) -> None:
    if not filename:
        raise Exception("MISSING_FIELD", f"{field} file is required.", {"field": field})

    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSION:
        raise ExtractError("INVALID_FILE_TYPE", 
                            f"{field} must be PDF, PNG, or JPG", 
                            {"field": field, "received_type": ext.lstrip(".") or "unknown"},)
    
    if len(data) > MAX_FILE_SIZE_BYTES:
        raise ExtractError("FILE_TOO_LARGE", f"{field} exceeds the 10 MB limit.", {"field": field})

def load_fixture_extract() -> dict:
    with open(FIXTURES_DIR / "extract.json", "r", encoding="utf-8") as f:
        return json.load(f)

def load_canonical_extract() -> Optional[dict]:
    path = FIXTURES_DIR / "cannonical_run.json"
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        canonical = json.load(f)
    return canonical.get("extract")

def fixture_with_cache_note() -> dict:
    response = json.loads(json.dumps(load_fixture_extract()))
    response["ocr_meta"]["errors"].append({
        "stage": "cache",
        "document": "all", 
        "message":  "canonical_run.json has not been populated yet (extract is still null); falling back to fixture mode.",
    })
    return response

def ollama_reachable() -> bool:
    try:
        import ollama
        ollama.list()
        return True
    except Exception:
        return False
    
def _structure_with_ollama(field: str, path: str):
    from ollama import chat
    response = chat (
        model="qwen2.5vl",
        messages=[{"role": "user", "content": DOC_PROMPTS[field], "images": [path]}],
        format="json",
    )
    parsed = json.loads(response.message.content)
    model_cls = DOC_MODELS[field]
    parsed.setdefault("document_type", model_cls.model_fields["document_type"].default)
    return model_cls(**parsed)

def run_pipeline(files:Dict[str, Tuple[str, bytes]]) -> dict:
    if not ollama_reachable():
        raise ExtractError(
            "MODEL_UNAVAILABLE",
            "Ollama (the document structuring model) is unreachable in this environment.",
            {"recommendation": "Retry the request with ?mode=fixture"},
            status_code=503,
        )
    
    start = time.time()
    errors = []
    modules_used = []
    documents = {
        "commercial_invoice": None,
        "packing_list": None,
        "bill_of_lading": None,
        "import_permits": [],
    }

    with tempfile.TemporaryDirectory(prefix="lintas_extract_") as temp_dir:
        for field, (filename, data) in files.items():
            ext = os.path.splittext(filename)[1].lower() or ".bin"
            path = os.path.join(temp_dir, f"{field}{ext}")

            with open(path, "wb") as fh:
                fh.write(data)

            try: 
                from ..module.docling_module import run_docling
                run_docling(path)
                if "docling" not in modules_used:
                    modules_used.append("docling")
            except Exception as e:
                errors.append({"stage": "docling", "documents": field, "message": str(e)})

            try:
                from ..module.paddle_module import run_paddleocr
                run_paddleocr(path)
                if "paddleocr" not in modules_used:
                    modules_used.append("paddleocr")
            except Exception as e:
                errors.append({"stage": "paddleocr", "document": field, "message": str(e)})

            try:
                documents[field] = _structure_with_ollama(field, path)
                if "ollama" not in modules_used:
                    modules_used.append("ollama")
            except Exception as e:
                errors.append({"stage": "ollama", "document": field, "message": str(e)})


    # LayoutLMv3/TableTransformer are named in the contract/README but were
    # never built in src/module - report this honestly instead of pretending.
    errors.append({
        "stage": "pipeline",
        "document": "all",
        "message": "layoutlmv3 and table_transformer are not implemented in this codebase yet; skipped.",
    })

    extraction_id = f"ext_{uuid.uuid4().hex[:8]}"
    store.extractions[extraction_id] = documents

    return {
        "extraction_id": extraction_id,
        "documents": documents,
        "ocr_meta": {
            "total_runtime_seconds": round(time.time() - start, 2),
            "modules_used": modules_used,
            "errors": errors,
        },
    }
