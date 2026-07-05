from module.paddle_module import run_paddleocr
from module.docling_module import run_docling
from module.ollama_module import run_ollama
import time
import os


def main():
    source = "./images/4.png"

    path = "output"
    if not os.path.exists(path):
        os.makedirs(path)
    


    # 1. Docling
    start_time = time.time()
    print("--- Running Docling ---")
    md_output = run_docling(source)
    print(md_output)
    with open("./output/docling.json","w") as f:
        f.write(md_output)
    end_time = time.time()
    print(f"Docling finished in: {end_time - start_time:.2f} seconds")

    # 2. PaddleOCR
    start_time = time.time()
    print("\n--- Running PaddleOCR ---")
    run_paddleocr(source)
    end_time = time.time()
    print(f"PaddleOCR finished in: {end_time - start_time:.2f} seconds")

    # 3. ollama
    start_time = time.time()
    print("\n--- Running ollama ---")
    ollamaOutput=run_ollama(source) or ""
    with open("./output/ollama.json","w") as f:
        f.write(ollamaOutput)
    end_time = time.time()
    print(f"ollama finished in: {end_time - start_time:.2f} seconds")

    # 4. Validation Intelligence Layer Integration
    # This is where your friend's PaddleOCR / Ollama JSON output gets mapped to our ExtractedDocuments schema!
    from validation.schema import ExtractedDocuments
    from validation.confidence_engine import ConfidenceEngine
    import json
    
    print("\n--- Running Validation Intelligence Layer ---")
    # TODO for your friend: Map the data from `ollamaOutput` or PaddleOCR to this dictionary format:
    mapped_data = {
        "commercial_invoice": {
            "document_type": "Commercial Invoice",
            "invoice_number": "INV-123",
            "importer_name": "PT Example",
            "importer_tax_id": "01.23",
            "currency": "USD",
            "total_value": 1000.0,
            "items": [],
            "confidence_scores": {}
        },
        # "packing_list": {...},
        # "bill_of_lading": {...}
    }
    
    # 1. Parse it using our schema
    docs = ExtractedDocuments(**mapped_data)
    
    # 2. Feed it to the engine we just built!
    engine = ConfidenceEngine()
    result = engine.process_declaration(docs)
    
    print("\nValidation Result:")
    print(json.dumps(result, indent=2))

    
if __name__ == "__main__":
    main()