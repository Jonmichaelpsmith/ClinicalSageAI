import io
import os
import logging
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ind_automation.templates import render_form1571, render_form1572, render_form3674, render_cover_letter
from ind_automation.ingestion.benchling_connector import fetch_benchling_cmc, get_project_list

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="IND Automation Service", 
    description="API for automating FDA Investigational New Drug (IND) application generation"
)

# Add CORS middleware to enable cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to specific origins in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
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

class BatchProjectRequest(BaseModel):
    """Batch project request model for processing multiple projects"""
    project_ids: List[str]

class INDProject(BaseModel):
    """IND project data model"""
    project_id: str
    sponsor: str
    ind_number: Optional[str] = None
    drug_name: str
    protocol: str
    submission_date: str
    pi_name: str
    pi_address: str
    nct_number: Optional[str] = None
    registration_status: str = "Registered"

@app.get("/")
async def root():
    """Root endpoint - service information"""
    return {
        "service": "IND Automation API",
        "version": "1.0.0",
        "endpoints": [
            {"path": "/health", "method": "GET", "description": "Health check endpoint"},
            {"path": "/status", "method": "GET", "description": "Service status check with template validation"},
            {"path": "/projects", "method": "GET", "description": "List available projects"},
            {"path": "/api/ind/{proj}/forms/1571", "method": "GET", "description": "Generate FDA Form 1571"},
            {"path": "/api/ind/{proj}/forms/1572", "method": "GET", "description": "Generate FDA Form 1572"},
            {"path": "/api/ind/{proj}/forms/3674", "method": "GET", "description": "Generate FDA Form 3674"},
            {"path": "/api/ind/{proj}/cover-letter", "method": "GET", "description": "Generate cover letter"},
            {"path": "/{project_id}/module3", "method": "GET", "description": "Generate Module 3 CMC document"},
            {"path": "/generate/module3", "method": "POST", "description": "Generate Module 3 from provided data"},
            {"path": "/batch/module3", "method": "POST", "description": "Generate multiple Module 3 documents"}
        ]
    }

@app.get("/health")
async def health():
    """Simple health check endpoint"""
    return {"status": "ok"}

# --- Project metadata stub ---
def fetch_project_metadata(proj: str) -> INDProject:
    """
    Fetch project metadata for IND forms
    TODO: Connect to your real database
    """
    return INDProject(
        project_id=proj,
        sponsor="Acme Biotech, Inc.",
        ind_number="0000",
        drug_name="TestDrug",
        protocol="PROTO-123",
        submission_date="2025-04-22",
        pi_name="Dr. Jane Doe",
        pi_address="123 Lab St, Science City, CA",
        nct_number="NCT01234567",
        registration_status="Registered"
    )

# --- Form 1571 ---
@app.get("/api/ind/{proj}/forms/1571")
async def get_form1571(proj: str):
    """
    Generate FDA Form 1571 (Investigational New Drug Application)
    
    Args:
        proj: Project identifier
        
    Returns:
        FDA Form 1571 as DOCX file
    """
    try:
        meta = fetch_project_metadata(proj)
        form_data = {
            "sponsor_name": meta.sponsor,
            "IND_number": meta.ind_number or "Pending",
            "drug_name": meta.drug_name,
            "protocol_number": meta.protocol,
            "submission_date": meta.submission_date,
            "phase1_checked": "☒",  # Default to Phase 1 checked
            "phase2_checked": "☐",
            "phase3_checked": "☐",
            "other_phase_checked": "☐",
        }
        
        buf = render_form1571(form_data)
        if not buf:
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Failed to generate Form 1571"}
            )
            
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=Form1571_{proj}.docx"}
        )
    except Exception as e:
        logger.error(f"Error generating Form 1571: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Error: {str(e)}"}
        )

# --- Form 1572 ---
@app.get("/api/ind/{proj}/forms/1572")
async def get_form1572(proj: str):
    """
    Generate FDA Form 1572 (Statement of Investigator)
    
    Args:
        proj: Project identifier
        
    Returns:
        FDA Form 1572 as DOCX file
    """
    try:
        meta = fetch_project_metadata(proj)
        form_data = {
            "principal_investigator_name": meta.pi_name,
            "investigator_address": meta.pi_address,
            "protocol_number": meta.protocol,
            "drug_name": meta.drug_name,
            "phase": "Phase 1",
        }
        
        buf = render_form1572(form_data)
        if not buf:
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Failed to generate Form 1572"}
            )
            
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=Form1572_{proj}.docx"}
        )
    except Exception as e:
        logger.error(f"Error generating Form 1572: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Error: {str(e)}"}
        )

# --- Form 3674 ---
@app.get("/api/ind/{proj}/forms/3674")
async def get_form3674(proj: str):
    """
    Generate FDA Form 3674 (Certification of Compliance with ClinicalTrials.gov)
    
    Args:
        proj: Project identifier
        
    Returns:
        FDA Form 3674 as DOCX file
    """
    try:
        meta = fetch_project_metadata(proj)
        form_data = {
            "nct_number": meta.nct_number or "",
            "study_registration_statement": meta.registration_status,
            "drug_name": meta.drug_name,
            "sponsor_name": meta.sponsor,
            "certifier_name": meta.sponsor,  # Default to sponsor name if not provided
            "submission_date": meta.submission_date,
        }
        
        buf = render_form3674(form_data)
        if not buf:
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Failed to generate Form 3674"}
            )
            
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=Form3674_{proj}.docx"}
        )
    except Exception as e:
        logger.error(f"Error generating Form 3674: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Error: {str(e)}"}
        )

# --- Cover Letter ---
@app.get("/api/ind/{proj}/cover-letter")
async def get_cover_letter(proj: str):
    """
    Generate Cover Letter for IND submission
    
    Args:
        proj: Project identifier
        
    Returns:
        Cover letter as DOCX file
    """
    try:
        meta = fetch_project_metadata(proj)
        form_data = {
            "sponsor_name": meta.sponsor,
            "sponsor_address": "123 Biotech Avenue, San Francisco, CA 94107",  # Placeholder
            "submission_date": meta.submission_date,
            "IND_number": meta.ind_number or "Pending",
            "drug_name": meta.drug_name,
            "indication": "Treatment of Disease X",  # Placeholder
            "serial_number": "0001",  # Placeholder
            "contact_name": "John Smith",  # Placeholder
            "contact_phone": "(555) 123-4567",  # Placeholder
            "contact_email": "contact@acmebiotech.com",  # Placeholder
        }
        
        buf = render_cover_letter(form_data)
        if not buf:
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Failed to generate cover letter"}
            )
            
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=CoverLetter_{proj}.docx"}
        )
    except Exception as e:
        logger.error(f"Error generating cover letter: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Error: {str(e)}"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)