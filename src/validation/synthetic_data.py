import random
import pandas as pd
import numpy as np
import os

def generate_synthetic_dataset(num_samples=5000):
    data = []
    
    for _ in range(num_samples):
        # 1. OCR Features
        mean_ocr_confidence = np.clip(np.random.normal(85, 10), 0, 100)
        uncertain_tokens_count = int(max(0, np.random.normal(5, 5)))
        
        # 2. Compliance Features (Rule Engine)
        missing_mandatory_fields_count = np.random.choice([0, 1, 2, 3], p=[0.7, 0.2, 0.08, 0.02])
        hs_code_invalid_flag = np.random.choice([0, 1], p=[0.8, 0.2])
        missing_permit_flag = np.random.choice([0, 1], p=[0.85, 0.15])
        
        # 3. Cross-Document Features
        weight_mismatch_flag = np.random.choice([0, 1], p=[0.8, 0.2])
        quantity_mismatch_flag = np.random.choice([0, 1], p=[0.85, 0.15])
        desc_similarity_score = np.clip(np.random.normal(0.9, 0.15), 0, 1.0)
        
        # We will label deterministically based on rules.
        if missing_permit_flag == 1 or hs_code_invalid_flag == 1 or weight_mismatch_flag == 1:
            label = 2 # High Risk
        elif missing_mandatory_fields_count > 0 or quantity_mismatch_flag == 1 or desc_similarity_score < 0.6 or mean_ocr_confidence < 60:
            label = 1 # Medium Risk
        else:
            label = 0 # Low Risk
            
        data.append({
            "mean_ocr_confidence": mean_ocr_confidence,
            "uncertain_tokens_count": uncertain_tokens_count,
            "missing_mandatory_fields_count": missing_mandatory_fields_count,
            "hs_code_invalid_flag": hs_code_invalid_flag,
            "missing_permit_flag": missing_permit_flag,
            "weight_mismatch_flag": weight_mismatch_flag,
            "quantity_mismatch_flag": quantity_mismatch_flag,
            "desc_similarity_score": desc_similarity_score,
            "risk_label": label
        })
        
    df = pd.DataFrame(data)
    return df

if __name__ == "__main__":
    df = generate_synthetic_dataset(5000)
    out_path = os.path.join(os.path.dirname(__file__), "synthetic_customs_data.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated 5000 samples to {out_path}")
