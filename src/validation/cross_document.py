import difflib
from typing import List
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
                if abs(pl_weight - bl_weight) > 0.1:  # Allow minor float differences
                    results.append(ValidationResult(
                        "cross_doc_weight", False,
                        f"Gross weight differs between Packing List ({pl_weight:g} kg) and Bill of Lading ({bl_weight:g} kg).",
                        risk_weight=30,
                        rule_id="WEIGHT_MISMATCH", severity="medium",
                        affected_fields=["packing_list.total_gross_weight", "bill_of_lading.total_gross_weight"],
                        suggested_fix="Confirm correct gross weight with shipper before submission.",
                    ))
                else:
                    results.append(ValidationResult(
                        "cross_doc_weight", True, "Weight matches between PL and BL.", risk_weight=0,
                        rule_id="WEIGHT_MATCH", severity="low",
                        affected_fields=["packing_list.total_gross_weight", "bill_of_lading.total_gross_weight"],
                    ))

        # 2. Quantity & Description matching (CI vs PL)
        if docs.commercial_invoice and docs.packing_list:
            ci_items = docs.commercial_invoice.items
            pl_items = docs.packing_list.items

            # Simple total quantity check
            ci_total_qty = sum(item.quantity for item in ci_items if item.quantity)
            pl_total_qty = sum(item.quantity for item in pl_items if item.quantity)

            if abs(ci_total_qty - pl_total_qty) > 0.01:
                results.append(ValidationResult(
                    "cross_doc_quantity", False,
                    f"Total quantity mismatch: CI={ci_total_qty}, PL={pl_total_qty}",
                    risk_weight=20,
                    rule_id="QTY_MISMATCH", severity="medium",
                    affected_fields=["commercial_invoice.items", "packing_list.items"],
                    suggested_fix="Reconcile total quantities between the Commercial Invoice and Packing List.",
                ))
            else:
                results.append(ValidationResult(
                    "cross_doc_quantity", True, "Total quantity matches between CI and PL.", risk_weight=0,
                    rule_id="QTY_MATCH", severity="low",
                    affected_fields=["commercial_invoice.items", "packing_list.items"],
                ))

            # Item Description Fuzzy Matching
            for i, ci_item in enumerate(ci_items):
                if i < len(pl_items):
                    pl_item = pl_items[i]
                    similarity = difflib.SequenceMatcher(None, ci_item.description.lower(), pl_item.description.lower()).ratio()
                    if similarity < 0.6:
                        results.append(ValidationResult(
                            "cross_doc_description", False,
                            f"Item {i+1} description mismatch (Sim: {similarity:.2f}). CI: '{ci_item.description}', PL: '{pl_item.description}'",
                            risk_weight=15,
                            rule_id=f"DESC_MISMATCH_{i}", severity="low",
                            affected_fields=[f"commercial_invoice.items[{i}].description", f"packing_list.items[{i}].description"],
                            suggested_fix="Verify the item description is consistent across the Commercial Invoice and Packing List.",
                        ))
                    else:
                        results.append(ValidationResult(
                            "cross_doc_description", True,
                            f"Item {i+1} description matches well (Sim: {similarity:.2f}).", risk_weight=0,
                            rule_id=f"DESC_MATCH_{i}", severity="low",
                            affected_fields=[f"commercial_invoice.items[{i}].description", f"packing_list.items[{i}].description"],
                        ))
                else:
                    results.append(ValidationResult(
                        "cross_doc_missing_item", False, f"CI item {i+1} not found in PL.", risk_weight=20,
                        rule_id=f"MISSING_PL_ITEM_{i}", severity="high",
                        affected_fields=[f"commercial_invoice.items[{i}]"],
                        suggested_fix="Add the corresponding line item to the Packing List or remove it from the Invoice.",
                    ))

        return results
