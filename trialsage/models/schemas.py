# /models/schemas.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any


class ProtocolRequest(BaseModel):
    """Request model for generating protocol suggestions"""
    indication: str = Field(..., description="The medical indication/condition for the protocol")
    phase: Optional[str] = Field(None, description="Clinical trial phase (e.g., Phase I, II, III)")
    sample_size: Optional[int] = Field(None, description="Target sample size for the study")
    duration_weeks: Optional[int] = Field(None, description="Study duration in weeks")
    controls: Optional[str] = Field(None, description="Type of control group")
    primary_endpoint: Optional[str] = Field(None, description="Primary endpoint measure")
    thread_id: Optional[str] = Field(None, description="Existing conversation thread ID")


class ContinueRequest(BaseModel):
    """Request model for continuing a study workflow"""
    thread_id: str = Field(..., description="The ongoing conversation thread ID")
    study_id: Optional[str] = Field(None, description="Study identifier")
    section: str = Field(..., description="Section to continue (e.g., 'ind', 'sap', 'risk')")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context for the continuation")


class EvidenceQuery(BaseModel):
    """Request model for retrieving supporting evidence"""
    topic: str = Field(..., description="The topic to find evidence for")
    thread_id: Optional[str] = Field(None, description="Existing conversation thread ID")
    indication: Optional[str] = Field(None, description="Filter by indication")
    phase: Optional[str] = Field(None, description="Filter by clinical trial phase")
    limit: Optional[int] = Field(10, description="Maximum number of evidence items to return")


class ReportExportRequest(BaseModel):
    """Request model for exporting a PDF report"""
    indication: str = Field(..., description="The medical indication/condition for the report")
    thread_id: Optional[str] = Field(None, description="Existing conversation thread ID")
    title: Optional[str] = Field(None, description="Custom title for the report")
    include_analysis: Optional[bool] = Field(True, description="Include statistical analysis in the report")
    include_evidence: Optional[bool] = Field(True, description="Include supporting evidence in the report")
    include_regulatory: Optional[bool] = Field(True, description="Include regulatory considerations in the report")
    format: Optional[str] = Field("pdf", description="Export format (pdf, docx, md)")


class EmailReportRequest(BaseModel):
    """Request model for emailing a report"""
    email: str = Field(..., description="Email address to send the report to")
    report_url: str = Field(..., description="URL of the report to send")
    subject: Optional[str] = Field(None, description="Email subject line")
    body: Optional[str] = Field(None, description="Custom email body text")


class ReportsListRequest(BaseModel):
    """Request model for listing available reports"""
    indication: Optional[str] = Field(None, description="Filter by indication")
    limit: Optional[int] = Field(10, description="Maximum number of reports to return")
    sort_by: Optional[str] = Field("date", description="Sort field (date, indication, title)")
    sort_dir: Optional[str] = Field("desc", description="Sort direction (asc, desc)")


class ApiResponse(BaseModel):
    """Standard API response model"""
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="Response message")
    data: Optional[Any] = Field(None, description="Response data")
    thread_id: Optional[str] = Field(None, description="Conversation thread ID, if applicable")


class ProtocolResponse(ApiResponse):
    """Protocol suggestion response model"""
    protocol: Optional[Dict[str, Any]] = Field(None, description="Protocol suggestion data")


class ContinueResponse(ApiResponse):
    """Continue workflow response model"""
    section: Optional[str] = Field(None, description="Section that was continued")
    data: Optional[Dict[str, Any]] = Field(None, description="Section data")


class EvidenceResponse(ApiResponse):
    """Evidence query response model"""
    topic: Optional[str] = Field(None, description="Topic that was queried")
    evidence: Optional[List[Dict[str, Any]]] = Field(None, description="Evidence items")


class ExportResponse(ApiResponse):
    """Report export response model"""
    download_url: Optional[str] = Field(None, description="URL to download the report")
    filename: Optional[str] = Field(None, description="Filename of the report")
    indication: Optional[str] = Field(None, description="Indication covered in the report")


class EmailResponse(ApiResponse):
    """Email report response model"""
    sent_to: Optional[str] = Field(None, description="Email address the report was sent to")
    report_url: Optional[str] = Field(None, description="URL of the report that was sent")


class ReportsListResponse(ApiResponse):
    """Reports list response model"""
    reports: Optional[List[Dict[str, Any]]] = Field(None, description="List of available reports")
    total: Optional[int] = Field(None, description="Total number of reports available")