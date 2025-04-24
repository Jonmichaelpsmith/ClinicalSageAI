"""
Prometheus metrics for the ICH Specialist service.
"""
import time
from fastapi import FastAPI
from prometheus_client import Counter, Histogram, Gauge
from prometheus_fastapi_instrumentator import Instrumentator

# Define metrics
DOCUMENTS_INGESTED = Counter(
    'ich_documents_ingested_total',
    'Total number of documents ingested',
    ['type', 'status']
)

EMBEDDING_REQUESTS = Counter(
    'ich_embedding_requests_total',
    'Total number of embedding requests',
    ['status']
)

EMBEDDING_LATENCY = Histogram(
    'ich_embedding_latency_seconds',
    'Latency of embedding requests',
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
)

AGENT_QUERIES = Counter(
    'ich_agent_queries_total',
    'Total number of agent queries',
    ['module', 'status']
)

AGENT_LATENCY = Histogram(
    'ich_agent_latency_seconds',
    'Latency of agent queries',
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0]
)

DOCUMENT_COUNT = Gauge(
    'ich_document_count',
    'Number of documents in the system',
    ['type']
)

VECTOR_COUNT = Gauge(
    'ich_vector_count',
    'Number of vectors in the index'
)

class MetricsMiddleware:
    """Middleware for tracking agent query metrics."""
    
    async def __call__(self, request, call_next):
        if request.url.path == "/api/ich-agent" and request.method == "POST":
            module = "unknown"
            try:
                body = await request.json()
                module = body.get("module", "unknown")
            except:
                pass
            
            start_time = time.time()
            response = await call_next(request)
            duration = time.time() - start_time
            
            status = "success" if response.status_code < 400 else "error"
            AGENT_QUERIES.labels(module=module, status=status).inc()
            AGENT_LATENCY.observe(duration)
            
            return response
        return await call_next(request)

def setup_metrics(app: FastAPI):
    """Set up metrics for the FastAPI application."""
    # Add request metrics via instrumentator
    Instrumentator().instrument(app).expose(app)
    
    # Add custom metrics middleware
    app.middleware("http")(MetricsMiddleware())
    
    # Initialize document counts to zero
    DOCUMENT_COUNT.labels(type="guideline").set(0)
    DOCUMENT_COUNT.labels(type="csr").set(0)
    VECTOR_COUNT.set(0)

def track_ingestion(doc_type: str, success: bool):
    """Track document ingestion."""
    status = "success" if success else "error"
    DOCUMENTS_INGESTED.labels(type=doc_type, status=status).inc()

def track_embedding(success: bool, duration: float):
    """Track embedding request."""
    status = "success" if success else "error"
    EMBEDDING_REQUESTS.labels(status=status).inc()
    EMBEDDING_LATENCY.observe(duration)

def update_document_count(doc_type: str, count: int):
    """Update document count gauge."""
    DOCUMENT_COUNT.labels(type=doc_type).set(count)

def update_vector_count(count: int):
    """Update vector count gauge."""
    VECTOR_COUNT.set(count)