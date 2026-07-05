from docling.document_converter import DocumentConverter
import json

def run_docling(source):
    converter = DocumentConverter()
    result = converter.convert(source)
    

    # return result.document.export_to_markdown()  # output: "## Docling Technical Report[...]"
    return json.dumps(result.document.export_to_dict())  # output: "## Docling Technical Report[...]"
