# /models/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class ProtocolRequest(BaseModel):
    """Request model for protocol suggestion endpoint"""
    indication: str
    phase: Optional[str] = None
    study_type: Optional[str] = None
    therapeutic_area: Optional[str] = None
    sample_size: Optional[int] = None
    population: Optional[str] = None
    additional_context: Optional[str] = None


class ContinueRequest(BaseModel):
    """Request model for continuing a workflow with a specific section"""
    thread_id: str
    section: str
    study_id: Optional[str] = None
    context: Optional[str] = None


class EvidenceQuery(BaseModel):
    """Request model for evidence lookup"""
    topic: str
    thread_id: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None


class ReportExportRequest(BaseModel):
    """Request model for PDF export"""
    indication: str = Field(..., description="The medical indication to create a report for")
    title: Optional[str] = Field(None, description="Custom title for the report")
    email: Optional[str] = Field(None, description="Send report to this email address")