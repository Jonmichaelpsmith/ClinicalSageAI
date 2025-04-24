"""
Configuration settings for the ICH Specialist service.

This module provides a Pydantic Settings class for managing
environment variables and configuration options.
"""
import os
from typing import List
from pydantic import BaseSettings, Field, validator, AnyHttpUrl

class Settings(BaseSettings):
    """Settings for the ICH Specialist service."""
    
    # Core API settings
    API_AUTH_ENABLED: bool = Field(True, env="API_AUTH_ENABLED")
    API_KEY: str = Field("", env="ICH_API_KEY")
    CORS_ORIGINS: List[str] = Field(["*"], env="CORS_ORIGINS")
    LOG_LEVEL: str = Field("INFO", env="LOG_LEVEL")
    
    # Source URLs & Paths
    ICH_BASE_URL: str = Field("https://www.ich.org/page/articles-procedures", env="ICH_BASE_URL")
    CSR_DIR: str = Field("csr_uploads/", env="CSR_UPLOAD_DIR")
    GUIDELINES_DIR: str = Field("services/ich_ingest/guidelines/", env="GUIDELINES_DIR")
    PROCESSED_LOG: str = Field("services/ich_ingest/processed.json", env="PROCESSED_LOG")

    # OpenAI & Vector Store
    OPENAI_API_KEY: str = Field(..., env="OPENAI_API_KEY")
    PINECONE_API_KEY: str = Field(..., env="PINECONE_API_KEY")
    PINECONE_ENV: str = Field("us-west1-gcp", env="PINECONE_ENV")
    PINECONE_INDEX: str = Field("ich-specialist", env="PINECONE_INDEX")

    # Scheduler
    INGEST_INTERVAL_SEC: int = Field(86400, env="INGEST_INTERVAL_SEC")
    CSR_POLL_INTERVAL_SEC: int = Field(60, env="CSR_POLL_INTERVAL_SEC")
    
    # Metrics
    METRICS_ENABLED: bool = Field(True, env="METRICS_ENABLED")
    METRICS_PREFIX: str = Field("ich_", env="METRICS_PREFIX")
    
    # OpenTelemetry (optional)
    OTEL_ENABLED: bool = Field(False, env="OTEL_ENABLED")
    OTEL_EXPORTER_OTLP_ENDPOINT: str = Field(
        "http://localhost:4317", env="OTEL_EXPORTER_OTLP_ENDPOINT"
    )

    class Config:
        """Configuration for Settings."""
        env_file = ".env"
        case_sensitive = True

    @validator("CSR_DIR", "GUIDELINES_DIR")
    def ensure_dir_format(cls, v):
        """Ensure directory paths end with a slash."""
        return v if v.endswith('/') else v + '/'
    
    @validator("CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        """Parse the CORS_ORIGINS from comma-separated string if needed."""
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v

settings = Settings()