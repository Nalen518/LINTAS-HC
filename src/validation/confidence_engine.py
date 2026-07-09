import uuid
from typing import Dict, Any, List, Optional
from .schema import ExtractedDocuments
from .rule_engine import PermendagRuleEngine
from .cross_document import CrossDocumentValidator
from .ml_scoring import RiskScorer
from . import store

class ConfidenceEngine:
    def __init__(self):
        self.rule_engine = PermendagRuleEngine()
        self.cross_doc_validator = CrossDocumentValidator()
        self.risk_scorer = RiskScorer()

    def process_declaration(self, docs: ExtractedDocuments, extraction_id: Optional[str]) -> Dict[str, Any]:
        # 1. Evaluate Permendag Rules
        rule_results = self.rule_engine.evaluate(docs)
        compliance_score = self.rule_engine.get_compliance_score(rule_results)
        
        # 2. Evaluate Cross-Document Validation
        cross_doc_results = self.cross_doc_validator.validate(docs)
        
        # Calculate Cross-Doc Consistency Score
        cross_doc_score = 100
        for r in cross_doc_results:
            if not r.passed:
                cross_doc_score -= r.risk_weight
        cross_doc_score = max(0, cross_doc_score)
        
        # 3. Calculate Overall OCR Quality (mean of field level scores)
        ocr_scores = []
        if docs.commercial_invoice:
            ocr_scores.extend(docs.commercial_invoice.confidence_scores.values())
        if docs.packing_list:
            ocr_scores.extend(docs.packing_list.confidence_scores.values())
        if docs.bill_of_lading:
            ocr_scores.extend(docs.bill_of_lading.confidence_scores.values())
            
        mean_ocr_confidence = sum(ocr_scores)/len(ocr_scores) if ocr_scores else 100.0
        
        # 4. Extract ML Features
        missing_mandatory_fields_count = sum(1 for r in rule_results if r.rule_type == 'mandatory_field' and not r.passed)
        hs_code_invalid_flag = 1 if any(r.rule_type == 'hs_code_restriction' and not r.passed for r in rule_results) else 0
        missing_permit_flag = 1 if any('Missing' in r.message for r in rule_results if not r.passed) else 0
        
        weight_mismatch_flag = 1 if any(r.rule_type == 'cross_doc_weight' and not r.passed for r in cross_doc_results) else 0
        quantity_mismatch_flag = 1 if any(r.rule_type == 'cross_doc_quantity' and not r.passed for r in cross_doc_results) else 0
        
        # 5. Predict ML Risk
        ml_features = {
            "mean_ocr_confidence": mean_ocr_confidence,
            "uncertain_tokens_count": sum(1 for s in ocr_scores if s < 80.0),
            "missing_mandatory_fields_count": missing_mandatory_fields_count,
            "hs_code_invalid_flag": hs_code_invalid_flag,
            "missing_permit_flag": missing_permit_flag,
            "weight_mismatch_flag": weight_mismatch_flag,
            "quantity_mismatch_flag": quantity_mismatch_flag,
            "desc_similarity_score": 1.0 # default if no mismatch found
        }
        
        for r in cross_doc_results:
            if r.rule_type == 'cross_doc_description' and 'Sim:' in r.message:
                try:
                    sim_str = r.message.split('Sim: ')[1].split(')')[0]
                    ml_features["desc_similarity_score"] = float(sim_str)
                except:
                    pass
                break
                
        ml_result = self.risk_scorer.predict_risk(ml_features)
        
        # 6. Final Confidence Score Formula
        # Confidence Score = (0.2 * OCR_Quality) + (0.3 * Cross_Doc_Consistency) + (0.3 * Compliance_Score) + (0.2 * (100 - ML_Risk_Probability))
        ml_risk_probability = ml_result["high_risk_probability"] * 100
        
        final_score = (0.2 * mean_ocr_confidence) + \
                      (0.3 * cross_doc_score) + \
                      (0.3 * compliance_score) + \
                      (0.2 * (100 - ml_risk_probability))
                      
        risk_level = "Low"
        if final_score < 50 or ml_risk_probability > 60:
            risk_level = "High"
        elif final_score < 75 or ml_risk_probability > 30:
            risk_level = "Medium"
            
        # Compile warnings
        warnings = []
        for r in rule_results + cross_doc_results:
            if not r.passed:
                warnings.append(r.to_warning())

        validation_id = f"val_{uuid.uuid4().hex[:8]}"

        result = {
            "validation_id": validation_id,
            "confidence_score": round(final_score, 2),
            "compliance_score": compliance_score,
            "risk_level": risk_level,
            "ml_risk_probability": round(ml_risk_probability, 2),
            "warnings": warnings,
            "shap_top_features": ml_result.get("shap_top_features", []),
        }   

        store.validations[validation_id] = {
            "extraction_id": extraction_id,
            "documents": docs,
            "result": result,
        }

        return result


        # # Add SHAP explanations if not already present
        # for w in ml_result["top_warnings"]:
        #     if not any(w in existing_w for existing_w in warnings):
        #         warnings.append(f"AI Explainer Note: {w} contributed to the risk score.")
                
        # return {
        #     "confidence_score": round(final_score, 2),
        #     "risk_level": risk_level,
        #     "compliance_score": compliance_score,
        #     "ml_risk_probability": round(ml_risk_probability, 2),
        #     "warnings": warnings,
        #     "ml_explanations": ml_result["top_warnings"]
        # }
