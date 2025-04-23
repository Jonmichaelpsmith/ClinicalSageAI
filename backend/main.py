"""
TrialSage™ FastAPI Backend Entry Point

This module serves as the main entry point for the FastAPI application
that powers the TrialSage™ AI-powered regulatory document automation platform.
"""

from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from datetime import datetime

# Import routes
from routes.generate_module32 import router as module32_router

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("api.log", mode="a")
    ]
)

logger = logging.getLogger(__name__)

# Validate required environment variables
def validate_environment():
    required_vars = ["OPENAI_API_KEY"]
    missing = [var for var in required_vars if not os.environ.get(var)]
    
    if missing:
        logger.error(f"Missing required environment variables: {', '.join(missing)}")
        raise EnvironmentError(f"Missing required environment variables: {', '.join(missing)}")
    
    # Log successful validation
    logger.info("Environment validation passed")
    return True

# Create FastAPI application
app = FastAPI(
    title="TrialSage™ API",
    description="AI-powered regulatory document automation platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:5173",
    "https://trialsage.ai",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register middleware for logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    
    # Log request details
    logger.info(f"Request: {request.method} {request.url.path}")
    
    # Process request
    response = await call_next(request)
    
    # Log response time
    process_time = (datetime.now() - start_time).total_seconds()
    logger.info(f"Response: {response.status_code} (took {process_time:.4f}s)")
    
    return response

# Health check endpoint
@app.get("/api/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "api_version": "1.0.0"
    }

# OpenAI API key validation endpoint
@app.get("/api/validate-openai-key", tags=["System"])
async def validate_openai_key():
    try:
        if not os.environ.get("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=400,
                detail="OPENAI_API_KEY environment variable not set"
            )
        
        # Log successful validation
        logger.info("OpenAI API key validation passed")
        return {"status": "valid", "message": "OpenAI API key is configured"}
    
    except Exception as e:
        logger.error(f"OpenAI API key validation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to validate OpenAI API key"
        )

# Register routers
app.include_router(module32_router, prefix="/api")

# Startup event handler
@app.on_event("startup")
async def startup_event():
    logger.info("Starting TrialSage™ API")
    
    try:
        validate_environment()
        logger.info("TrialSage™ API started successfully")
    except Exception as e:
        logger.error(f"Failed to start API: {str(e)}")
        raise

# Shutdown event handler
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down TrialSage™ API")

# Root endpoint
@app.get("/", include_in_schema=False)
async def root():
    return {"message": "TrialSage™ API - Please use /api/docs for API documentation"}