"""
Data models for the TrialSage RegIntel Validator backend.
"""

from pydantic import BaseModel
from typing import Optional, List


class User(BaseModel):
    """User model with tenant information for multi-tenant isolation."""
    id: str
    email: str
    tenant_id: str
    full_name: Optional[str] = None
    is_active: bool = True
    
    
class ValidationRun(BaseModel):
    """Record of a validation run."""
    id: str
    tenant_id: str
    status: str
    report_path: str
    define_path: str
    
    
class ValidationError(BaseModel):
    """Individual validation error."""
    rule: str
    message: str
    path: Optional[str] = None
    line: Optional[int] = None
    column: Optional[int] = None
    severity: str = "error"
    
    
class ValidationResult(BaseModel):
    """Complete validation result."""
    errors: List[ValidationError]
    reportUrl: str
    defineXmlUrl: str