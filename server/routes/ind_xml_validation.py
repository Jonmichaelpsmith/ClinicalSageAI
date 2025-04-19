"""
IND XML Validation and Acknowledgment Endpoints

This module provides FastAPI routes for:
1. Validating eCTD XML files against DTD specifications
2. Retrieving FDA ESG acknowledgment statuses
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional
import os
import sys
from datetime import datetime

# Add the server directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.xml_validator import validate_sequence_xml
from server.db import SessionLocal
from server.models.sequence import INDSequence

router = APIRouter()

@router.get("/api/ind/sequence/{sequence_id}/validate", response_model=Dict[str, List[str]])
async def validate_sequence(sequence_id: str):
    """
    Validate index.xml and us-regional.xml files for a specific eCTD sequence.
    
    Parameters:
    - sequence_id: Four-digit sequence identifier (e.g., '0001')
    
    Returns:
    - JSON with validation results. Empty arrays indicate valid XML.
    """
    try:
        # Validate both XML files in the sequence
        results = validate_sequence_xml(sequence_id)
        
        # Format the response
        return {
            "status": "success",
            "validation": {
                "index": results["index"],
                "regional": results["regional"],
                "valid": len(results["index"]) == 0 and len(results["regional"]) == 0
            }
        }
    except FileNotFoundError as e:
        # Handle case where sequence or DTD files don't exist
        return JSONResponse(
            status_code=404,
            content={
                "status": "error", 
                "message": str(e),
                "validation": {"index": [], "regional": [], "valid": False}
            }
        )
    except Exception as e:
        # Handle other errors
        return JSONResponse(
            status_code=500,
            content={
                "status": "error", 
                "message": f"Validation error: {str(e)}",
                "validation": {"index": [], "regional": [], "valid": False}
            }
        )
        
@router.get("/api/ind/sequence/{sequence_id}/acks")
async def get_sequence_acks(sequence_id: str):
    """
    Retrieve FDA ESG acknowledgment statuses for a specific sequence.
    
    Parameters:
    - sequence_id: Four-digit sequence identifier (e.g., '0001')
    
    Returns:
    - JSON with ACK file statuses and paths
    """
    try:
        db = SessionLocal()
        sequence = db.query(INDSequence).filter(INDSequence.sequence == sequence_id).first()
        
        if not sequence:
            db.close()
            return JSONResponse(
                status_code=404,
                content={"status": "error", "message": f"Sequence {sequence_id} not found"}
            )
            
        # Format the response with acknowledgment information
        response = {
            "status": "success",
            "sequence_id": sequence_id,
            "submission_status": sequence.status,
            "acknowledgments": {
                "ack1": {
                    "received": sequence.ack1_path is not None,
                    "path": sequence.ack1_path,
                    "timestamp": None
                },
                "ack2": {
                    "received": sequence.ack2_path is not None,
                    "path": sequence.ack2_path,
                    "timestamp": None,
                    "success": sequence.status == "ESG ACK2 Success" if sequence.ack2_path else None
                },
                "ack3": {
                    "received": sequence.ack3_path is not None,
                    "path": sequence.ack3_path,
                    "timestamp": None
                }
            },
            "last_updated": sequence.updated_at.isoformat() if hasattr(sequence, 'updated_at') and sequence.updated_at else None
        }
        
        db.close()
        return response
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Error retrieving acknowledgments: {str(e)}"}
        )