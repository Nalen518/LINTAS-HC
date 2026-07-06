# AI-Powered Customs Declaration Automation Platform

This project automates the extraction and validation of Indonesian customs workflows. It combines PaddleOCR, Docling, LayoutLMv3, TableTransformer, and Ollama for extracting text from trade documents (Commercial Invoice, Packing List, Bill of Lading) and pipes it into an **Explainable ML Validation Intelligence Layer** to predict CEISA rejection risks based on Permendag rules.

## Full Documentation

Complete project documentation lives outside this repo, at `../../docs/`. Read in this order:

1. **`../../PRD.md`** — Product Requirements Document (scope, features, success criteria)
2. **`../../docs/README.md`** — Documentation index (start here for onboarding)
3. **`../../docs/GLOSSARY.md`** — Acronyms, Indonesian customs terms, technical terms
4. **`../../docs/ARCHITECTURE.md`** — Component diagram, data flow, design rationale
5. **`../../docs/TECH_STACK.md`** — Every library with reasoning and rejected alternatives
6. **`../../docs/USER_STORIES.md`** — Detailed user stories per epic
7. **`../../docs/API_CONTRACT.md`** — Frontend/backend API contract
8. **`../../docs/REFERENCES.md`** — Sources, citations, competitor analysis
9. **`../../docs/DECISIONS.md`** — Architecture Decision Records (ADR log)

If you clone only this code repository, you will not have the docs.

---
## Docker Setup (Recommended)

You can containerize and run the platform using Docker:

```bash
# 1. Build the Docker image
docker build -t customs-ai .

# 2. (Optional) Run the FastAPI validation server (exposed on port 8000)
docker run -p 8000:8000 customs-ai

# 3. Run the end-to-end pipeline script directly inside the container
docker run -it customs-ai python src/main.py
docker run -it customs-ai python src/[file]
```

## Manual Setup

### 1. Prerequisites & Installation
Make sure you have Python 3.11+ installed.

```bash
# Create and activate a virtual environment (Windows)
python -m venv .venv
.venv\Scripts\activate

# Install all required dependencies
pip install -r requirements.txt
```

### 2. Generating Data & Training the ML Model
Before running the main application, you need to generate the synthetic customs dataset and train the XGBoost risk model.

```bash
# Generate synthetic customs records & train the XGBoost model
python src/validation/train_model.py
```
*(If `synthetic_customs_data.csv` is missing, you may need to run `python src/validation/synthetic_data.py` first).*

---

## How to Run the End-to-End Pipeline

To process an image (`./images/4.png`), run Docling, PaddleOCR, Ollama, and finally validate it through the Intelligence Layer:

```bash
python src/main.py
```

### What happens when you run this?
1. **Extraction**: Docling, PaddleOCR, and Ollama will scan the document in `./images/4.png` and extract the raw text.
2. **Formatting**: The extracted text is mapped into our structured Python dictionary (`ExtractedDocuments` schema).
3. **Rule Checking**: The Permendag Rule Engine checks if mandatory fields and required import permits (like `PI_Besi_Baja` for HS Code 72) are present.
4. **Cross-Document Check**: Validates that Quantities and Weights match across the Invoice, Packing List, and Bill of Lading.
5. **Risk Scoring**: The XGBoost model calculates a High/Medium/Low risk probability. The **SHAP AI Explainer** explains *exactly why* the score was given.

### Expected Output Example
At the end of the script execution, you will see a structured Validation JSON output printed to your terminal:
```json
{
  "confidence_score": 54.33,
  "risk_level": "High",
  "compliance_score": 75.0,
  "ml_risk_probability": 99.97,
  "warnings": [
    "Item Besi Baja Coil (HS: 720810): Import Permit (PI_Besi_Baja) required for Iron and Steel (HS 72). Missing: ['PI_Besi_Baja']",
    "Weight mismatch: PL=2500.0, BL=2550.0",
    "Total quantity mismatch: CI=100.0, PL=90.0",
    "AI Explainer Note: Weight mismatch across documents contributed to the risk score.",
    "AI Explainer Note: Missing required import permit contributed to the risk score."
  ]
}
```

---

## Running the FastAPI Server (Optional)
If you are building a frontend dashboard, you can spin up the Validation Engine as a REST API:

```bash
uvicorn src.validation.api:app --host 0.0.0.0 --port 8000
```
Navigate to **http://localhost:8000/docs** in your browser to interact with the Swagger UI and test the API!

---

