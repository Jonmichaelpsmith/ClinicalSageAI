"""
Configuration settings for the ICH Wiz service.

This module uses pydantic_settings to validate environment variables
and provide configuration for the ICH Wiz service with fail-fast behavior.
"""
import os
import sys
from pathlib import Path
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Configuration settings for the ICH Wiz service.
    Uses pydantic to validate environment variables.
    """
    # Service identification
    SERVICE_NAME: str = Field("ich-wiz", description="Service name for identification")
    
    # API authentication
    API_AUTH_ENABLED: bool = Field(True, description="Enable API key authentication")
    API_KEY: Optional[str] = Field(None, description="API key for authentication")
    
    # API CORS settings
    CORS_ALLOW_ORIGINS: List[str] = Field(
        ["*"], description="List of origins that are allowed to access the API"
    )
    
    # OpenAI settings
    OPENAI_API_KEY: Optional[str] = Field(None, description="OpenAI API key")
    OPENAI_EMBEDDING_MODEL: str = Field(
        "text-embedding-3-large", description="OpenAI embedding model to use"
    )
    OPENAI_COMPLETION_MODEL: str = Field(
        "gpt-4o", description="OpenAI completion model to use"
    )
    
    # Pinecone settings
    PINECONE_API_KEY: Optional[str] = Field(None, description="Pinecone API key")
    PINECONE_ENVIRONMENT: str = Field("gcp-starter", description="Pinecone environment")
    PINECONE_INDEX_NAME: str = Field("ich-guidelines", description="Pinecone index name")
    
    # File and directory settings
    DATA_DIR: str = Field("./data", description="Base data directory")
    GUIDELINES_DIR: str = Field("./data/guidelines", description="Guidelines directory")
    UPLOADS_DIR: str = Field("./data/csr_uploads", description="CSR uploads directory")
    PROCESSED_FILE: str = Field("processed.json", description="Processed files tracking")
    
    # Chunking settings
    CHUNK_SIZE: int = Field(1000, description="Chunk size for documents")
    CHUNK_OVERLAP: int = Field(200, description="Chunk overlap for documents")
    
    # Cache settings
    CACHE_TTL: int = Field(3600, description="Cache TTL in seconds")
    
    # Metrics settings
    METRICS_PREFIX: str = Field("ich_wiz_", description="Prefix for metrics")
    
    # Logging settings
    LOG_LEVEL: str = Field("INFO", description="Log level")
    
    # Model config
    model_config = SettingsConfigDict(
        env_file=".env", env_prefix="ICH_", case_sensitive=False
    )
    
    @field_validator("OPENAI_API_KEY")
    def validate_openai_api_key(cls, v):
        if not v:
            print("ERROR: OPENAI_API_KEY environment variable is required but not set.")
            sys.exit(1)
        return v
    
    @field_validator("PINECONE_API_KEY")
    def validate_pinecone_api_key(cls, v):
        if not v:
            print("ERROR: PINECONE_API_KEY environment variable is required but not set.")
            sys.exit(1)
        return v
    
    @field_validator("API_KEY")
    def validate_api_key(cls, v, values):
        if values.data.get("API_AUTH_ENABLED", True) and not v:
            print("ERROR: API_KEY environment variable is required when API_AUTH_ENABLED is True.")
            sys.exit(1)
        return v
    
    def get_guidelines_dir(self) -> Path:
        """Get the path to the guidelines directory."""
        return Path(self.GUIDELINES_DIR)
    
    def get_uploads_dir(self) -> Path:
        """Get the path to the CSR uploads directory."""
        return Path(self.UPLOADS_DIR)
    
    def get_processed_file(self) -> Path:
        """Get the path to the processed files tracking file."""
        return Path(self.DATA_DIR) / self.PROCESSED_FILE


# Create directories if they don't exist
def create_directories(settings: Settings) -> None:
    """Create required directories if they don't exist."""
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    os.makedirs(settings.GUIDELINES_DIR, exist_ok=True) 
    os.makedirs(settings.UPLOADS_DIR, exist_ok=True)


# Create settings object with fail-fast behavior
try:
    settings = Settings()
    create_directories(settings)
except Exception as e:
    print(f"ERROR: Failed to initialize settings: {str(e)}")
    sys.exit(1)