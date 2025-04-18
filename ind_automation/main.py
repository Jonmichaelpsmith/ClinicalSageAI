"""
FDA IND Forms Automation FastAPI Service

This service provides endpoints for generating various FDA forms required for
Investigational New Drug (IND) applications, including:
- Form 1571 (IND Application)
- Form 1572 (Statement of Investigator)
- Form 3674 (ClinicalTrials.gov Certification)
- Cover Letter for IND submission

The service also includes functions for importing data from Benchling LIMS.
"""

import os
import io
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging

# Import template renderer functions
from templates import render_form1571, render_form1572, render_form3674, render_cover_letter

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="FDA IND Forms Automation API",
    description="API for generating FDA IND submission forms",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define data models for form generation
class Form1571Data(BaseModel):
    sponsor_name: str
    IND_number: Optional[str] = "Pending"
    drug_name: str
    phase1_checked: Optional[str] = "☐"
    phase2_checked: Optional[str] = "☐"
    phase3_checked: Optional[str] = "☐"
    other_phase_checked: Optional[str] = "☐"
    other_phase_text: Optional[str] = ""
    protocol_number: str
    submission_date: str

class Form1572Data(BaseModel):
    principal_investigator_name: str
    investigator_address: str
    protocol_number: str
    drug_name: str
    phase: str
    submission_date: str

class Form3674Data(BaseModel):
    sponsor_name: str
    drug_name: str
    nct_number: str
    study_registration_statement: str
    certifier_name: str
    submission_date: str

class CoverLetterData(BaseModel):
    sponsor_name: str
    sponsor_address: str
    submission_date: str
    IND_number: Optional[str] = "Pending"
    drug_name: str
    indication: str
    serial_number: Optional[str] = "0001"
    contact_name: str
    contact_phone: str
    contact_email: str

# API endpoints for health check
@app.get("/health")
async def health_check():
    """Health check endpoint for service monitoring"""
    return {"status": "healthy", "service": "ind-automation-api"}

# API endpoints for form generation
@app.post("/generate/form1571")
async def generate_form1571(data: Form1571Data):
    """Generate FDA Form 1571 (IND Application)"""
    try:
        logger.info(f"Generating Form 1571 for {data.drug_name}")
        
        # Convert data model to dict
        data_dict = data.dict()
        
        # Generate the document
        docx_bytes = render_form1571(data_dict)
        
        if not docx_bytes:
            raise HTTPException(status_code=500, detail="Failed to generate Form 1571")
        
        # Return the document as a downloadable file
        return StreamingResponse(
            docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=FDA_Form_1571_{data.drug_name.replace(' ', '_')}.docx"}
        )
    except Exception as e:
        logger.error(f"Error generating Form 1571: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Form 1571: {str(e)}")

@app.post("/generate/form1572")
async def generate_form1572(data: Form1572Data):
    """Generate FDA Form 1572 (Statement of Investigator)"""
    try:
        logger.info(f"Generating Form 1572 for {data.principal_investigator_name}")
        
        # Convert data model to dict
        data_dict = data.dict()
        
        # Generate the document
        docx_bytes = render_form1572(data_dict)
        
        if not docx_bytes:
            raise HTTPException(status_code=500, detail="Failed to generate Form 1572")
        
        # Return the document as a downloadable file
        return StreamingResponse(
            docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=FDA_Form_1572_{data.principal_investigator_name.replace(' ', '_')}.docx"}
        )
    except Exception as e:
        logger.error(f"Error generating Form 1572: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Form 1572: {str(e)}")

@app.post("/generate/form3674")
async def generate_form3674(data: Form3674Data):
    """Generate FDA Form 3674 (ClinicalTrials.gov Certification)"""
    try:
        logger.info(f"Generating Form 3674 for {data.drug_name}")
        
        # Convert data model to dict
        data_dict = data.dict()
        
        # Generate the document
        docx_bytes = render_form3674(data_dict)
        
        if not docx_bytes:
            raise HTTPException(status_code=500, detail="Failed to generate Form 3674")
        
        # Return the document as a downloadable file
        return StreamingResponse(
            docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=FDA_Form_3674_{data.drug_name.replace(' ', '_')}.docx"}
        )
    except Exception as e:
        logger.error(f"Error generating Form 3674: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Form 3674: {str(e)}")

@app.post("/generate/cover-letter")
async def generate_cover_letter(data: CoverLetterData):
    """Generate IND Cover Letter"""
    try:
        logger.info(f"Generating Cover Letter for {data.drug_name}")
        
        # Convert data model to dict
        data_dict = data.dict()
        
        # Generate the document
        docx_bytes = render_cover_letter(data_dict)
        
        if not docx_bytes:
            raise HTTPException(status_code=500, detail="Failed to generate Cover Letter")
        
        # Return the document as a downloadable file
        return StreamingResponse(
            docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=IND_Cover_Letter_{data.drug_name.replace(' ', '_')}.docx"}
        )
    except Exception as e:
        logger.error(f"Error generating Cover Letter: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Cover Letter: {str(e)}")

@app.post("/generate/all-forms")
async def generate_all_forms(
    form1571: Form1571Data,
    form1572: Form1572Data,
    form3674: Form3674Data,
    cover_letter: CoverLetterData
):
    """
    Generate all four IND submission forms as a batch
    (This endpoint would typically need to return a zip file with all documents.
    For simplicity, this is left as a stub that can be implemented as needed.)
    """
    return {
        "status": "success",
        "message": "Batch form generation endpoint placeholder. Individual form endpoints are available."
    }

# Benchling data integration endpoint stub
class BenchlingCredentials(BaseModel):
    api_key: str
    tenant_id: str

@app.post("/import/benchling-data")
async def import_benchling_data(credentials: BenchlingCredentials):
    """
    Import data from Benchling LIMS
    This is a stub that would be implemented to pull real data from Benchling
    """
    try:
        # This would typically call a real Benchling API client
        return {
            "status": "success",
            "message": "Benchling data import placeholder. This would connect to Benchling API.",
            "data": {
                "compounds": [
                    {"id": "placeholder-1", "name": "Test Compound 1"},
                    {"id": "placeholder-2", "name": "Test Compound 2"}
                ]
            }
        }
    except Exception as e:
        logger.error(f"Error importing Benchling data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to import Benchling data: {str(e)}")

# Run the app with Uvicorn when executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)