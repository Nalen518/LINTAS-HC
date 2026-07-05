from ollama import chat

def run_ollama(source):
    messages = [
        {
            "role": "user", 
            "content": "Describe this image in structured JSON.",
            # The 'images' field takes a list of file paths or bytes
            "images": [source] 
        }
    ]

    # Qwen2.5-VL is optimized for vision tasks
    response = chat(
        model="qwen2.5vl", 
        messages=messages, 
        format="json" # Ensures the model outputs valid JSON
    )

    return response.message.content