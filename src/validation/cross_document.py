import difflib
from typing import List, Dict, Any
from .schema import ExtractedDocuments
from .rule_engine import ValidationResult

class CrossDocumentValidator:
    def validate(self, docs: ExtractedDocuments) -> List[ValidationResult]:
        results = []
        
        # 1. Weight Consistency (PL vs BL)
        if docs.packing_list and docs.bill_of_lading:
            pl_weight = docs.packing_list.total_gross_weight
            bl_weight = docs.bill_of_lading.total_gross_weight
            
            if pl_weight is not None and bl_weight is not None:
                if abs(pl_weight - bl_weight) > 0.1: # Allow minor float differences
                    results.append(ValidationResult("cross_doc_weight", False, f"Weight mismatch: PL={pl_weight}, BL={bl_weight}", risk_weight=30))
                else:
                    results.append(ValidationResult("cross_doc_weight", True, "Weight matches between PL and BL.", risk_weight=0))
        
        # 2. Quantity & Description matching (CI vs PL)
        if docs.commercial_invoice and docs.packing_list:
            ci_items = docs.commercial_invoice.items
            pl_items = docs.packing_list.items
            
            # Simple total quantity check
            ci_total_qty = sum(item.quantity for item in ci_items if item.quantity)
            pl_total_qty = sum(item.quantity for item in pl_items if item.quantity)
            
            if abs(ci_total_qty - pl_total_qty) > 0.01:
                results.append(ValidationResult("cross_doc_quantity", False, f"Total quantity mismatch: CI={ci_total_qty}, PL={pl_total_qty}", risk_weight=20))
            else:
                results.append(ValidationResult("cross_doc_quantity", True, "Total quantity matches between CI and PL.", risk_weight=0))
                
            # Item Description Fuzzy Matching
            for i, ci_item in enumerate(ci_items):
                if i < len(pl_items):
                    pl_item = pl_items[i]
                    similarity = difflib.SequenceMatcher(None, ci_item.description.lower(), pl_item.description.lower()).ratio()
                    if similarity < 0.6:
                        results.append(ValidationResult("cross_doc_description", False, f"Item {i+1} description mismatch (Sim: {similarity:.2f}). CI: '{ci_item.description}', PL: '{pl_item.description}'", risk_weight=15))
                    else:
                        results.append(ValidationResult("cross_doc_description", True, f"Item {i+1} description matches well (Sim: {similarity:.2f}).", risk_weight=0))
                else:
                    results.append(ValidationResult("cross_doc_missing_item", False, f"CI item {i+1} not found in PL.", risk_weight=20))
                    
        return results
