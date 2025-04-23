"""
Configuration settings for the TrialSage RegIntel Validator backend.
"""

import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    # JWT Authentication
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenAI (for explanations and fixes)
    OPENAI_API_KEY: str
    
    # RegIntel Validator
    REGINTEL_ENGINE_PATH: str
    
    # File paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    VALIDATION_REPORT_DIR: str = os.path.join(BASE_DIR, "validation_logs")
    DEFINE_XML_DIR: str = os.path.join(BASE_DIR, "define_outputs")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Initialize settings
settings = Settings()