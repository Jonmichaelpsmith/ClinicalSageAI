#!/usr/bin/env python3
"""
Command-line interface for CER tasks.
This script is called by the Node.js backend to trigger PDF generation tasks.
"""

import argparse
import logging
import os
import sys
import threading
from cer_pdf_generator import generate_enhanced_pdf, save_pdf_to_file
from notification import send_email_notification

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("cer_tasks_cli")

def get_user_email(user_id):
    """Get user email from user ID"""
    # In a real application, you would query your user database
    # For simplicity, we'll use an environment variable or a simple mapping
    default_email = os.getenv("USER_EMAIL", f"{user_id}@example.com")
    
    # This would be a database lookup in a real application
    return default_email

def process_task(ndc_code, user_id, task_id):
    """Process the PDF generation task in a background thread"""
    try:
        logger.info(f"Starting background PDF generation for NDC: {ndc_code}, User: {user_id}, Task ID: {task_id}")
        
        # Get user email
        user_email = get_user_email(user_id)
        
        # Generate the PDF (in a real application, you would fetch data from APIs or database)
        pdf_bytes = generate_enhanced_pdf(ndc_code)
        
        # Save the PDF to a file
        filepath = save_pdf_to_file(pdf_bytes, ndc_code)
        
        # Send email notification
        subject = f"CER Report Ready for NDC {ndc_code}"
        message = f"""
Hello User,

Your enhanced Clinical Evaluation Report for NDC {ndc_code} has been generated and is now ready.

Please log in to your LumenTrialGuide.AI account to view and download the report.

Report details:
- NDC Code: {ndc_code}
- Task ID: {task_id}
- File: {os.path.basename(filepath)}
- File size: {len(pdf_bytes) / 1024:.1f} KB

Thank you for using LumenTrialGuide.AI!
        """
        
        email_sent = send_email_notification(user_email, subject, message)
        if email_sent:
            logger.info(f"Notification email successfully sent to {user_email}")
        else:
            logger.error(f"Failed to send notification email to {user_email}")
            
        # In a real application, you would update a task status in the database
        logger.info(f"Task {task_id} completed successfully")
        
    except Exception as e:
        logger.error(f"Error processing task {task_id}: {e}")

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Process CER PDF generation tasks')
    parser.add_argument('--ndc', required=True, help='NDC code for the product')
    parser.add_argument('--user', required=True, help='User ID for notification')
    parser.add_argument('--task', required=True, help='Task ID for tracking')
    
    args = parser.parse_args()
    
    logger.info(f"Received task request: NDC={args.ndc}, User={args.user}, Task={args.task}")
    
    # Start the task in a background thread and immediately return
    # This allows the Node.js process to continue without waiting
    thread = threading.Thread(
        target=process_task,
        args=(args.ndc, args.user, args.task)
    )
    thread.daemon = True
    thread.start()
    
    # Print a success message to stdout for the Node.js process
    print(f"Task {args.task} started successfully.")
    
    # Exit successfully - the thread will continue running
    sys.exit(0)

if __name__ == "__main__":
    main()