# /trialsage/main.py
# Main FastAPI application entry point

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from controllers import protocol

# Initialize FastAPI app
app = FastAPI(
    title="TrialSage API",
    description="Clinical Trial Intelligence Platform with Protocol and IND Generation",
    version="1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the protocol router
app.include_router(protocol.router)

# Root endpoint
@app.get("/")
def read_root():
    """Root endpoint providing API information"""
    return {
        "name": "TrialSage Intelligence API",
        "version": "1.0",
        "endpoints": {
            "/api/intel/protocol-suggestions": "Generate protocol scaffolds with IND 2.5 and risk analysis",
            "/api/intel/continue-thread": "Continue protocol development with thread memory",
            "/api/intel/trigger-followup": "Generate follow-up modules like IND 2.7",
            "/api/intel/sap-draft": "Generate Statistical Analysis Plan drafts",
            "/api/intel/csr-evidence": "Find evidence in CSR corpus for a topic",
            "/api/intel/scheduled-report": "Generate weekly intelligence briefing",
        }
    }

# Error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for API errors"""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": f"An unexpected error occurred: {str(exc)}",
            "error_type": exc.__class__.__name__,
        },
    )

# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint for monitoring systems"""
    required_env_vars = ["OPENAI_API_KEY"]
    missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
    
    if missing_vars:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": f"Missing required environment variables: {', '.join(missing_vars)}",
            },
        )
    
    return {"status": "healthy", "service": "TrialSage API"}

# Run the app with uvicorn if executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)