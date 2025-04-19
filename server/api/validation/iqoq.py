# iqoq.py – API endpoint to generate and download IQ/OQ validation bundle
from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import os
from server.utils.iqoq_generator import generate_iqoq

router = APIRouter(prefix="/api/validation", tags=["validation"])

@router.post("/iqoq")
async def run_iqoq(background_tasks: BackgroundTasks):
    """
    Generate IQ/OQ validation documentation bundle as ZIP 
    containing IQ PDF, OQ PDF, CSV test data, and SHA-256 manifest
    
    Returns:
        dict: Path to generated ZIP and timestamp
    """
    try:
        # Generate the IQ/OQ documentation bundle
        result = generate_iqoq()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"IQ/OQ generation failed: {str(e)}")

@router.get("/iqoq/download")
async def download_iqoq(path: str):
    """
    Download the generated IQ/OQ ZIP bundle
    
    Args:
        path: Full path to the ZIP file
        
    Returns:
        FileResponse: The IQ/OQ ZIP bundle for download
    """
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=f"File not found: {path}")
    
    # Get file name for the content-disposition header
    filename = os.path.basename(path)
    
    return FileResponse(
        path=path,
        filename=filename,
        media_type='application/zip'
    )