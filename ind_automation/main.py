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
from datetime import datetime
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
from templates import render_form1571, render_form1572, render_form3674, create_cover_letter

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
    
class ProjectMetadata(BaseModel):
    """Project metadata for FDA forms"""
    sponsor_name: Optional[str] = None
    sponsor_address: Optional[str] = None
    sponsor_phone: Optional[str] = None
    ind_number: Optional[str] = None
    drug_name: Optional[str] = None
    indication: Optional[str] = None
    protocol_number: Optional[str] = None
    protocol_title: Optional[str] = None
    phase: Optional[str] = "Phase 1"
    submission_date: Optional[str] = None
    nct_number: Optional[str] = None
    principal_investigator_name: Optional[str] = None
    investigator_address: Optional[str] = None
    investigator_phone: Optional[str] = None
    irb_name: Optional[str] = None
    irb_address: Optional[str] = None
    clinical_lab_name: Optional[str] = None
    clinical_lab_address: Optional[str] = None
    research_facility_name: Optional[str] = None 
    research_facility_address: Optional[str] = None
    subinvestigators: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    authorizer_name: Optional[str] = None
    authorizer_title: Optional[str] = None
    certifier_name: Optional[str] = None
    certifier_title: Optional[str] = None
    certifier_address: Optional[str] = None
    certifier_email: Optional[str] = None
    certifier_phone: Optional[str] = None
    certifier_fax: Optional[str] = None
    serial_number: Optional[str] = "0000"

@app.get("/")
async def root():
    """Root endpoint - service information"""
    return {
        "name": "IND Automation API",
        "version": "0.1.0",
        "status": "operational",
        "modules_supported": ["module1_forms", "module3_cmc"],
        "endpoints": [
            {"path": "/", "method": "GET", "description": "API information"},
            {"path": "/status", "method": "GET", "description": "Service status check"},
            {"path": "/projects", "method": "GET", "description": "List available Benchling projects"},
            {"path": "/{project_id}/module3", "method": "GET", "description": "Generate Module 3 document from Benchling data"},
            {"path": "/generate/module3", "method": "POST", "description": "Generate Module 3 document from provided data"},
            {"path": "/batch/module3", "method": "POST", "description": "Generate multiple Module 3 documents"},
            {"path": "/generate/form1571", "method": "POST", "description": "Generate FDA Form 1571"},
            {"path": "/generate/form1572", "method": "POST", "description": "Generate FDA Form 1572"},
            {"path": "/generate/form3674", "method": "POST", "description": "Generate FDA Form 3674"},
            {"path": "/generate/cover-letter", "method": "POST", "description": "Generate cover letter for IND submission"}
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
        
        # Check for form templates
        forms_dir = os.path.join(templates_dir, "forms")
        available_templates = ["module3_cmc.xml"]
        
        if os.path.exists(forms_dir):
            form_templates = []
            for template in ["form1571.docx", "form1572.docx", "form3674.docx", "cover_letter.docx"]:
                if os.path.exists(os.path.join(forms_dir, template)):
                    form_templates.append(template)
            
            if form_templates:
                available_templates.extend(form_templates)
        
        return {
            "status": "operational",
            "message": "IND Automation service is running properly",
            "templates_available": available_templates
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

@app.post("/generate/form1571")
async def generate_form1571(data: ProjectMetadata):
    """
    Generate FDA Form 1571 (Investigational New Drug Application)
    
    Args:
        data: ProjectMetadata containing form data
        
    Returns:
        DOCX file as attachment
    """
    try:
        logger.info(f"Generating Form 1571 for project: {data.drug_name}")
        
        # Convert pydantic model to dict
        form_data = data.dict()
        
        # Set phase checkbox based on provided phase
        if data.phase:
            phase_lower = data.phase.lower()
            if "1" in phase_lower:
                form_data["phase1_checked"] = "☒"
            else:
                form_data["phase1_checked"] = "☐"
                
            if "2" in phase_lower:
                form_data["phase2_checked"] = "☒"
            else:
                form_data["phase2_checked"] = "☐"
                
            if "3" in phase_lower:
                form_data["phase3_checked"] = "☒"
            else:
                form_data["phase3_checked"] = "☐"
                
            if "other" in phase_lower:
                form_data["other_phase_checked"] = "☒"
            else:
                form_data["other_phase_checked"] = "☐"
        
        # Set submission date if not provided
        if not form_data.get("submission_date"):
            form_data["submission_date"] = datetime.now().strftime("%m/%d/%Y")
            
        # Set signature date if not provided  
        if not form_data.get("signature_date"):
            form_data["signature_date"] = datetime.now().strftime("%m/%d/%Y")
            
        # Generate the document
        document_bytes = render_form1571(form_data)
        
        if not document_bytes:
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Failed to generate Form 1571"}
            )
        
        # Return as downloadable file
        safe_name = data.drug_name.replace(" ", "_") if data.drug_name else "form1571"
        return StreamingResponse(
            iter([document_bytes.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="FDA_Form_1571_{safe_name}.docx"'
            }
        )
        
    except Exception as e:
        logger.error(f"Error generating Form 1571: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Error: {str(e)}"}
        )

@app.post("/generate/form1572")
async def generate_form1572(data: ProjectMetadata):
    """
    Generate FDA Form 1572 (Statement of Investigator)
    
    Args:
        data: ProjectMetadata containing form data
        
    Returns:
        DOCX file as attachment
    """
    try:
        logger.info(f"Generating Form 1572 for investigator: {data.principal_investigator_name}")
        
        # Convert pydantic model to dict
        form_data = data.dict()
        
        # Set default investigator name from principal investigator if not provided
        if not form_data.get("investigator_name") and form_data.get("principal_investigator_name"):
            form_data["investigator_name"] = form_data["principal_investigator_name"]
            
        # Set submission date if not provided
        if not form_data.get("signature_date"):
            form_data["signature_date"] = datetime.now().strftime("%m/%d/%Y")
            
        # Generate the document
        document_bytes = render_form1572(form_data)
        
        if not document_bytes:
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Failed to generate Form 1572"}
            )
        
        # Return as downloadable file
        safe_name = ""
        if data.principal_investigator_name:
            safe_name = data.principal_investigator_name.replace(" ", "_")
        elif data.drug_name:
            safe_name = data.drug_name.replace(" ", "_")
        else:
            safe_name = "form1572"
            
        return StreamingResponse(
            iter([document_bytes.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="FDA_Form_1572_{safe_name}.docx"'
            }
        )
        
    except Exception as e:
        logger.error(f"Error generating Form 1572: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Error: {str(e)}"}
        )

@app.post("/generate/form3674")
async def generate_form3674(data: ProjectMetadata):
    """
    Generate FDA Form 3674 (Certification of Compliance with ClinicalTrials.gov)
    
    Args:
        data: ProjectMetadata containing form data
        
    Returns:
        DOCX file as attachment
    """
    try:
        logger.info(f"Generating Form 3674 for project: {data.drug_name}")
        
        # Convert pydantic model to dict
        form_data = data.dict()
        
        # Set default values
        if not form_data.get("trial_title") and form_data.get("protocol_title"):
            form_data["trial_title"] = form_data["protocol_title"]
            
        # Set trial phase from phase if not provided
        if not form_data.get("trial_phase") and form_data.get("phase"):
            form_data["trial_phase"] = form_data["phase"]
            
        # Set submission date if not provided
        if not form_data.get("signature_date"):
            form_data["signature_date"] = datetime.now().strftime("%m/%d/%Y")
            
        # Generate the document
        document_bytes = render_form3674(form_data)
        
        if not document_bytes:
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Failed to generate Form 3674"}
            )
        
        # Return as downloadable file
        safe_name = data.drug_name.replace(" ", "_") if data.drug_name else "form3674"
        return StreamingResponse(
            iter([document_bytes.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="FDA_Form_3674_{safe_name}.docx"'
            }
        )
        
    except Exception as e:
        logger.error(f"Error generating Form 3674: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Error: {str(e)}"}
        )

@app.post("/generate/cover-letter")
async def generate_cover_letter(data: ProjectMetadata):
    """
    Generate a cover letter for IND submission
    
    Args:
        data: ProjectMetadata containing cover letter data
        
    Returns:
        DOCX file as attachment
    """
    try:
        logger.info(f"Generating cover letter for project: {data.drug_name}")
        
        # Convert pydantic model to dict
        letter_data = data.dict()
        
        # Set default included items if not provided
        if not letter_data.get("included_items"):
            letter_data["included_items"] = [
                "FDA Form 1571",
                "FDA Form 1572",
                "FDA Form 3674",
                "Module 3: Chemistry, Manufacturing, and Controls"
            ]
            
        # Format the included items as bullet points
        if isinstance(letter_data["included_items"], list):
            formatted_items = ""
            for item in letter_data["included_items"]:
                formatted_items += f"• {item}\n"
            letter_data["included_items"] = formatted_items
            
        # Set submission date if not provided
        if not letter_data.get("submission_date"):
            letter_data["submission_date"] = datetime.now().strftime("%B %d, %Y")
            
        # Generate the document
        document_bytes = create_cover_letter(letter_data)
        
        if not document_bytes:
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Failed to generate cover letter"}
            )
        
        # Return as downloadable file
        safe_name = data.drug_name.replace(" ", "_") if data.drug_name else "ind_submission"
        return StreamingResponse(
            iter([document_bytes.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="Cover_Letter_{safe_name}.docx"'
            }
        )
        
    except Exception as e:
        logger.error(f"Error generating cover letter: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Error: {str(e)}"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)