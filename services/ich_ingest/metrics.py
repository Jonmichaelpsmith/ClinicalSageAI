"""
Prometheus metrics for the ICH Specialist service.

This module defines metrics that will be exposed via the /metrics endpoint
for monitoring service health, performance, and usage.
"""
from prometheus_client import Counter, Gauge, Histogram
from functools import wraps
import time
import asyncio
from .config import settings

# Define metrics with the configurable prefix
PREFIX = settings.METRICS_PREFIX

# Document processing metrics
DOCUMENTS_PROCESSED = Counter(
    f"{PREFIX}documents_processed_total",
    "Total number of documents processed by the ingestion service",
    ["doc_type", "status"]
)

DOCUMENT_PROCESSING_TIME = Histogram(
    f"{PREFIX}document_processing_seconds",
    "Time spent processing documents",
    ["doc_type", "operation"],
    buckets=(0.1, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0, 120.0, 300.0)
)

# Retrieval metrics
RETRIEVAL_LATENCY = Histogram(
    f"{PREFIX}retrieval_latency_seconds",
    "Time to retrieve documents from vector store",
    buckets=(0.01, 0.05, 0.1, 0.5, 1.0, 2.5, 5.0, 10.0)
)

RETRIEVED_CHUNKS = Histogram(
    f"{PREFIX}retrieved_chunks_count",
    "Number of chunks retrieved per query",
    buckets=(1, 3, 5, 10, 20, 50, 100)
)

# API metrics
API_REQUESTS = Counter(
    f"{PREFIX}api_requests_total",
    "Total number of API requests",
    ["endpoint", "method", "status"]
)

API_LATENCY = Histogram(
    f"{PREFIX}api_latency_seconds",
    "API request latency in seconds",
    ["endpoint"],
    buckets=(0.01, 0.05, 0.1, 0.5, 1.0, 2.5, 5.0, 10.0)
)

# Service metrics
INGEST_QUEUE_SIZE = Gauge(
    f"{PREFIX}ingest_queue_size",
    "Current number of documents waiting to be processed"
)

EMBEDDING_REQUESTS = Counter(
    f"{PREFIX}embedding_requests_total",
    "Total OpenAI embedding API requests made",
    ["status"]
)

EMBEDDING_TOKENS = Counter(
    f"{PREFIX}embedding_tokens_total",
    "Total number of tokens used for embeddings"
)

OPENAI_COMPLETION_TOKENS = Counter(
    f"{PREFIX}openai_completion_tokens_total",
    "Total OpenAI completion tokens used",
    ["model"]
)

OPENAI_PROMPT_TOKENS = Counter(
    f"{PREFIX}openai_prompt_tokens_total",
    "Total OpenAI prompt tokens used",
    ["model"]
)

OPENAI_REQUESTS = Counter(
    f"{PREFIX}openai_requests_total",
    "Total OpenAI API requests made",
    ["operation", "status"]
)

OPENAI_LATENCY = Histogram(
    f"{PREFIX}openai_latency_seconds",
    "OpenAI API request latency in seconds",
    ["operation"],
    buckets=(0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 20.0, 30.0)
)

VECTOR_DB_OPERATIONS = Counter(
    f"{PREFIX}vector_db_operations_total",
    "Vector database operations",
    ["operation", "status"]
)

VECTOR_DB_LATENCY = Histogram(
    f"{PREFIX}vector_db_latency_seconds",
    "Vector database operation latency in seconds",
    ["operation"],
    buckets=(0.01, 0.05, 0.1, 0.5, 1.0, 2.5, 5.0, 10.0)
)

# Decorator for measuring function execution time with metrics
def time_and_count(metric_name, labels=None):
    """
    Decorator to measure function execution time and increment a counter.
    
    Args:
        metric_name: The name of the metric to use (must be defined above)
        labels: Dict of label values to use
    """
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            labels_dict = labels.copy() if labels else {}
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                # Set status to success on counters if not specified
                if "status" in labels_dict and not labels_dict.get("status"):
                    labels_dict["status"] = "success"
                return result
            except Exception as e:
                # Set status to error on counters
                if "status" in labels_dict:
                    labels_dict["status"] = "error"
                raise e
            finally:
                duration = time.time() - start_time
                # Record metrics
                if metric_name.endswith("_seconds"):
                    # It's a histogram for timing
                    label_values = [labels_dict.get(label, "") for label in globals()[metric_name]._labelnames]
                    globals()[metric_name].labels(*label_values).observe(duration)
                elif metric_name.endswith("_total"):
                    # It's a counter
                    label_values = [labels_dict.get(label, "") for label in globals()[metric_name]._labelnames]
                    globals()[metric_name].labels(*label_values).inc()
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            labels_dict = labels.copy() if labels else {}
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                # Set status to success on counters if not specified
                if "status" in labels_dict and not labels_dict.get("status"):
                    labels_dict["status"] = "success"
                return result
            except Exception as e:
                # Set status to error on counters
                if "status" in labels_dict:
                    labels_dict["status"] = "error"
                raise e
            finally:
                duration = time.time() - start_time
                # Record metrics
                if metric_name.endswith("_seconds"):
                    # It's a histogram for timing
                    label_values = [labels_dict.get(label, "") for label in globals()[metric_name]._labelnames]
                    globals()[metric_name].labels(*label_values).observe(duration)
                elif metric_name.endswith("_total"):
                    # It's a counter
                    label_values = [labels_dict.get(label, "") for label in globals()[metric_name]._labelnames]
                    globals()[metric_name].labels(*label_values).inc()
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator