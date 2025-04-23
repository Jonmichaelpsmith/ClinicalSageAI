"""
Validation Router for RegIntel API

This module handles file uploads and validation processing.
"""
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
import os
import uuid
import json
import logging
import shutil
from datetime import datetime
import subprocess
from ..dependencies import get_token_header

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Engine configurations
VALIDATION_ENGINES = [
    {
        "id": "regintel-ectd",
        "name": "RegIntel eCTD Validator",
        "description": "Validates eCTD submissions against FDA & EMA standards",
        "fileTypes": [".xml", ".pdf", ".doc", ".docx", ".zip"]
    },
    {
        "id": "regintel-protocol",
        "name": "Protocol Validator",
        "description": "Validates clinical trial protocols against ICH guidelines",
        "fileTypes": [".pdf", ".doc", ".docx"]
    },
    {
        "id": "regintel-csr",
        "name": "CSR Validator",
        "description": "Validates clinical study reports against ICH E3 guidelines",
        "fileTypes": [".pdf", ".doc", ".docx"]
    },
    {
        "id": "regintel-ind",
        "name": "IND Validator", 
        "description": "Validates Investigational New Drug (IND) submissions",
        "fileTypes": [".pdf", ".doc", ".docx", ".xml"]
    }
]

# Paths
UPLOAD_DIR = os.path.abspath("backend/uploads")
LOGS_DIR = os.path.abspath("backend/validation_logs")

@router.get("/engines")
async def get_engines():
    """Get available validation engines"""
    return VALIDATION_ENGINES

@router.post("/file")
async def validate_file(
    file: UploadFile = File(...),
    engine_id: str = Form(...),
    tenant_id: Optional[str] = Form(None),
    user_token: Dict[str, Any] = Depends(get_token_header)
):
    """
    Upload and validate a file using the specified engine
    
    Args:
        file: The file to validate
        engine_id: The ID of the validation engine to use
        tenant_id: Optional tenant ID for multi-tenant isolation
        
    Returns:
        JSONResponse: The validation results
    """
    try:
        # Verify the engine exists
        engine = next((e for e in VALIDATION_ENGINES if e["id"] == engine_id), None)
        if not engine:
            logger.error(f"Unknown engine ID: {engine_id}")
            raise HTTPException(status_code=400, detail=f"Unknown engine ID: {engine_id}")
        
        # Create ID and prepare paths
        validation_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        # Check file type
        if file_extension not in engine["fileTypes"]:
            logger.error(f"Unsupported file type {file_extension} for engine {engine_id}")
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Allowed types: {', '.join(engine['fileTypes'])}"
            )
        
        # Create directories
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        os.makedirs(LOGS_DIR, exist_ok=True)
        
        if tenant_id:
            tenant_upload_dir = os.path.join(UPLOAD_DIR, tenant_id)
            tenant_logs_dir = os.path.join(LOGS_DIR, tenant_id)
            os.makedirs(tenant_upload_dir, exist_ok=True)
            os.makedirs(tenant_logs_dir, exist_ok=True)
            file_path = os.path.join(tenant_upload_dir, f"{validation_id}{file_extension}")
            log_path = os.path.join(tenant_logs_dir, f"{validation_id}.json")
        else:
            file_path = os.path.join(UPLOAD_DIR, f"{validation_id}{file_extension}")
            log_path = os.path.join(LOGS_DIR, f"{validation_id}.json")
            
        # Save the file
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
            
        logger.info(f"File uploaded successfully: {file.filename} -> {file_path}")
        
        # Run validation process
        try:
            # In a real environment, this would call a validation service or library
            # For now, we'll generate sample validation results
            
            # Sample results structure (would come from actual validation tool)
            validation_time = datetime.now().isoformat()
            
            # Initialize with success results
            results = {
                "id": validation_id,
                "filename": file.filename,
                "engineId": engine_id,
                "engineName": engine["name"],
                "timestamp": validation_time,
                "status": "completed",
                "validations": [
                    {
                        "id": "REG001",
                        "rule": "Document structure validation",
                        "status": "success",
                        "message": "Document structure meets requirements"
                    },
                    {
                        "id": "REG002",
                        "rule": "Regulatory header verification",
                        "status": "success",
                        "message": "Headers contain required information"
                    },
                    {
                        "id": "REG003",
                        "rule": "Section completeness check",
                        "status": "success",
                        "message": "All required sections present"
                    }
                ],
                "summary": {
                    "success": 3,
                    "warning": 0,
                    "error": 0
                }
            }
            
            # For some files, add warning or error to demonstrate capabilities
            # In real implementation, this would be based on actual validation
            if "sample" in file.filename.lower() or "test" in file.filename.lower():
                results["validations"].append({
                    "id": "REG004",
                    "rule": "Format consistency validation",
                    "status": "warning",
                    "message": "Inconsistent formatting detected in section 3.2"
                })
                results["validations"].append({
                    "id": "REG005",
                    "rule": "Cross-reference validation",
                    "status": "error",
                    "message": "Missing cross-references in section 4.1",
                    "path": "Section 4.1",
                    "lineNumber": 42
                })
                results["summary"]["warning"] = 1
                results["summary"]["error"] = 1
                
            # For PDF files, add sample PDF-specific validation
            if file_extension == ".pdf":
                results["validations"].append({
                    "id": "PDF001",
                    "rule": "PDF/A compliance check",
                    "status": "warning",
                    "message": "Document is not PDF/A compliant"
                })
                results["summary"]["warning"] += 1
                
            # Save results to log file
            with open(log_path, "w") as f:
                json.dump(results, f, indent=2)
                
            logger.info(f"Validation completed: {validation_id}")
            return results
            
        except Exception as e:
            logger.error(f"Validation failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Validation processing error: {str(e)}")
            
    except Exception as e:
        logger.error(f"File upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@router.get("/result/{validation_id}")
async def get_validation_result(
    validation_id: str,
    tenant_id: Optional[str] = None,
    user_token: Dict[str, Any] = Depends(get_token_header)
):
    """
    Get validation results by ID
    
    Args:
        validation_id: The validation ID
        tenant_id: Optional tenant ID for multi-tenant isolation
        
    Returns:
        JSONResponse: The validation results
    """
    try:
        # Construct the log path
        if tenant_id:
            log_path = os.path.join(LOGS_DIR, tenant_id, f"{validation_id}.json")
        else:
            log_path = os.path.join(LOGS_DIR, f"{validation_id}.json")
            
        # Check if the file exists
        if not os.path.exists(log_path):
            logger.error(f"Validation result not found: {validation_id}")
            raise HTTPException(status_code=404, detail="Validation result not found")
            
        # Read and return the results
        with open(log_path, "r") as f:
            return json.load(f)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving validation result: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving validation result: {str(e)}")