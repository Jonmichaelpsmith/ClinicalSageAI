FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /app

# System dependencies (including OCR support)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        tesseract-ocr \
        libsm6 libxext6 libxrender1 \
        git curl \
        poppler-utils \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY services/ich_ingest/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Setup directories
RUN mkdir -p /data/csr_uploads /data/guidelines

# Expose API port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the service (can be overridden with Docker CMD)
CMD ["uvicorn", "services.ich_ingest.agent:app", "--host", "0.0.0.0", "--port", "8000", "--log-config", "services/ich_ingest/logging_config.json"]