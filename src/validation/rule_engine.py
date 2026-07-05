import json
import os
from typing import List, Dict, Any
from .schema import ExtractedDocuments

class ValidationResult:
    def __init__(self, rule_type: str, passed: bool, message: str, risk_weight: int = 0):
        self.rule_type = rule_type
        self.passed = passed
        self.message = message
        self.risk_weight = risk_weight

    def to_dict(self):
        return {
            "rule_type": self.rule_type,
            "passed": self.passed,
            "message": self.message,
            "risk_weight": self.risk_weight
        }

class PermendagRuleEngine:
    def __init__(self, rules_path: str = None):
        if rules_path is None:
            rules_path = os.path.join(os.path.dirname(__file__), 'rules.json')
        
        with open(rules_path, 'r') as f:
            self.rules = json.load(f)

    def evaluate(self, docs: ExtractedDocuments) -> List[ValidationResult]:
        results = []
        
        # Check mandatory fields
        for rule in self.rules.get("mandatory_fields", []):
            doc_name = rule["document"]
            field = rule["field"]
            message = rule["message"]
            
            doc_obj = getattr(docs, doc_name, None)
            if doc_obj:
                val = getattr(doc_obj, field, None)
                if val is None or val == "":
                    results.append(ValidationResult("mandatory_field", False, message, risk_weight=10))
                else:
                    results.append(ValidationResult("mandatory_field", True, f"{field} is present.", risk_weight=0))
            else:
                results.append(ValidationResult("mandatory_field", False, f"Document {doc_name} is missing. {message}", risk_weight=10))

        # Check HS Code restrictions (Iterate over items in CI)
        if docs.commercial_invoice:
            for item in docs.commercial_invoice.items:
                if not item.hs_code:
                    continue
                
                # Check rules
                for rule in self.rules.get("hs_code_restrictions", []):
                    prefix = rule["prefix"]
                    if str(item.hs_code).startswith(prefix):
                        required_permits = rule["required_permits"]
                        message = rule["message"]
                        risk_weight = rule["risk_weight"]
                        
                        missing_permits = [p for p in required_permits if p not in docs.import_permits]
                        if missing_permits:
                            results.append(ValidationResult("hs_code_restriction", False, f"Item {item.description} (HS: {item.hs_code}): {message} Missing: {missing_permits}", risk_weight=risk_weight))
                        else:
                            results.append(ValidationResult("hs_code_restriction", True, f"Item {item.description} (HS: {item.hs_code}) has all required permits.", risk_weight=0))
        
        return results

    def get_compliance_score(self, results: List[ValidationResult]) -> float:
        # Base score 100, deduct risk weights
        score = 100
        for r in results:
            if not r.passed:
                score -= r.risk_weight
        return max(0.0, float(score))
