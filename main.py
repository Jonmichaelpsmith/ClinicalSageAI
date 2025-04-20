"""
Main FastAPI server entry point

This file serves as the centralized entry point for all FastAPI services.
It imports and mounts the individual FastAPI applications from different modules
and starts a single server instance on a configurable port.
"""
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import FastAPI routers from different modules
from server.api.ws.qc import router as qc_router
from server.api.documents.bulk_approve import router as bulk_approve_router
from server.api.validation.iqoq import router as iqoq_router
from server.api.ind.missing_required import router as missing_required_router
from server.api.region.region_api import router as region_router
from server.routes.sequence_create_region import router as sequence_create_router

# Create main FastAPI app
app = FastAPI(title="TrialSage API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add a health check endpoint
@app.get("/healthz")
async def health_check():
    return {"status": "ok"}

# Mount all routers
app.include_router(qc_router)
app.include_router(bulk_approve_router)
app.include_router(iqoq_router)
app.include_router(missing_required_router)
app.include_router(region_router)
app.include_router(sequence_create_router)

# Start server if run directly
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting FastAPI server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)