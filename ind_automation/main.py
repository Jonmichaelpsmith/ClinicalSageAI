"""
IND Automation Main Module

This module provides a FastAPI application for generating FDA forms
and documents for Investigational New Drug (IND) submissions.
"""

import os
import io
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List

from fastapi import FastAPI, HTTPException, Depends, Query, Body
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .templates import (
    generate_form_1571,
    generate_form_1572, 
    generate_form_3674,
    generate_cover_letter
)

from ingestion.benchling_connector import fetch_benchling_cmc

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ind-automation")

# Initialize FastAPI app
app = FastAPI(
    title="IND Automation API",
    description="API for generating FDA IND application forms",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request validation
class FormData(BaseModel):
    """Base model for form data"""
    sponsor_name: str
    sponsor_address: str
    sponsor_phone: str
    drug_name: str
    indication: str
    protocol_number: str
    protocol_title: str
    phase: str
    principal_investigator_name: str
    submission_date: Optional[str] = None
    
class Form1571Data(FormData):
    """Data for FDA Form 1571"""
    ind_number: Optional[str] = None
    authorizer_name: str
    authorizer_title: str
    serial_number: Optional[str] = "001"
    
class Form1572Data(FormData):
    """Data for FDA Form 1572"""
    investigator_address: str
    irb_name: str
    irb_address: str
    clinical_lab_name: str
    clinical_lab_address: str
    research_facility_name: str
    research_facility_address: str
    subinvestigators: str
    
class Form3674Data(FormData):
    """Data for FDA Form 3674"""
    nct_number: str
    certifier_name: str
    certifier_title: str
    certifier_address: str
    certifier_email: str
    certifier_phone: str
    certifier_fax: Optional[str] = None
    
class CoverLetterData(FormData):
    """Data for cover letter"""
    contact_name: str
    contact_email: str
    contact_phone: str
    authorizer_name: str
    authorizer_title: str

# ------------------ Health ------------------
@app.get("/health")
async def health_check():
    """Check if the service is healthy"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

# ------------------ Project Data ------------------
@app.get("/projects")
async def list_projects():
    """
    Get available projects - simulated data for demo purposes
    In a real environment, we would connect to Benchling or another LIMS
    """
    # Provide sample projects for demonstration
    sample_projects = [
        {"id": "P001", "name": "Oncology - New Cancer Drug"},
        {"id": "P002", "name": "Cardiovascular - Hypertension Treatment"},
        {"id": "P003", "name": "Neurology - Alzheimer's Treatment"},
        {"id": "P004", "name": "Immunology - Autoimmune Disorder Treatment"},
        {"id": "P005", "name": "Infectious Disease - Novel Antibiotic"}
    ]
    
    return {"projects": sample_projects}

# ------------------ Form Endpoints ------------------
@app.post("/api/ind/form1571")
async def generate_form_1571_endpoint(data: Form1571Data):
    """
    Generate FDA Form 1571 (Investigational New Drug Application)
    """
    try:
        logger.info(f"Generating Form 1571 for {data.sponsor_name}")
        
        # Set submission date if not provided
        if not data.submission_date:
            data.submission_date = datetime.now().strftime("%Y-%m-%d")
            
        # Generate the document
        document = generate_form_1571(data.dict())
        
        # Return the document as a downloadable file
        return StreamingResponse(
            io.BytesIO(document.getvalue()),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=Form_FDA_1571_{data.sponsor_name.replace(' ', '_')}.docx"}
        )
    except Exception as e:
        logger.error(f"Error generating Form 1571: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating Form 1571: {str(e)}")

@app.post("/api/ind/form1572")
async def generate_form_1572_endpoint(data: Form1572Data):
    """
    Generate FDA Form 1572 (Statement of Investigator)
    """
    try:
        logger.info(f"Generating Form 1572 for {data.principal_investigator_name}")
        
        # Set submission date if not provided
        if not data.submission_date:
            data.submission_date = datetime.now().strftime("%Y-%m-%d")
            
        # Generate the document
        document = generate_form_1572(data.dict())
        
        # Return the document as a downloadable file
        return StreamingResponse(
            io.BytesIO(document.getvalue()),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=Form_FDA_1572_{data.principal_investigator_name.replace(' ', '_')}.docx"}
        )
    except Exception as e:
        logger.error(f"Error generating Form 1572: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating Form 1572: {str(e)}")

@app.post("/api/ind/form3674")
async def generate_form_3674_endpoint(data: Form3674Data):
    """
    Generate FDA Form 3674 (Certification of Compliance with ClinicalTrials.gov)
    """
    try:
        logger.info(f"Generating Form 3674 for {data.sponsor_name}")
        
        # Set submission date if not provided
        if not data.submission_date:
            data.submission_date = datetime.now().strftime("%Y-%m-%d")
            
        # Generate the document
        document = generate_form_3674(data.dict())
        
        # Return the document as a downloadable file
        return StreamingResponse(
            io.BytesIO(document.getvalue()),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=Form_FDA_3674_{data.certifier_name.replace(' ', '_')}.docx"}
        )
    except Exception as e:
        logger.error(f"Error generating Form 3674: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating Form 3674: {str(e)}")

@app.post("/api/ind/cover-letter")
async def generate_cover_letter_endpoint(data: CoverLetterData):
    """
    Generate a cover letter for IND submission
    """
    try:
        logger.info(f"Generating Cover Letter for {data.sponsor_name}")
        
        # Set submission date if not provided
        if not data.submission_date:
            data.submission_date = datetime.now().strftime("%Y-%m-%d")
            
        # Generate the document
        document = generate_cover_letter(data.dict())
        
        # Return the document as a downloadable file
        return StreamingResponse(
            io.BytesIO(document.getvalue()),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=Cover_Letter_{data.sponsor_name.replace(' ', '_')}.docx"}
        )
    except Exception as e:
        logger.error(f"Error generating Cover Letter: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating Cover Letter: {str(e)}")

# For backward compatibility with the project-based route pattern
@app.get("/api/ind/{pid}/forms/1571")
async def get_1571(pid: str):
    """Legacy endpoint for project-based form generation"""
    # Create a default form data object
    data = Form1571Data(
        sponsor_name="Acme Biotech, Inc.",
        sponsor_address="123 Science Way, Boston, MA 02118",
        sponsor_phone="555-123-4567",
        drug_name="TestDrug",
        indication="Advanced Cancer",
        protocol_number=f"PROTO-{pid}",
        protocol_title=f"A Clinical Trial for {pid}",
        phase="Phase 1",
        principal_investigator_name="Dr. Jane Doe",
        submission_date=datetime.now().strftime("%Y-%m-%d"),
        authorizer_name="John Smith",
        authorizer_title="Chief Medical Officer"
    )
    
    return await generate_form_1571_endpoint(data)

@app.get("/api/ind/{pid}/forms/1572")
async def get_1572(pid: str):
    """Legacy endpoint for project-based form generation"""
    # Create a default form data object
    data = Form1572Data(
        sponsor_name="Acme Biotech, Inc.",
        sponsor_address="123 Science Way, Boston, MA 02118",
        sponsor_phone="555-123-4567",
        drug_name="TestDrug",
        indication="Advanced Cancer",
        protocol_number=f"PROTO-{pid}",
        protocol_title=f"A Clinical Trial for {pid}",
        phase="Phase 1",
        principal_investigator_name="Dr. Jane Doe",
        submission_date=datetime.now().strftime("%Y-%m-%d"),
        investigator_address="123 Research Lane, Boston, MA 02118",
        irb_name="Boston Medical IRB",
        irb_address="456 Hospital Road, Boston, MA 02118",
        clinical_lab_name="Advanced Diagnostics Lab",
        clinical_lab_address="789 Lab Street, Boston, MA 02118",
        research_facility_name="Boston Research Center",
        research_facility_address="101 Science Park, Boston, MA 02118",
        subinvestigators="Dr. James Smith, Dr. Mary Johnson"
    )
    
    return await generate_form_1572_endpoint(data)

@app.get("/api/ind/{pid}/forms/3674")
async def get_3674(pid: str):
    """Legacy endpoint for project-based form generation"""
    # Create a default form data object
    data = Form3674Data(
        sponsor_name="Acme Biotech, Inc.",
        sponsor_address="123 Science Way, Boston, MA 02118",
        sponsor_phone="555-123-4567",
        drug_name="TestDrug",
        indication="Advanced Cancer",
        protocol_number=f"PROTO-{pid}",
        protocol_title=f"A Clinical Trial for {pid}",
        phase="Phase 1",
        principal_investigator_name="Dr. Jane Doe",
        submission_date=datetime.now().strftime("%Y-%m-%d"),
        nct_number="NCT01234567",
        certifier_name="John Smith",
        certifier_title="Chief Medical Officer",
        certifier_address="123 Science Way, Boston, MA 02118",
        certifier_email="jsmith@acmebiotech.com",
        certifier_phone="555-123-4567"
    )
    
    return await generate_form_3674_endpoint(data)
