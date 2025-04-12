# /trialsage/services/report_generator.py
# Weekly report generation and email delivery

import os
import smtplib
import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from pathlib import Path
from typing import Dict, Any, List, Optional

from .openai_engine import (
    generate_protocol_from_evidence,
    generate_ind_section
)

# Email configuration
SMTP_SERVER = os.environ.get("MAILGUN_SMTP_SERVER", "smtp.mailgun.org")
SMTP_PORT = int(os.environ.get("MAILGUN_SMTP_PORT", "587"))
SMTP_USERNAME = os.environ.get("MAILGUN_USER", "")
SMTP_PASSWORD = os.environ.get("MAILGUN_PASSWORD", "")
SENDER_EMAIL = os.environ.get("TRIALSAGE_SENDER_EMAIL", "no-reply@trialsage.ai")

# Report storage
REPORTS_DIR = Path(__file__).parent.parent / "data" / "reports"
REPORTS_DIR.mkdir(exist_ok=True, parents=True)

def generate_weekly_brief(indication: str) -> Dict[str, Any]:
    """Generate a comprehensive weekly intelligence brief for the specified indication"""
    try:
        # Create a new thread for this report
        protocol_result = generate_protocol_from_evidence(indication)
        thread_id = protocol_result.get("thread_id")
        
        # Generate additional sections
        result = {}
        result["protocol"] = protocol_result.get("recommendation", "")
        result["citations"] = protocol_result.get("citations", [])
        result["ind_module_2_5"] = protocol_result.get("ind_module_2_5", {}).get("content", "")
        result["risk_summary"] = protocol_result.get("risk_summary", "")
        
        # Generate SAP section using the same thread
        sap_data = generate_ind_section(
            study_id=f"{indication}-WEEKLY",
            section="SAP",
            context=f"Based on the protocol for {indication}, generate a comprehensive Statistical Analysis Plan.",
            thread_id=thread_id
        )
        result["sap"] = sap_data.get("content", "")
        
        # Generate IND 2.7 section
        ind27_data = generate_ind_section(
            study_id=f"{indication}-WEEKLY",
            section="2.7",
            context=f"Based on the protocol for {indication}, generate the IND Module 2.7 (Summary of Clinical Efficacy).",
            thread_id=thread_id
        )
        result["ind_module_2_7"] = ind27_data.get("content", "")
        
        # Generate trial intelligence summary
        intel_data = generate_ind_section(
            study_id=f"{indication}-WEEKLY",
            section="intelligence",
            context=f"Summarize the latest trends, breakthroughs, and regulatory developments for clinical trials in {indication}.",
            thread_id=thread_id
        )
        result["intelligence_summary"] = intel_data.get("content", "")
        
        result["thread_id"] = thread_id
        result["generated_at"] = datetime.datetime.now().isoformat()
        
        return result
    except Exception as e:
        return {
            "error": str(e),
            "generated_at": datetime.datetime.now().isoformat()
        }

def format_html_report(brief: Dict[str, Any]) -> str:
    """Format the intelligence brief as an HTML email"""
    if "error" in brief:
        return f"""
        <html>
        <body>
            <h1>TrialSage Weekly Intelligence Brief - Error</h1>
            <p>An error occurred while generating the weekly report:</p>
            <pre>{brief['error']}</pre>
            <p>Generated at: {brief['generated_at']}</p>
        </body>
        </html>
        """
    
    # Format citations as HTML list
    citations_html = ""
    if brief.get("citations"):
        citations_html = "<ul>"
        for citation in brief.get("citations", []):
            citations_html += f"<li>{citation}</li>"
        citations_html += "</ul>"
    
    return f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }}
            h1 {{ color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }}
            h2 {{ color: #3498db; margin-top: 30px; }}
            h3 {{ color: #2980b9; }}
            .summary {{ background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; }}
            .section {{ margin-bottom: 30px; }}
        </style>
    </head>
    <body>
        <h1>TrialSage Weekly Intelligence Brief</h1>
        <p>Generated at: {brief.get('generated_at')}</p>
        
        <div class="section">
            <h2>Intelligence Summary</h2>
            <div class="summary">{brief.get('intelligence_summary', '').replace('\\n', '<br>')}</div>
        </div>
        
        <div class="section">
            <h2>Protocol Recommendations</h2>
            {brief.get('protocol', '').replace('\\n', '<br>')}
        </div>
        
        <div class="section">
            <h2>Regulatory Risk Analysis</h2>
            {brief.get('risk_summary', '').replace('\\n', '<br>')}
        </div>
        
        <div class="section">
            <h2>Evidence Base</h2>
            {citations_html}
        </div>
        
        <div class="section">
            <h2>IND Module 2.5 (Clinical Overview)</h2>
            {brief.get('ind_module_2_5', '').replace('\\n', '<br>')}
        </div>
        
        <div class="section">
            <h2>IND Module 2.7 (Summary of Clinical Efficacy)</h2>
            {brief.get('ind_module_2_7', '').replace('\\n', '<br>')}
        </div>
        
        <div class="section">
            <h2>Statistical Analysis Plan</h2>
            {brief.get('sap', '').replace('\\n', '<br>')}
        </div>
        
        <p>Thread ID for Continued Analysis: {brief.get('thread_id')}</p>
    </body>
    </html>
    """

def format_markdown_report(brief: Dict[str, Any]) -> str:
    """Format the intelligence brief as Markdown text"""
    if "error" in brief:
        return f"""
        # TrialSage Weekly Intelligence Brief - Error
        
        An error occurred while generating the weekly report:
        
        ```
        {brief['error']}
        ```
        
        Generated at: {brief['generated_at']}
        """
    
    # Format citations as Markdown list
    citations_md = ""
    if brief.get("citations"):
        citations_md = "\n"
        for citation in brief.get("citations", []):
            citations_md += f"- {citation}\n"
    
    return f"""
    # TrialSage Weekly Intelligence Brief
    
    Generated at: {brief.get('generated_at')}
    
    ## Intelligence Summary
    
    {brief.get('intelligence_summary', '')}
    
    ## Protocol Recommendations
    
    {brief.get('protocol', '')}
    
    ## Regulatory Risk Analysis
    
    {brief.get('risk_summary', '')}
    
    ## Evidence Base
    {citations_md}
    
    ## IND Module 2.5 (Clinical Overview)
    
    {brief.get('ind_module_2_5', '')}
    
    ## IND Module 2.7 (Summary of Clinical Efficacy)
    
    {brief.get('ind_module_2_7', '')}
    
    ## Statistical Analysis Plan
    
    {brief.get('sap', '')}
    
    Thread ID for Continued Analysis: {brief.get('thread_id')}
    """

def save_report_file(brief: Dict[str, Any]) -> str:
    """Save report to file and return the file path"""
    date_str = datetime.datetime.now().strftime("%Y%m%d")
    indication = brief.get("indication", "Unknown")
    
    # Create filename
    filename = f"TrialSage_Weekly_Brief_{indication}_{date_str}.md"
    filepath = REPORTS_DIR / filename
    
    # Save as markdown
    with open(filepath, "w") as f:
        f.write(format_markdown_report(brief))
    
    return str(filepath)

def send_email_report(
    brief: Dict[str, Any], 
    to_emails: List[str]
) -> bool:
    """Send the report via email"""
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        return False
        
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"TrialSage Weekly Intelligence Brief"
        msg["From"] = SENDER_EMAIL
        msg["To"] = ", ".join(to_emails)
        
        # Attach HTML and plaintext versions
        html_part = MIMEText(format_html_report(brief), "html")
        text_part = MIMEText(format_markdown_report(brief), "plain")
        
        msg.attach(text_part)
        msg.attach(html_part)
        
        # Save report to file and attach it
        report_filepath = save_report_file(brief)
        with open(report_filepath, "rb") as f:
            attachment = MIMEApplication(f.read(), Name=Path(report_filepath).name)
            attachment["Content-Disposition"] = f'attachment; filename="{Path(report_filepath).name}"'
            msg.attach(attachment)
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
            
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_weekly_report(indication: str, recipients: Optional[List[str]] = None) -> Dict[str, Any]:
    """Generate and send the weekly report"""
    # Default recipients if none provided
    if not recipients:
        recipients = ["intel@trialsage.ai"]
    
    # Generate brief
    brief = generate_weekly_brief(indication)
    brief["indication"] = indication
    
    # Save report locally
    report_path = save_report_file(brief)
    
    # Try to send email if SMTP is configured
    email_sent = False
    if SMTP_USERNAME and SMTP_PASSWORD:
        email_sent = send_email_report(brief, recipients)
    
    return {
        "success": True,
        "message": "Weekly report generated successfully",
        "email_sent": email_sent,
        "report_path": report_path,
        "brief": brief.get("intelligence_summary", ""),
        "thread_id": brief.get("thread_id", "")
    }