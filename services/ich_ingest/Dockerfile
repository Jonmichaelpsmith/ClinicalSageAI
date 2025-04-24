FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    tesseract-ocr \
    poppler-utils \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /app/services/ich_ingest/

# Create necessary directories
RUN mkdir -p /app/csr_uploads /app/services/ich_ingest/guidelines

# Set up environment defaults
ENV ICH_BASE_URL="https://www.ich.org/page/articles-procedures" \
    CSR_DIR="/app/csr_uploads/" \
    GUIDELINES_DIR="/app/services/ich_ingest/guidelines/" \
    PROCESSED_LOG="/app/services/ich_ingest/processed.json" \
    PINECONE_ENV="us-west1-gcp" \
    PINECONE_INDEX="ich-specialist" \
    INGEST_INTERVAL_SEC=86400 \
    CSR_POLL_INTERVAL_SEC=60

# Expose the API port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "services.ich_ingest.agent:app", "--host", "0.0.0.0", "--port", "8000"]