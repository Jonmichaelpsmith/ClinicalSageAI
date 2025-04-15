# notification.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

# Set up logging
logger = logging.getLogger("notification")

def send_email_notification(to_email: str, subject: str, message: str):
    """
    Sends an email notification using SMTP.
    Expects the following environment variables to be set in your Replit Secrets:
       - SMTP_SERVER: e.g., "smtp.gmail.com"
       - SMTP_PORT: e.g., "587" (as string)
       - SMTP_USERNAME: your email address used for sending
       - SMTP_PASSWORD: the corresponding password or app password
    """
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not all([smtp_server, smtp_username, smtp_password]):
        logger.error("SMTP configuration is incomplete. Please set SMTP_SERVER, SMTP_USERNAME, and SMTP_PASSWORD.")
        raise Exception("SMTP configuration is incomplete. Please set SMTP_SERVER, SMTP_USERNAME, and SMTP_PASSWORD.")

    msg = MIMEMultipart()
    msg["From"] = smtp_username
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(message, "plain"))

    try:
        logger.info(f"Attempting to send email to {to_email} via {smtp_server}:{smtp_port}")
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
            logger.info(f"Email successfully sent to {to_email}")
            return True
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False