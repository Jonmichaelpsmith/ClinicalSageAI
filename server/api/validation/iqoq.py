"""
IQ/OQ Validation Report Generation API

This module provides endpoints for generating Installation Qualification (IQ) and
Operational Qualification (OQ) validation reports for regulatory compliance purposes.
"""
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from server.utils.iqoq_generator import generate_iqoq

router = APIRouter(prefix="/api/validation", tags=["validation"])

@router.get("/iqoq-report")
async def generate_iqoq_report():
    """
    Generate and download an IQ/OQ validation report
    
    This endpoint generates a PDF report containing:
    - System component inventory
    - Version information
    - Test execution results
    - Compliance status for FDA, EMA, and PMDA requirements
    
    Returns:
        FileResponse: PDF file containing the validation report
    """
    try:
        # Generate the IQ/OQ report
        # Use a more accessible directory for the Replit environment
        output_dir = os.path.join(os.getcwd(), "output", "validation")
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate the report
        pdf_path = generate_iqoq(output_dir)
        
        # Return the PDF file
        return FileResponse(
            path=pdf_path,
            filename=os.path.basename(pdf_path),
            media_type="application/pdf"
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to generate validation report: {str(e)}"}
        )