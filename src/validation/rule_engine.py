import json
import os
from typing import List, Dict, Any, Optional
from .schema import ExtractedDocuments

class ValidationResult:
    def __init__(
        self,
        rule_type: str,
        passed: bool,
        message: str,
        risk_weight: int = 0,
        rule_id: str = "UNKNOWN",
        severity: str = "low",
        affected_fields: Optional[List[str]] = None,
        suggested_fix: str = "",
    ):
        self.rule_type = rule_type
        self.passed = passed
        self.message = message
        self.risk_weight = risk_weight
        self.rule_id = rule_id
        self.severity = severity
        self.affected_fields = affected_fields or []
        self.suggested_fix = suggested_fix

    def to_dict(self):
        return {
            "rule_type": self.rule_type,
            "passed": self.passed,
            "message": self.message,
            "risk_weight": self.risk_weight,
            "rule_id": self.rule_id,
            "severity": self.severity,
            "affected_fields": self.affected_fields,
            "suggested_fix": self.suggested_fix,
        }

    def to_warning(self):
        return {
            "severity": self.severity,
            "rule_id": self.rule_id,
            "message": self.message,
            "affected_fields": self.affected_fields,
            "suggested_fix": self.suggested_fix,
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
            rule_id = rule.get("rule_id", f"MISSING_{field.upper()}")
            severity = rule.get("severity", "medium")
            suggested_fix = rule.get("suggested_fix", "")

            doc_obj = getattr(docs, doc_name, None)
            if doc_obj:
                val = getattr(doc_obj, field, None)
                if val is None or val == "":
                    results.append(ValidationResult(
                        "mandatory_field", False, message, risk_weight=10,
                        rule_id=rule_id, severity=severity,
                        affected_fields=[f"{doc_name}.{field}"],
                        suggested_fix=suggested_fix,
                    ))
                else:
                    results.append(ValidationResult(
                        "mandatory_field", True, f"{field} is present.", risk_weight=0,
                        rule_id=rule_id, severity="low",
                        affected_fields=[f"{doc_name}.{field}"],
                    ))
            else:
                results.append(ValidationResult(
                    "mandatory_field", False, f"Document {doc_name} is missing. {message}", risk_weight=10,
                    rule_id=f"MISSING_DOCUMENT_{doc_name.upper()}", severity="high",
                    affected_fields=[doc_name],
                    suggested_fix=f"Upload the {doc_name.replace('_', ' ')} document.",
                ))

        # Check HS Code restrictions (Iterate over items in CI)
        if docs.commercial_invoice:
            for i, item in enumerate(docs.commercial_invoice.items):
                if not item.hs_code:
                    continue

                # Check rules
                for rule in self.rules.get("hs_code_restrictions", []):
                    prefix = rule["prefix"]
                    if str(item.hs_code).startswith(prefix):
                        required_permits = rule["required_permits"]
                        message = rule["message"]
                        risk_weight = rule["risk_weight"]
                        rule_id = rule.get("rule_id", f"HS_{prefix}")
                        severity = rule.get("severity", "medium")
                        suggested_fix = rule.get("suggested_fix", "")

                        missing_permits = [p for p in required_permits if p not in docs.import_permits]
                        if missing_permits:
                            results.append(ValidationResult(
                                "hs_code_restriction", False,
                                f"Item {item.description} (HS {item.hs_code}): {message}",
                                risk_weight=risk_weight,
                                rule_id=rule_id, severity=severity,
                                affected_fields=[f"items[{i}].hs_code"],
                                suggested_fix=suggested_fix,
                            ))
                        else:
                            results.append(ValidationResult(
                                "hs_code_restriction", True,
                                f"Item {item.description} (HS {item.hs_code}) has all required permits.",
                                risk_weight=0, rule_id=rule_id, severity="low",
                                affected_fields=[f"items[{i}].hs_code"],
                            ))

        return results

    def get_compliance_score(self, results: List[ValidationResult]) -> float:
        # Base score 100, deduct risk weights
        score = 100
        for r in results:
            if not r.passed:
                score -= r.risk_weight
        return max(0.0, float(score))
