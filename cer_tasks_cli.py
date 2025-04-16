#!/usr/bin/env python
"""
Command-line interface for CER tasks.
This script is called by the Node.js backend to trigger PDF generation tasks.
"""
import sys
import json
import os
import time
import argparse
from typing import Dict, Any
import threading
from datetime import datetime

# Import local modules - adjust paths as needed
try:
    from cer_narrative import generate_cer_narrative
    from server.faers_client import get_faers_data
except ImportError:
    # Adjust for different directory structure if needed
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from cer_narrative import generate_cer_narrative
    from server.faers_client import get_faers_data

def get_user_email(user_id):
    """Get user email from user ID"""
    # This is a placeholder - in a real application, you would
    # query your database for this information
    return f"{user_id}@example.com"

def process_task(ndc_code, user_id, task_id):
    """Process the PDF generation task in a background thread"""
    try:
        # Create log directory if it doesn't exist
        os.makedirs("data/logs", exist_ok=True)
        
        # Log start of processing
        log_file = os.path.join("data/logs", f"cer_task_{task_id}.log")
        with open(log_file, "a") as f:
            f.write(f"{datetime.now().isoformat()}: Starting PDF generation for NDC {ndc_code}\n")
        
        # Fetch FAERS data
        faers_data = get_faers_data(ndc_code)
        
        # Generate CER narrative
        cer_text = generate_cer_narrative(faers_data)
        
        # Create a PDF using ReportLab
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        
        # Ensure the exports directory exists
        os.makedirs("data/exports", exist_ok=True)
        
        # Create filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"CER_{ndc_code}_{timestamp}.pdf"
        filepath = os.path.join("data/exports", filename)
        
        # Generate PDF
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []
        
        # Add title
        elements.append(Paragraph(f"Clinical Evaluation Report (CER)", styles['Title']))
        elements.append(Spacer(1, 0.25*inch))
        elements.append(Paragraph(f"NDC Code: {ndc_code}", styles['Heading1']))
        elements.append(Spacer(1, 0.25*inch))
        
        # Add generation timestamp
        elements.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        elements.append(Spacer(1, 0.25*inch))
        
        # Add CER narrative
        elements.append(Paragraph("Clinical Evaluation Report:", styles['Heading2']))
        
        # Split the narrative into paragraphs and add them to the document
        paragraphs = cer_text.split('\n\n')
        for para in paragraphs:
            if para.strip():
                elements.append(Paragraph(para, styles['Normal']))
                elements.append(Spacer(1, 0.1*inch))
        
        # Build the PDF
        doc.build(elements)
        
        # Log successful completion
        with open(log_file, "a") as f:
            f.write(f"{datetime.now().isoformat()}: PDF generated successfully as {filename}\n")
        
        # Write status to a status file that can be checked by the Node.js backend
        status_file = os.path.join("data/logs", f"cer_task_{task_id}_status.json")
        with open(status_file, "w") as f:
            json.dump({
                "status": "completed",
                "task_id": task_id,
                "ndc_code": ndc_code,
                "filename": filename,
                "filepath": filepath,
                "completed_at": datetime.now().isoformat()
            }, f)
        
        # In a production environment, you might also send an email notification here
        user_email = get_user_email(user_id)
        print(f"[INFO] PDF generated successfully. Would notify {user_email} about {filename}")
        
    except Exception as e:
        # Log error
        with open(log_file, "a") as f:
            f.write(f"{datetime.now().isoformat()}: Error generating PDF: {str(e)}\n")
        
        # Update status file with error
        status_file = os.path.join("data/logs", f"cer_task_{task_id}_status.json")
        with open(status_file, "w") as f:
            json.dump({
                "status": "error",
                "task_id": task_id,
                "ndc_code": ndc_code,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }, f)
        
        print(f"[ERROR] Failed to generate PDF: {str(e)}")

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Generate CER PDF as a background task")
    parser.add_argument("--ndc-code", required=True, help="NDC code for the product")
    parser.add_argument("--user-id", required=True, help="User ID requesting the PDF")
    parser.add_argument("--task-id", required=True, help="Unique task identifier")
    
    args = parser.parse_args()
    
    # Create and start the background thread
    thread = threading.Thread(
        target=process_task, 
        args=(args.ndc_code, args.user_id, args.task_id)
    )
    thread.daemon = True
    thread.start()
    
    # Return immediately with task ID
    print(json.dumps({
        "status": "scheduled",
        "task_id": args.task_id,
        "ndc_code": args.ndc_code,
        "user_id": args.user_id,
        "scheduled_at": datetime.now().isoformat()
    }))
    
    # Keep the main process running for a moment to ensure the thread starts
    time.sleep(1)

if __name__ == "__main__":
    main()