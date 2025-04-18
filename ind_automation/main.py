#!/usr/bin/env python3
"""IND Automation FastAPI Microservice"""

import fastapi
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import os
import sys
import json
from typing import Dict, Any, Optional, List

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

class BatchProjectRequest(BaseModel):
    """Batch project request model for processing multiple projects"""
    project_ids: List[str]

class SpecificationData(BaseModel):
    """Specification data for CMC module"""
    parameter: str
    limit: str
    result: str

class StabilityData(BaseModel):
    """Stability data for CMC module"""
    timepoint: str
    result: str

class Module3Request(BaseModel):
    """Manual Module 3 CMC data input model"""
    drug_name: str
    manufacturing_site: str
    batch_number: str
    specifications: List[SpecificationData]
    stability_data: List[StabilityData]

@app.get("/")
async def root():
    """Root endpoint - service information"""
    return {
        "name": "IND Automation API",
        "version": "0.1.0",
        "status": "operational",
        "modules_supported": ["module3_cmc"],
        "endpoints": [
            {"path": "/", "method": "GET", "description": "API information"},
            {"path": "/status", "method": "GET", "description": "Service status check"},
            {"path": "/projects", "method": "GET", "description": "List available Benchling projects"},
            {"path": "/{project_id}/module3", "method": "GET", "description": "Generate Module 3 document from Benchling data"},
            {"path": "/generate/module3", "method": "POST", "description": "Generate Module 3 document from provided data"},
            {"path": "/batch/module3", "method": "POST", "description": "Generate multiple Module 3 documents"}
        ]
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
        
        # Check if template files exist
        module3_template = os.path.join(templates_dir, "module3_cmc.xml")
        if not os.path.exists(module3_template):
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Module 3 template not found"}
            )
        
        return {
            "status": "operational",
            "message": "IND Automation service is running properly",
            "templates_available": ["module3_cmc.xml"]
        }
    except Exception as e:
        logger.error(f"Status check failed: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Service error: {str(e)}"}
        )

@app.get("/projects")
async def list_projects():
    """
    List available Benchling projects 
    
    Returns:
        List of projects with IDs and names
    """
    try:
        # Get projects from Benchling connector
        from ingestion.benchling_connector import get_project_list
        projects = get_project_list()
        
        return {"projects": projects}
    except Exception as e:
        logger.error(f"Error listing projects: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Error: {str(e)}"}
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

@app.post("/generate/module3")
async def generate_module3_from_data(data: Module3Request):
    """
    Generate Module 3 (Chemistry, Manufacturing, and Controls) document from provided data
    
    Args:
        data: Module3Request object containing all required data
        
    Returns:
        DOCX file as attachment
    """
    try:
        logger.info(f"Received request to generate Module 3 for drug: {data.drug_name}")
        
        # Convert pydantic model to dict
        cmc_data = data.dict()
        
        # Generate the document
        document_bytes = template_generator.generate_module3(cmc_data)
        
        if not document_bytes:
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Failed to generate document"}
            )
        
        # Return as downloadable file
        safe_name = data.drug_name.replace(" ", "_")
        return StreamingResponse(
            iter([document_bytes]),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="Module3_CMC_{safe_name}.docx"'
            }
        )
    
    except Exception as e:
        logger.error(f"Error generating Module 3 document: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Error: {str(e)}"}
        )

@app.post("/batch/module3")
async def batch_generate_module3(request: BatchProjectRequest):
    """
    Generate multiple Module 3 documents in batch mode
    
    Args:
        request: BatchProjectRequest containing project IDs
        
    Returns:
        Status report with success/failure for each project
    """
    try:
        logger.info(f"Received batch request for {len(request.project_ids)} projects")
        
        results = []
        for project_id in request.project_ids:
            try:
                # Fetch CMC data from Benchling
                cmc_data = fetch_benchling_cmc(project_id)
                
                if not cmc_data:
                    results.append({
                        "project_id": project_id,
                        "status": "error",
                        "message": "No data found"
                    })
                    continue
                
                # Generate document
                document_bytes = template_generator.generate_module3(cmc_data)
                
                if not document_bytes:
                    results.append({
                        "project_id": project_id,
                        "status": "error",
                        "message": "Failed to generate document"
                    })
                    continue
                
                # Save document to output directory
                output_dir = os.path.join(os.path.dirname(__file__), "output")
                os.makedirs(output_dir, exist_ok=True)
                
                output_path = os.path.join(output_dir, f"Module3_CMC_{project_id}.docx")
                with open(output_path, "wb") as f:
                    f.write(document_bytes)
                
                results.append({
                    "project_id": project_id,
                    "status": "success",
                    "filename": f"Module3_CMC_{project_id}.docx",
                    "path": output_path
                })
                
            except Exception as e:
                results.append({
                    "project_id": project_id,
                    "status": "error",
                    "message": str(e)
                })
        
        return {
            "batch_size": len(request.project_ids),
            "success_count": sum(1 for r in results if r["status"] == "success"),
            "error_count": sum(1 for r in results if r["status"] == "error"),
            "results": results
        }
    
    except Exception as e:
        logger.error(f"Error in batch processing: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Error: {str(e)}"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)