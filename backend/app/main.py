"""
Main FastAPI application for TrialSage RegIntel Validator

This module sets up the FastAPI application with middleware, 
routers, and static file serving.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging

from .routers import validation, explanation
from .dependencies import get_token_header

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("validation.log")
    ]
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="TrialSage RegIntel API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Create upload and output directories if they don't exist
os.makedirs("backend/uploads", exist_ok=True)
os.makedirs("backend/validation_logs", exist_ok=True)
os.makedirs("backend/define_outputs", exist_ok=True)

# Mount static files for downloads
app.mount("/downloads", StaticFiles(directory="backend/validation_logs"), name="validation_logs")
app.mount("/define", StaticFiles(directory="backend/define_outputs"), name="define_outputs")

# Health check endpoint
@app.get("/health", include_in_schema=False)
async def health_check():
    return {"status": "ok"}

# Include routers
app.include_router(
    validation.router,
    prefix="/validate",
    tags=["validation"],
    dependencies=[],
)

app.include_router(
    explanation.router,
    prefix="/regintel",
    tags=["explanation"],
    dependencies=[],
)

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("RegIntel API started")

# Request middleware for logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests and responses"""
    logger.info(f"Request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response