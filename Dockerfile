FROM python:3.11-slim

# Install system dependencies needed for OpenCV, PaddleOCR, and other packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install CPU-only PyTorch to drastically reduce image size and download time
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies with an increased timeout
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt


# Copy the rest of the application code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Default command runs the FastAPI server
CMD ["uvicorn", "src.validation.api:app", "--host", "0.0.0.0", "--port", "8000"]
