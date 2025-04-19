"""
Validator Manager

This module provides a unified interface for accessing various regional validators
(FDA, EMA, PMDA) and executing validation against eCTD submissions.
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional

# Import validators
try:
    from server.utils.eu_evalidator import get_validator_profile as get_eu_profile
    from server.utils.eu_evalidator import validate_eu_specifics, parse_validation_report as parse_eu_report
except ImportError:
    # Fall back to local imports if server module not found
    from utils.eu_evalidator import get_validator_profile as get_eu_profile
    from utils.eu_evalidator import validate_eu_specifics, parse_validation_report as parse_eu_report

# Set up logging
logger = logging.getLogger(__name__)

# Load profiles
EU_VALIDATOR_PROFILE = get_eu_profile()

# Mock FDA profile for now
FDA_VALIDATOR_PROFILE = {
    "name": "FDA eValidator",
    "version": "2.1",
    "description": "FDA validation profile for eCTD submissions",
    "supported_regions": ["FDA", "US"],
    "file_format_rules": [
        {
            "id": "FDA-FF-01",
            "description": "PDF files must be PDF 1.4 or higher",
            "severity": "error"
        },
        {
            "id": "FDA-FF-02",
            "description": "File paths must not exceed 150 characters",
            "severity": "error"
        },
    ],
    "required_modules": {
        "initial": [
            {"id": "m1/us/10-cover", "name": "Cover Letter", "required": True},
            {"id": "m1/us/12-form", "name": "Application Form", "required": True},
            {"id": "m2/25-clin-over", "name": "Clinical Overview", "required": True},
            {"id": "m3/32-body-data", "name": "Body of Data", "required": True}
        ],
        "variation": [
            {"id": "m1/us/10-cover", "name": "Cover Letter", "required": True}
        ]
    }
}

# Mock PMDA profile for now
PMDA_VALIDATOR_PROFILE = {
    "name": "PMDA eValidator",
    "version": "1.0",
    "description": "PMDA validation profile for eCTD submissions",
    "supported_regions": ["PMDA", "JP"],
    "file_format_rules": [
        {
            "id": "JP-FF-01",
            "description": "PDF files must not contain JavaScript",
            "severity": "error"
        },
        {
            "id": "JP-FF-02",
            "description": "File names must be in ASCII and 32 characters or less",
            "severity": "error"
        },
    ],
    "required_modules": {
        "initial": [
            {"id": "m1/jp/10-cover", "name": "Cover Letter", "required": True},
            {"id": "m1/jp/13-pi", "name": "Product Information", "required": True},
            {"id": "jp-annex", "name": "Japan-specific Annex", "required": True}
        ],
        "variation": [
            {"id": "m1/jp/10-cover", "name": "Cover Letter", "required": True}
        ]
    }
}

def get_validator_profile(region: str) -> Dict[str, Any]:
    """
    Get validator profile for a specific region
    
    Args:
        region: Regulatory region code (FDA, EMA, PMDA)
        
    Returns:
        Dictionary containing validator profile configuration
    """
    region = region.upper()
    if region in ["EU", "EMA"]:
        return EU_VALIDATOR_PROFILE
    elif region in ["US", "FDA"]:
        return FDA_VALIDATOR_PROFILE
    elif region in ["JP", "PMDA"]:
        return PMDA_VALIDATOR_PROFILE
    else:
        raise ValueError(f"Unsupported region: {region}")

def validate_submission(sequence_path: str, region: str) -> Dict[str, Any]:
    """
    Validate an eCTD submission for a specific region
    
    Args:
        sequence_path: Path to the submission sequence folder
        region: Regulatory region code (FDA, EMA, PMDA)
        
    Returns:
        Dictionary containing validation results
    """
    region = region.upper()
    
    # Basic validation checks
    if not os.path.exists(sequence_path):
        return {
            "status": "error",
            "message": f"Sequence path does not exist: {sequence_path}"
        }
    
    # Region-specific validation
    if region in ["EU", "EMA"]:
        issues = validate_eu_specifics(sequence_path)
    elif region in ["US", "FDA"]:
        # Not fully implemented yet
        issues = []
    elif region in ["JP", "PMDA"]:
        # Not fully implemented yet
        issues = []
    else:
        return {
            "status": "error",
            "message": f"Unsupported region: {region}"
        }
    
    # Process validation results
    passed = len([i for i in issues if i.get("severity") == "error"]) == 0
    
    return {
        "status": "passed" if passed else "failed",
        "validator": f"{region} eValidator",
        "issues": issues,
        "region": region
    }

def get_rules_for_region(region: str) -> Dict[str, Any]:
    """
    Get validation rules for a specific region
    
    Args:
        region: Regulatory region code (FDA, EMA, PMDA)
        
    Returns:
        Dictionary containing validation rules for the region
    """
    profile = get_validator_profile(region)
    
    return {
        "file_format_rules": profile.get("file_format_rules", []),
        "document_rules": profile.get("document_rules", []),
        "sequence_rules": profile.get("sequence_rules", []),
        "metadata_rules": profile.get("metadata_rules", []),
        "required_modules": profile.get("required_modules", {})
    }

def validate_document(document_path: str, region: str, doc_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Validate a single document against regional requirements
    
    Args:
        document_path: Path to the document file
        region: Regulatory region code (FDA, EMA, PMDA)
        doc_type: Document type for context-specific validation
        
    Returns:
        Dictionary containing validation results
    """
    region = region.upper()
    
    # Basic validation checks
    if not os.path.exists(document_path):
        return {
            "status": "error",
            "message": f"Document not found: {document_path}"
        }
    
    # Check file extension
    _, ext = os.path.splitext(document_path)
    if ext.lower() != '.pdf':
        return {
            "status": "error",
            "message": f"Only PDF documents are supported for validation. Found: {ext}"
        }
    
    # Placeholder for actual PDF validation
    # This would typically involve checking PDF properties, bookmarks, etc.
    
    # For now, just return a success response
    return {
        "status": "passed",
        "validator": f"{region} Document Validator",
        "document_path": document_path,
        "document_type": doc_type or "unknown",
        "issues": []
    }