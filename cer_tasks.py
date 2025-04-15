"""
CER Tasks Module

This module handles background tasks for Clinical Evaluation Reports,
including enhanced PDF generation and email notifications.
"""

import os
import json
import logging
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from typing import Dict, Any, Optional
import requests

from notification import send_email_notification
from cer_pdf_generator import generate_enhanced_pdf, save_pdf_to_file

# Set up logging
logger = logging.getLogger("cer_tasks")
router = APIRouter()

# Simple function to retrieve user information
# In a real application, this would query a database
def get_current_user(user_id: str) -> Dict[str, Any]:
    """
    Retrieve user information.
    This is a simplified example - in a real application,
    you would query your database for user information.
    """
    # For simplicity, we'll use an environment variable for testing
    test_email = os.getenv("USER_EMAIL")
    
    # In a real application, you would query your database
    # return db.query(User).filter(User.id == user_id).first()
    
    # For demonstration, we'll return a simple dict
    return {
        "id": user_id,
        "email": test_email or f"{user_id}@example.com",
        "name": "Test User"
    }

@router.post("/api/cer/{ndc_code}/enhanced-pdf-task")
async def schedule_pdf_generation(
    ndc_code: str, 
    background_tasks: BackgroundTasks,
    user_id: str
):
    """
    Schedules the enhanced PDF generation as a background task.
    Immediately returns a message that the PDF is being generated.
    Once complete, an email notification is sent to the user.
    
    Args:
        ndc_code: The NDC code for the product
        background_tasks: FastAPI background tasks
        user_id: ID of the current user (for notification)
        
    Returns:
        Message indicating the task has been scheduled
    """
    # Retrieve user information
    user = get_current_user(user_id)
    user_email = user.get("email")
    
    if not user_email:
        raise HTTPException(
            status_code=400,
            detail="User email not available. Cannot send notification."
        )
    
    def task():
        try:
            logger.info(f"Starting background PDF generation for NDC: {ndc_code}")
            
            # Fetch FAERS data from our API
            faers_data = None
            try:
                # Attempt to get FAERS data from our API
                response = requests.post(
                    f"http://localhost:5000/api/cer/faers/data",
                    json={"ndcCode": ndc_code}
                )
                if response.status_code == 200:
                    faers_data = response.json()
            except Exception as e:
                logger.error(f"Error fetching FAERS data: {e}")
            
            # Fetch CER data from database if available
            cer_data = None
            try:
                # Attempt to get CER data from our API
                response = requests.get(
                    f"http://localhost:5000/api/cers/{ndc_code}"
                )
                if response.status_code == 200:
                    cer_data = response.json()
            except Exception as e:
                logger.error(f"Error fetching CER data: {e}")
            
            # Generate the enhanced PDF
            pdf_bytes = generate_enhanced_pdf(ndc_code, faers_data, cer_data)
            
            # Save the PDF to a file
            filepath = save_pdf_to_file(pdf_bytes, ndc_code)
            
            # Construct a simple notification message
            subject = f"CER Report Ready for NDC {ndc_code}"
            message = f"""
Hello {user.get('name', 'User')},

Your enhanced Clinical Evaluation Report for NDC {ndc_code} has been generated and is now ready.

Please log in to your LumenTrialGuide.AI account to view and download the report.

Report details:
- NDC Code: {ndc_code}
- Generated: {os.path.basename(filepath).split('_')[-2]}_
- File size: {len(pdf_bytes) / 1024:.1f} KB

Thank you for using LumenTrialGuide.AI!
            """
            
            # Send email notification
            try:
                email_sent = send_email_notification(user_email, subject, message)
                if email_sent:
                    logger.info(f"Notification email successfully sent to {user_email}")
                else:
                    logger.error(f"Failed to send notification email to {user_email}")
            except Exception as e:
                logger.error(f"Error sending notification email: {e}")
        
        except Exception as e:
            logger.error(f"Error in background PDF generation task: {e}")
    
    # Add the task to background tasks
    background_tasks.add_task(task)
    
    return {
        "message": "PDF generation started in background. You will receive an email when it's ready.",
        "status": "scheduled",
        "ndc_code": ndc_code,
        "notification_email": user_email
    }