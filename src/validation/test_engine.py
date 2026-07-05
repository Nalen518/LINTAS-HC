import json
import time
import os
import sys

# Ensure the root of the project is in the path so imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from src.validation.confidence_engine import ConfidenceEngine
from src.validation.schema import ExtractedDocuments

def main():
    print("Initializing Confidence Engine (Loading XGBoost and Rules)...")
    engine = ConfidenceEngine()
    
    # Create a synthetic mock JSON payload simulating OCR output
    # Scenario: Missing Permit (High Risk) + Weight Mismatch + Quantity Mismatch
    test_payload = {
        "commercial_invoice": {
            "document_type": "Commercial Invoice",
            "invoice_number": "INV-2026-001",
            "importer_name": "PT. Indonesia Global Trading",
            "importer_tax_id": "01.234.567.8-000.000",
            "currency": "USD",
            "total_value": 50000.0,
            "items": [
                {
                    "description": "Besi Baja Coil",
                    "quantity": 100,
                    "hs_code": "720810",
                    "unit_price": 500.0,
                    "total_price": 50000.0
                }
            ],
            "confidence_scores": {
                "importer_name": 98.5,
                "hs_code": 45.0, # low confidence OCR reading
                "total_value": 99.0
            }
        },
        "packing_list": {
            "document_type": "Packing List",
            "pl_number": "PL-2026-001",
            "total_gross_weight": 2500.0, # 2.5 Tons
            "items": [
                {
                    "description": "Besi Baja Rolled Coil", # Fuzzy match
                    "quantity": 90, # Quantity mismatch (100 in CI)
                    "hs_code": None,
                    "unit_price": None,
                    "total_price": None
                }
            ],
            "confidence_scores": {
                "total_gross_weight": 90.0
            }
        },
        "bill_of_lading": {
            "document_type": "Bill of Lading",
            "bl_number": "BL-998877",
            "total_gross_weight": 2550.0, # Weight mismatch (2500 in PL)
            "confidence_scores": {
                "total_gross_weight": 88.0
            }
        },
        "import_permits": [] # Missing the PI_Besi_Baja permit required for HS 72!
    }
    
    print("\n[+] Parsing input payload to schema...")
    docs = ExtractedDocuments(**test_payload)
    
    print("\n[+] Running Validation Engine...")
    start_time = time.time()
    result = engine.process_declaration(docs)
    latency = time.time() - start_time
    
    print(f"\n======== VALIDATION RESULTS ({latency*1000:.2f} ms) ========")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
