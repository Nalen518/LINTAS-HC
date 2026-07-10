import os
import xgboost as xgb
import shap
import pandas as pd
import numpy as np

class RiskScorer:
    def __init__(self, model_path: str = None):
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), "xgboost_risk_model.json")
        
        self.model = xgb.XGBClassifier()
        if os.path.exists(model_path):
            self.model.load_model(model_path)
            self.explainer = shap.TreeExplainer(self.model)
        else:
            print(f"Warning: Model not found at {model_path}")
            self.explainer = None
        
        self.feature_names = [
            "mean_ocr_confidence",
            "uncertain_tokens_count",
            "missing_mandatory_fields_count",
            "hs_code_invalid_flag",
            "missing_permit_flag",
            "weight_mismatch_flag",
            "quantity_mismatch_flag",
            "desc_similarity_score"
        ]
        
        self.feature_descriptions = {
            "mean_ocr_confidence": "Low overall OCR confidence",
            "uncertain_tokens_count": "High number of uncertain OCR tokens",
            "missing_mandatory_fields_count": "Missing mandatory document fields",
            "hs_code_invalid_flag": "Invalid or restricted HS Code detected",
            "missing_permit_flag": "Missing required import permit",
            "weight_mismatch_flag": "Weight mismatch across documents",
            "quantity_mismatch_flag": "Quantity mismatch across documents",
            "desc_similarity_score": "Significant discrepancy in item descriptions"
        }

    def predict_risk(self, features: dict):
        if not self.explainer:
            return {"high_risk_probability": 0.0, "top_warnings": ["Model not loaded."], "shap_top_features": []}
            
        df = pd.DataFrame([features])
        df = df[self.feature_names]
        
        # Predict probabilities
        probs = self.model.predict_proba(df)[0]
        high_risk_prob = probs[2]
        
        # Get SHAP values
        shap_values = self.explainer.shap_values(df)
        
        # Handle SHAP multi-class format variations based on version
        if isinstance(shap_values, list):
            high_risk_shap = shap_values[2][0]
        else:
            if len(shap_values.shape) == 3:
                 high_risk_shap = shap_values[0, :, 2]
            else:
                 high_risk_shap = shap_values[0]
        
        # Find top contributing features (positive shap pushes risk higher)
        contributions = []
        for i, feat_name in enumerate(self.feature_names):
            
            # If the feature contribution to the High Risk class is positive
            if high_risk_shap[i] > 0.05: # Small threshold to avoid noise
                contributions.append({
                    "feature": feat_name,
                    "contribution": high_risk_shap[i],
                    "warning_message": self.feature_descriptions.get(feat_name, feat_name)
                })
                
        # Sort by contribution descending
        contributions = sorted(contributions, key=lambda x: x["contribution"], reverse=True)
        top_warnings = [c["warning_message"] for c in contributions[:3]]
        shap_top_features = [
            {
                "feature": c["feature"],
                "value": round(float(c["contribution"]), 4),
                "label": c["warning_message"],
            }
            for c in contributions[:3]
        ]

        return {
            "high_risk_probability": float(high_risk_prob),
            "top_warnings": top_warnings,
            "shap_top_features": shap_top_features
        }
