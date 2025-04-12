# /trialsage/models/schemas.py
# Schema models for request/response validation

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class ProtocolRequest(BaseModel):
    """Request model for protocol generation"""
    indication: str = Field(..., description="Disease or condition being studied")
    phase: str = Field("Phase II", description="Clinical trial phase (e.g., Phase I, II, III, IV)")
    primary_endpoint: Optional[str] = Field(None, description="Primary endpoint for the trial")
    thread_id: Optional[str] = Field(None, description="Thread ID for maintaining conversation context")
    include_quotes: bool = Field(True, description="Include quotes from cited CSRs")
    verbose: bool = Field(True, description="Include detailed information in response")


class ProtocolResponse(BaseModel):
    """Response model for protocol generation"""
    recommendation: str = Field(..., description="Protocol recommendation")
    citations: List[str] = Field([], description="CSR citations that informed the protocol")
    ind_module_2_5: Optional[Dict[str, Any]] = Field(None, description="IND Module 2.5 content")
    risk_summary: Optional[str] = Field(None, description="Regulatory risk analysis")
    thread_id: str = Field(..., description="Thread ID for continuing the conversation")
    quotes: Optional[List[Dict[str, str]]] = Field(None, description="Quotes from cited CSRs")


class ContinueRequest(BaseModel):
    """Request model for continuing a thread"""
    thread_id: str = Field(..., description="Thread ID to continue")
    study_id: str = Field(..., description="Study identifier")
    section: str = Field(..., description="Section to generate (e.g., 2.7, SAP)")
    context: str = Field(..., description="Additional context for generation")


class ContinueResponse(BaseModel):
    """Response model for continuing a thread"""
    section: str = Field(..., description="Section generated")
    content: str = Field(..., description="Generated content")
    thread_id: str = Field(..., description="Thread ID for continuing the conversation")
    message: Optional[str] = Field(None, description="Additional message about the generation")


class EvidenceQuery(BaseModel):
    """Request model for evidence queries"""
    topic: str = Field(..., description="Topic to find evidence for")
    thread_id: Optional[str] = Field(None, description="Thread ID for conversation context")


class EvidenceResponse(BaseModel):
    """Response model for evidence queries"""
    content: str = Field(..., description="Evidence content")
    thread_id: Optional[str] = Field(None, description="Thread ID for continuing the conversation")
    message: str = Field(..., description="Message about the evidence retrieval")


class WeeklyReportResponse(BaseModel):
    """Response model for weekly report generation"""
    success: bool = Field(..., description="Whether the report was successfully generated")
    message: str = Field(..., description="Status message")
    email_sent: bool = Field(..., description="Whether the email was sent")
    report_path: str = Field(..., description="Path to the saved report file")
    brief: str = Field(..., description="Brief summary of the report")
    thread_id: str = Field(..., description="Thread ID for continuing the conversation")