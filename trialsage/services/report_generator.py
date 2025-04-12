# /services/report_generator.py
import os
import time
import smtplib
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from fpdf import FPDF
from typing import Dict, Any, Optional, List

# Mock AI service for now
def generate_protocol_content(indication: str) -> Dict[str, Any]:
    """
    Generate protocol content using OpenAI GPT
    
    In production, this would call the OpenAI service
    """
    return {
        "title": f"Protocol Recommendations for {indication}",
        "thread_id": f"thread_{int(time.time())}",
        "indication": indication,
        "phases": ["Phase I", "Phase II", "Phase III"],
        "primary_endpoint": "Change in disease activity score",
        "secondary_endpoints": [
            "Treatment response rate",
            "Change in biomarker levels",
            "Safety and tolerability"
        ],
        "inclusion_criteria": [
            "Adults 18-75 years of age",
            f"Confirmed diagnosis of {indication}",
            "Disease activity score >= 6"
        ],
        "exclusion_criteria": [
            "Previous biologic therapy",
            "Significant comorbidities",
            "Pregnancy or breastfeeding"
        ],
        "evidence": [
            {
                "source": "Clinical Trial NCT12345678",
                "quote": f"The primary endpoint for this {indication} study was change in disease activity score from baseline."
            },
            {
                "source": "FDA Guidance Document",
                "quote": f"For {indication} trials, inclusion of biomarker endpoints is strongly recommended."
            }
        ],
        "ind_recommendations": {
            "module_2_5": "This section would include a clinical overview with literature and CSR evidence.",
            "module_2_7": "This section would include clinical summaries with evidence tables."
        },
        "statistical_analysis_plan": {
            "primary_analysis": "ANCOVA with baseline as covariate",
            "sample_size_justification": "Based on anticipated effect size of 0.4, power 90%",
            "interim_analyses": "One planned interim analysis at 50% enrollment"
        },
        "regulatory_risk_assessment": {
            "overall_risk": "Moderate",
            "key_concerns": [
                "Endpoint selection may require FDA alignment",
                "Historical control selection will need justification"
            ],
            "recommended_actions": [
                "Request Type C meeting with FDA",
                "Prepare robust statistical analysis plan"
            ]
        }
    }

def generate_weekly_report(indication: str = "NASH") -> Dict[str, str]:
    """
    Generate a weekly report for a specific indication
    
    Args:
        indication: The medical indication to generate a report for
        
    Returns:
        dict: Contains report paths and metadata
    """
    # Generate protocol content
    content = generate_protocol_content(indication)
    
    # Create PDF report
    pdf_path = export_pdf(content)
    
    # Send email with the report
    if os.getenv("MAILGUN_SMTP_SERVER") and os.getenv("TRIALSAGE_SENDER_EMAIL"):
        send_email_report(
            recipients=["team@example.com"],
            subject=f"Weekly {indication} Intelligence Report",
            body=f"Attached is your weekly intelligence report for {indication}.",
            attachment_path=pdf_path
        )
    
    return {
        "pdf": pdf_path,
        "thread_id": content["thread_id"],
        "indication": indication
    }

def export_report_to_pdf(indication: str, title: Optional[str] = None) -> Dict[str, str]:
    """
    Generate and export a PDF report for a specific indication
    
    Args:
        indication: The medical indication to generate a report for
        title: Optional custom title for the report
        
    Returns:
        dict: Contains report paths and metadata
    """
    # Generate protocol content
    content = generate_protocol_content(indication)
    
    # Override title if provided
    if title:
        content["title"] = title
    
    # Create PDF report
    pdf_path = export_pdf(content)
    
    return {
        "pdf": pdf_path,
        "thread_id": content["thread_id"],
        "indication": indication
    }

def export_pdf(content: Dict[str, Any]) -> str:
    """
    Export report content to PDF
    
    Args:
        content: The report content to export
        
    Returns:
        str: Path to the generated PDF file
    """
    # Ensure static directory exists
    os.makedirs("trialsage/static", exist_ok=True)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    pdf_filename = f"trialsage_report_{timestamp}.pdf"
    pdf_path = f"/static/{pdf_filename}"
    full_path = f"trialsage/static/{pdf_filename}"
    
    # Create PDF document
    pdf = FPDF()
    pdf.add_page()
    
    # Title
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, content["title"], ln=True, align="C")
    pdf.ln(5)
    
    # Subtitle
    pdf.set_font("Arial", "I", 12)
    pdf.cell(0, 10, f"Generated for {content['indication']} on {datetime.datetime.now().strftime('%B %d, %Y')}", ln=True, align="C")
    pdf.ln(10)
    
    # Protocol Recommendations Section
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Protocol Recommendations", ln=True)
    pdf.ln(5)
    
    # Protocol Content
    pdf.set_font("Arial", "", 12)
    pdf.multi_cell(0, 10, f"Primary Endpoint: {content['primary_endpoint']}")
    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Secondary Endpoints:", ln=True)
    pdf.set_font("Arial", "", 12)
    for endpoint in content['secondary_endpoints']:
        pdf.cell(0, 10, f"• {endpoint}", ln=True)
    pdf.ln(5)
    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Inclusion Criteria:", ln=True)
    pdf.set_font("Arial", "", 12)
    for criteria in content['inclusion_criteria']:
        pdf.cell(0, 10, f"• {criteria}", ln=True)
    pdf.ln(5)
    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Exclusion Criteria:", ln=True)
    pdf.set_font("Arial", "", 12)
    for criteria in content['exclusion_criteria']:
        pdf.cell(0, 10, f"• {criteria}", ln=True)
    pdf.ln(10)
    
    # Evidence Section
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Supporting Evidence", ln=True)
    pdf.ln(5)
    
    pdf.set_font("Arial", "", 12)
    for evidence in content['evidence']:
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, f"Source: {evidence['source']}", ln=True)
        pdf.set_font("Arial", "I", 12)
        pdf.multi_cell(0, 10, f'"{evidence["quote"]}"')
        pdf.ln(5)
    pdf.ln(5)
    
    # IND Recommendations Section
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "IND Strategy", ln=True)
    pdf.ln(5)
    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Module 2.5 (Clinical Overview):", ln=True)
    pdf.set_font("Arial", "", 12)
    pdf.multi_cell(0, 10, content['ind_recommendations']['module_2_5'])
    pdf.ln(5)
    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Module 2.7 (Clinical Summary):", ln=True)
    pdf.set_font("Arial", "", 12)
    pdf.multi_cell(0, 10, content['ind_recommendations']['module_2_7'])
    pdf.ln(10)
    
    # Statistical Analysis Plan
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Statistical Analysis Plan", ln=True)
    pdf.ln(5)
    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Primary Analysis:", ln=True)
    pdf.set_font("Arial", "", 12)
    pdf.multi_cell(0, 10, content['statistical_analysis_plan']['primary_analysis'])
    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Sample Size Justification:", ln=True)
    pdf.set_font("Arial", "", 12)
    pdf.multi_cell(0, 10, content['statistical_analysis_plan']['sample_size_justification'])
    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Interim Analyses:", ln=True)
    pdf.set_font("Arial", "", 12)
    pdf.multi_cell(0, 10, content['statistical_analysis_plan']['interim_analyses'])
    pdf.ln(10)
    
    # Regulatory Risk Assessment
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Regulatory Risk Assessment", ln=True)
    pdf.ln(5)
    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, f"Overall Risk: {content['regulatory_risk_assessment']['overall_risk']}", ln=True)
    pdf.ln(5)
    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Key Concerns:", ln=True)
    pdf.set_font("Arial", "", 12)
    for concern in content['regulatory_risk_assessment']['key_concerns']:
        pdf.cell(0, 10, f"• {concern}", ln=True)
    pdf.ln(5)
    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Recommended Actions:", ln=True)
    pdf.set_font("Arial", "", 12)
    for action in content['regulatory_risk_assessment']['recommended_actions']:
        pdf.cell(0, 10, f"• {action}", ln=True)
    pdf.ln(5)
    
    # Footer
    pdf.set_y(-30)
    pdf.set_font("Arial", "I", 10)
    pdf.cell(0, 10, "TrialSage Intelligence Platform - Confidential", ln=True, align="C")
    pdf.cell(0, 10, f"Thread ID: {content['thread_id']}", ln=True, align="C")
    
    # Save PDF
    pdf.output(full_path)
    
    # Also save as latest_report.pdf for easy access
    latest_path = "trialsage/static/latest_report.pdf"
    pdf.output(latest_path)
    
    return pdf_path

def send_email_report(recipients: List[str], subject: str, body: str, attachment_path: str) -> bool:
    """
    Send an email with the report attached
    
    Args:
        recipients: List of email addresses to send to
        subject: Email subject
        body: Email body text
        attachment_path: Path to the attachment
        
    Returns:
        bool: Whether the email was sent successfully
    """
    try:
        # Create email
        msg = MIMEMultipart()
        msg['From'] = os.getenv("TRIALSAGE_SENDER_EMAIL", "reports@trialsage.com")
        msg['To'] = ", ".join(recipients)
        msg['Subject'] = subject
        
        # Attach body
        msg.attach(MIMEText(body, 'plain'))
        
        # Attach PDF
        full_path = f"trialsage{attachment_path}"
        with open(full_path, "rb") as f:
            attach = MIMEApplication(f.read(), _subtype="pdf")
            attach.add_header('Content-Disposition', 'attachment', filename=os.path.basename(attachment_path))
            msg.attach(attach)
        
        # Send email
        with smtplib.SMTP(
            os.getenv("MAILGUN_SMTP_SERVER", "smtp.mailgun.org"),
            int(os.getenv("MAILGUN_SMTP_PORT", "587"))
        ) as server:
            server.starttls()
            server.login(
                os.getenv("MAILGUN_USER", ""),
                os.getenv("MAILGUN_PASSWORD", "")
            )
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False