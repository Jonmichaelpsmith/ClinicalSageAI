#!/usr/bin/env python3
"""IND Automation FastAPI Microservice"""

import fastapi
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import os
import sys
from typing import Dict, Any, Optional

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Import our modules
from ingestion.benchling_connector import fetch_benchling_cmc
from create_template import TemplateGenerator

# Create FastAPI app
app = fastapi.FastAPI(
    title="IND Automation API",
    description="Microservice for generating FDA Investigational New Drug (IND) application documents",
    version="0.1.0"
)

# Allow CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize template generator
template_generator = TemplateGenerator()

class ProjectRequest(BaseModel):
    """Project request model"""
    project_id: str

@app.get("/")
async def root():
    """Root endpoint - service information"""
    return {
        "name": "IND Automation API",
        "version": "0.1.0",
        "status": "operational",
        "modules_supported": ["module3_cmc"]
    }

@app.get("/status")
async def status():
    """Service status check"""
    try:
        # Check if template directory exists and is accessible
        templates_dir = os.path.join(os.path.dirname(__file__), "templates")
        if not os.path.exists(templates_dir):
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Templates directory not found"}
            )
        
        return {
            "status": "operational",
            "message": "IND Automation service is running properly"
        }
    except Exception as e:
        logger.error(f"Status check failed: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Service error: {str(e)}"}
        )

@app.get("/{project_id}/module3")
async def generate_module3(project_id: str):
    """
    Generate Module 3 (Chemistry, Manufacturing, and Controls) document
    
    Args:
        project_id: The project identifier to fetch data for
        
    Returns:
        DOCX file as attachment
    """
    try:
        logger.info(f"Received request to generate Module 3 for project {project_id}")
        
        # Fetch CMC data from Benchling (or our stub for now)
        cmc_data = fetch_benchling_cmc(project_id)
        
        if not cmc_data:
            return JSONResponse(
                status_code=404,
                content={"status": "error", "message": f"No data found for project {project_id}"}
            )
        
        # Generate the document
        document_bytes = template_generator.generate_module3(cmc_data)
        
        if not document_bytes:
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Failed to generate document"}
            )
        
        # Return as downloadable file
        return StreamingResponse(
            iter([document_bytes]),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="Module3_CMC_{project_id}.docx"'
            }
        )
    
    except Exception as e:
        logger.error(f"Error generating Module 3 document: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Error: {str(e)}"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)