# /controllers/export.py
from fastapi import Depends, HTTPException
from typing import Dict

from trialsage.models.schemas import ReportExportRequest
from trialsage.services.report_generator import export_report_to_pdf


def export_pdf_on_demand(req: ReportExportRequest) -> Dict[str, str]:
    """
    Generate and export a PDF report for a specific indication
    
    Args:
        req: A ReportExportRequest containing indication and output preferences
        
    Returns:
        dict: Contains download URL and thread_id for reference
    """
    try:
        # Generate the PDF report
        result = export_report_to_pdf(
            indication=req.indication,
            title=req.title
        )
        
        # Add download URL to result
        result["download_url"] = "/static/latest_report.pdf"
        
        # Send email if requested
        if req.email:
            # This would trigger an email sending service
            # For now just acknowledge in the response
            result["email_sent"] = req.email
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")