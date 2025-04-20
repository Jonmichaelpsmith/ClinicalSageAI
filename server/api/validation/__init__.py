"""
Validation API Routes

This package contains API routes related to validation functionality:
- IQ/OQ/PQ documentation
- Regulatory validation
- QC validation
"""

import logging
from fastapi import APIRouter

# Import sub-routers
from .iqoq import router as iqoq_router

# Initialize package-level logger
logger = logging.getLogger(__name__)

# Create combined router
validation_router = APIRouter(prefix="/api/validation", tags=["validation"])

# Include sub-routers
validation_router.include_router(iqoq_router)