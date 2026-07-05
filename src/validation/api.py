from fastapi import FastAPI, HTTPException
from .schema import ExtractedDocuments
from .confidence_engine import ConfidenceEngine
import uvicorn

app = FastAPI(title="Validation Intelligence Layer API")
engine = ConfidenceEngine()

@app.post("/validate")
async def validate_declaration(docs: ExtractedDocuments):
    try:
        result = engine.process_declaration(docs)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
