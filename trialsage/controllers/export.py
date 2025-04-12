# /controllers/export.py
import os
import uuid
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from typing import Dict, List, Any, Optional
from fastapi import HTTPException
from datetime import datetime

from trialsage.models.schemas import ReportExportRequest, EmailReportRequest


def export_pdf_on_demand(req: ReportExportRequest) -> Dict[str, str]:
    """
    Generate and export a PDF report for a specific indication
    
    Args:
        req: A ReportExportRequest containing indication and output preferences
        
    Returns:
        dict: Contains download URL and thread_id for reference
    """
    try:
        # Generate a thread ID if one wasn't provided
        thread_id = req.thread_id or f"thread_{uuid.uuid4().hex[:8]}"
        
        # Create timestamp for filename
        timestamp = int(time.time())
        
        # Create title if not provided
        title = req.title or f"{req.indication} Study Protocol"
        
        # Set export format
        export_format = req.format.lower() if req.format else "pdf"
        if export_format not in ["pdf", "docx", "md"]:
            export_format = "pdf"  # Default to PDF
            
        # In production would generate real content, pass to PDF generator
        # For now, create mock file paths
        
        # Ensure static directory exists
        os.makedirs("static", exist_ok=True)
        
        # Create filenames
        timestamp_filename = f"trialsage_report_{timestamp}.{export_format}"
        filename = f"latest_report.{export_format}"
        filepath = os.path.join("static", timestamp_filename)
        latest_filepath = os.path.join("static", filename)
        
        # Generate PDF content (mock implementation)
        # In production, would call PDF generator service with req data
        if export_format == "pdf":
            _generate_mock_pdf(filepath, title, req.indication)
            # Also save a copy as latest_report.pdf for easy access
            _generate_mock_pdf(latest_filepath, title, req.indication)
        else:
            # Mock text generation for other formats
            with open(filepath, 'w') as f:
                f.write(f"# {title}\n\nProtocol for {req.indication} studies\n\nGenerated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            # Save a copy as latest report
            with open(latest_filepath, 'w') as f:
                f.write(f"# {title}\n\nProtocol for {req.indication} studies\n\nGenerated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Create download URLs (in production would be full URLs)
        download_url = f"/static/{timestamp_filename}"
        latest_url = f"/static/{filename}"
        
        # Store report metadata in database (mock)
        # Would actually insert into database in production
        
        return {
            "success": True,
            "message": f"Report for {req.indication} has been generated successfully.",
            "download_url": download_url,
            "latest_url": latest_url,
            "filename": timestamp_filename,
            "indication": req.indication,
            "thread_id": thread_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")


def email_report(req: EmailReportRequest) -> Dict[str, str]:
    """
    Send a report via email
    
    Args:
        req: EmailReportRequest containing email address and report URL
        
    Returns:
        dict: Contains status and message
    """
    try:
        # Check environment variables
        smtp_server = os.environ.get("MAILGUN_SMTP_SERVER")
        smtp_port = os.environ.get("MAILGUN_SMTP_PORT")
        smtp_user = os.environ.get("MAILGUN_USER")
        smtp_password = os.environ.get("MAILGUN_PASSWORD")
        sender_email = os.environ.get("TRIALSAGE_SENDER_EMAIL")
        
        if not all([smtp_server, smtp_port, smtp_user, smtp_password, sender_email]):
            return {
                "success": False,
                "message": "Email configuration is incomplete. Please check environment variables.",
                "sent_to": req.email
            }
            
        # Create email
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = req.email
        msg['Subject'] = req.subject or "Your TrialSage Report"
        
        # Email body
        body = req.body or "Please find your requested TrialSage report attached.\n\nThank you for using TrialSage."
        msg.attach(MIMEText(body, 'plain'))
        
        # In production, would attach the actual file
        # For now, this is a mock implementation
        # Path would be constructed from the URL in req.report_url
        report_path = req.report_url.replace("/static/", "static/")
        
        if os.path.exists(report_path):
            with open(report_path, "rb") as attachment:
                part = MIMEApplication(attachment.read(), Name=os.path.basename(report_path))
                part['Content-Disposition'] = f'attachment; filename="{os.path.basename(report_path)}"'
                msg.attach(part)
                
            # Send email
            try:
                server = smtplib.SMTP(smtp_server, int(smtp_port))
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
                server.quit()
                
                return {
                    "success": True,
                    "message": f"Report has been sent to {req.email}",
                    "sent_to": req.email,
                    "report_url": req.report_url
                }
            except Exception as email_error:
                return {
                    "success": False,
                    "message": f"Failed to send email: {str(email_error)}",
                    "sent_to": req.email
                }
        else:
            return {
                "success": False,
                "message": f"Report file not found at {report_path}",
                "sent_to": req.email
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending email: {str(e)}")


def get_report_list(indication: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get a list of previously generated reports
    
    Args:
        indication: Optional filter by indication
        limit: Maximum number of reports to return
        
    Returns:
        List[Dict]: List of report metadata
    """
    try:
        # In production, would query database for reports
        # For now, implement a mock that returns synthetic data
        
        # Mock report data
        reports = [
            {
                "id": "rep_" + uuid.uuid4().hex[:8],
                "title": "NASH Phase II Protocol",
                "indication": "NASH",
                "created_at": "2024-04-10T14:35:22Z",
                "format": "pdf",
                "download_url": "/static/trialsage_report_1649597722.pdf",
                "thread_id": "thread_a1b2c3d4"
            },
            {
                "id": "rep_" + uuid.uuid4().hex[:8],
                "title": "Alzheimer's Disease Study Protocol",
                "indication": "Alzheimer's Disease",
                "created_at": "2024-04-09T09:12:45Z",
                "format": "pdf",
                "download_url": "/static/trialsage_report_1649507565.pdf",
                "thread_id": "thread_e5f6g7h8"
            },
            {
                "id": "rep_" + uuid.uuid4().hex[:8],
                "title": "Parkinson's Disease Protocol",
                "indication": "Parkinson's Disease",
                "created_at": "2024-04-08T16:23:10Z",
                "format": "pdf",
                "download_url": "/static/trialsage_report_1649434990.pdf",
                "thread_id": "thread_i9j0k1l2"
            },
            {
                "id": "rep_" + uuid.uuid4().hex[:8],
                "title": "Multiple Sclerosis Protocol",
                "indication": "Multiple Sclerosis",
                "created_at": "2024-04-07T11:05:33Z",
                "format": "pdf",
                "download_url": "/static/trialsage_report_1649330733.pdf",
                "thread_id": "thread_m3n4o5p6"
            },
            {
                "id": "rep_" + uuid.uuid4().hex[:8],
                "title": "Obesity Treatment Protocol",
                "indication": "Obesity",
                "created_at": "2024-04-06T14:45:21Z",
                "format": "docx",
                "download_url": "/static/trialsage_report_1649257521.docx",
                "thread_id": "thread_q7r8s9t0"
            }
        ]
        
        # Filter by indication if provided
        if indication:
            reports = [r for r in reports if indication.lower() in r["indication"].lower()]
            
        # Apply limit
        reports = reports[:limit]
        
        return {
            "success": True,
            "message": f"Retrieved {len(reports)} reports",
            "reports": reports,
            "total": len(reports)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving reports: {str(e)}")


def _generate_mock_pdf(filepath: str, title: str, indication: str) -> None:
    """
    Generate a mock PDF file (placeholder for actual PDF generation)
    
    In production, this would be replaced with a proper PDF generation library
    
    Args:
        filepath: Path to save the PDF
        title: Report title
        indication: Medical indication
    """
    # This is a mock implementation
    # In production, would use a PDF library like ReportLab, FPDF, or similar
    
    with open(filepath, 'w') as f:
        f.write(f"PDF CONTENT\n\n")
        f.write(f"Title: {title}\n")
        f.write(f"Indication: {indication}\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("This is a placeholder for a real PDF document.\n")
        f.write("In production, this would be generated using a PDF library.\n")