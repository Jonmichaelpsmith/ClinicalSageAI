"""
IND XML Validation Endpoints

This module provides FastAPI routes for validating eCTD XML files against DTD specifications.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, List
import os
import sys

# Add the server directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.xml_validator import validate_sequence_xml

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