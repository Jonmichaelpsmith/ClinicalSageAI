"""
RegIntel API Main Application

This module defines the FastAPI application and its middleware.
"""
import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import validation, explanation

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="RegIntel API",
    description="RegIntel provides document validation and explanation services for regulatory document compliance",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(validation.router, prefix="/validate", tags=["validation"])
app.include_router(explanation.router, prefix="/explain", tags=["explanation"])

# Health check endpoint
@app.get("/health", tags=["system"])
async def health_check():
    """
    Health check endpoint to verify the API is running.
    """
    return {"status": "healthy", "api": "RegIntel"}
    
# Mount static files
uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(uploads_dir, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Startup event handler
@app.on_event("startup")
async def startup_event():
    """
    Actions to perform on application startup.
    """
    logger.info("RegIntel API started")

# Shutdown event handler
@app.on_event("shutdown")
async def shutdown_event():
    """
    Actions to perform on application shutdown.
    """
    logger.info("RegIntel API shutting down")