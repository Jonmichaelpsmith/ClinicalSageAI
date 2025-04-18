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

from .ingestion.benchling_connector import BenchlingConnector

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
    
class BenchlingCredentials(BaseModel):
    """Benchling API credentials"""
    api_key: str
    tenant_id: str

# Initialize connector with empty credentials (will be set during API calls)
benchling_connector = None

def get_benchling_connector(credentials: BenchlingCredentials = Depends()):
    """
    Returns a BenchlingConnector instance with provided credentials
    """
    global benchling_connector
    if not benchling_connector:
        benchling_connector = BenchlingConnector(
            api_key=credentials.api_key,
            tenant_id=credentials.tenant_id
        )
    return benchling_connector

@app.get("/health")
async def health_check():
    """Check if the service is healthy"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

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
            headers={"Content-Disposition": f"attachment; filename=Form_FDA_3674_{data.sponsor_name.replace(' ', '_')}.docx"}
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
        logger.info(f"Generating cover letter for {data.sponsor_name}")
        
        # Set submission date if not provided
        if not data.submission_date:
            data.submission_date = datetime.now().strftime("%Y-%m-%d")
            
        # Generate the document
        document = generate_cover_letter(data.dict())
        
        # Return the document as a downloadable file
        return StreamingResponse(
            io.BytesIO(document.getvalue()),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=IND_Cover_Letter_{data.sponsor_name.replace(' ', '_')}.docx"}
        )
    except Exception as e:
        logger.error(f"Error generating cover letter: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating cover letter: {str(e)}")

@app.post("/api/ind/benchling/studies")
async def get_benchling_studies(credentials: BenchlingCredentials):
    """
    Get list of studies from Benchling
    """
    try:
        connector = BenchlingConnector(
            api_key=credentials.api_key,
            tenant_id=credentials.tenant_id
        )
        studies = connector.get_studies()
        return JSONResponse(content={"studies": studies})
    except Exception as e:
        logger.error(f"Error retrieving Benchling studies: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving Benchling studies: {str(e)}")

@app.post("/api/ind/benchling/study/{study_id}")
async def get_benchling_study_details(
    study_id: str,
    credentials: BenchlingCredentials
):
    """
    Get detailed study information from Benchling
    """
    try:
        connector = BenchlingConnector(
            api_key=credentials.api_key,
            tenant_id=credentials.tenant_id
        )
        study_details = connector.get_study_details(study_id)
        return JSONResponse(content={"study": study_details})
    except Exception as e:
        logger.error(f"Error retrieving Benchling study details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving Benchling study details: {str(e)}")

@app.post("/api/ind/benchling/ind-export/{study_id}")
async def export_ind_data(
    study_id: str,
    credentials: BenchlingCredentials
):
    """
    Export IND data from Benchling for the specified study
    """
    try:
        connector = BenchlingConnector(
            api_key=credentials.api_key,
            tenant_id=credentials.tenant_id
        )
        ind_data = connector.export_ind_data(study_id)
        return JSONResponse(content={"ind_data": ind_data})
    except Exception as e:
        logger.error(f"Error exporting IND data from Benchling: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error exporting IND data from Benchling: {str(e)}")

@app.post("/api/ind/generate-all-forms")
async def generate_all_forms(data: Dict[str, Any] = Body(...)):
    """
    Generate all IND forms (1571, 1572, 3674, and cover letter) from a unified dataset
    """
    try:
        logger.info(f"Generating all forms for {data.get('sponsor_name', '')}")
        
        # Set submission date if not provided
        if not data.get("submission_date"):
            data["submission_date"] = datetime.now().strftime("%Y-%m-%d")
        
        # Generate all documents
        form1571 = generate_form_1571(data)
        form1572 = generate_form_1572(data)
        form3674 = generate_form_3674(data)
        cover_letter = generate_cover_letter(data)
        
        # We can't return multiple files in a single response
        # For now, just return a success message and make the frontend
        # call the individual endpoints
        return JSONResponse(content={
            "success": True,
            "message": "Documents generated successfully",
            "endpoints": {
                "form1571": "/api/ind/form1571",
                "form1572": "/api/ind/form1572", 
                "form3674": "/api/ind/form3674",
                "cover_letter": "/api/ind/cover-letter"
            }
        })
    except Exception as e:
        logger.error(f"Error generating all forms: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating all forms: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)