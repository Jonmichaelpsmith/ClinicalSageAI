from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import sys
import os
import json

# Add parent directory to path to import compliance_validator
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from compliance_validator import ComplianceValidator

# Check if OpenAI API key is available
try:
    import openai
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
    openai.api_key = OPENAI_API_KEY
    OPENAI_AVAILABLE = OPENAI_API_KEY is not None
except ImportError:
    OPENAI_AVAILABLE = False

router = APIRouter()
validator = ComplianceValidator()

class ProtocolValidationRequest(BaseModel):
    """Request model for protocol validation."""
    protocol_text: str
    phase: Optional[str] = "general"
    indication: Optional[str] = None

class ValidationIssue(BaseModel):
    """Model for validation issues."""
    issue_type: str
    description: str
    severity: str
    location: Optional[str] = None
    guideline: Optional[str] = None
    suggestion: Optional[str] = None

class ValidationSuggestion(BaseModel):
    """Model for validation suggestions."""
    section: str
    issues: List[str]
    suggestion: str

class ProtocolValidationResponse(BaseModel):
    """Response model for protocol validation."""
    compliance_score: int
    issues: List[ValidationIssue]
    suggestions: List[ValidationSuggestion]
    missing_sections: List[str]
    critical_issues: List[ValidationIssue]
    metadata: Dict[str, Any]

@router.post("/validate-protocol", response_model=ProtocolValidationResponse)
async def validate_protocol(request: ProtocolValidationRequest):
    """
    Validate a clinical trial protocol for regulatory compliance issues.
    
    This endpoint analyzes the protocol text for:
    - Regulatory compliance with FDA, EMA, and ICH guidelines
    - Structural completeness of required protocol sections
    - Alignment with successful CSR practices for the indication
    
    Returns a detailed analysis with compliance score, issues, and suggestions.
    """
    try:
        # Extract metadata from protocol
        metadata = validator.extract_protocol_metadata(request.protocol_text)
        
        # Use provided phase and indication, falling back to extracted values if available
        phase = request.phase
        if not phase or phase == "general":
            phase = metadata.get("phase", "general")
            
        indication = request.indication
        if not indication:
            indication = metadata.get("indication")
        
        # Validate the protocol
        validation_result = validator.validate_protocol(
            protocol_text=request.protocol_text,
            phase=phase,
            indication=indication
        )
        
        # Add metadata to the response
        validation_result["metadata"] = metadata
        
        return validation_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating protocol: {str(e)}")