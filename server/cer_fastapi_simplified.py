"""
Simplified FastAPI Server for TrialSage CER and Validation Services

This module provides a streamlined FastAPI server with essential endpoints:
1. CER generation and retrieval
2. Validation services (IQ/OQ/PQ documentation)
3. Health check endpoint
"""

import os
import logging
from typing import Dict, List, Optional, Any, Union
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import JSONResponse

# Import validation router
from api.validation import validation_router

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="TrialSage Simplified API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic response models
class StatusResponse(BaseModel):
    status: str
    message: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None

# Include validation router
app.include_router(validation_router)

# Health check endpoint
@app.get("/health", response_model=StatusResponse)
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "TrialSage Simplified API is running"}

# Root endpoint
@app.get("/", response_model=StatusResponse)
async def root():
    """Root endpoint with API information"""
    return {
        "status": "ok",
        "message": "TrialSage Simplified API. Use /docs for API documentation."
    }

# Error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )

# Start server if run directly
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("FASTAPI_PORT", 8083))
    logger.info(f"Starting FastAPI server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)