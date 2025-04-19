"""
Alerter Module for LumenTrialGuide.AI

This module provides cross-channel alert distribution for system notifications
including Traefik health checks and certificate expiration warnings.
"""
import os
import json
import datetime
import requests
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("alerter")

def publish(alert_data):
    """Publish an alert to configured channels"""
    # Ensure alert has required fields
    if isinstance(alert_data, str):
        alert_data = {"message": alert_data, "status": "info"}
    
    if "message" not in alert_data:
        alert_data["message"] = "Unspecified alert"
    
    if "status" not in alert_data:
        alert_data["status"] = "info"
    
    if "timestamp" not in alert_data:
        alert_data["timestamp"] = datetime.datetime.now().isoformat()
    
    logger.info(f"Publishing alert: {alert_data}")
    
    # Teams webhook integration
    teams_webhook = os.getenv('TEAMS_WEBHOOK_URL')
    if teams_webhook:
        try:
            teams_payload = {
                "@type": "MessageCard",
                "@context": "http://schema.org/extensions",
                "themeColor": "0076D7",
                "summary": alert_data.get("message", "System Alert"),
                "sections": [{
                    "activityTitle": "Traefik System Alert",
                    "activitySubtitle": alert_data.get("timestamp", datetime.datetime.now().isoformat()),
                    "facts": [
                        { "name": "Status", "value": alert_data.get("status", "info") },
                        { "name": "Message", "value": alert_data.get("message", "") },
                        { "name": "Type", "value": alert_data.get("type", "system") }
                    ],
                    "markdown": True
                }]
            }
            requests.post(teams_webhook, json=teams_payload)
            logger.info(f"Sent Teams alert: {alert_data['message']}")
        except Exception as e:
            logger.error(f"Failed to send Teams alert: {str(e)}")
    
    # Email alerts
    smtp_host = os.getenv('SMTP_HOST')
    smtp_user = os.getenv('SMTP_USER')
    alert_email = os.getenv('ALERT_EMAIL')
    
    if smtp_host and smtp_user and alert_email:
        try:
            import smtplib
            from email.mime.text import MIMEText
            
            msg = MIMEText(f"Status: {alert_data.get('status', 'info')}\nMessage: {alert_data.get('message', '')}")
            msg['Subject'] = f"Traefik Alert: {alert_data.get('status', 'INFO').upper()}"
            msg['From'] = smtp_user
            msg['To'] = alert_email
            
            s = smtplib.SMTP(smtp_host)
            s.send_message(msg)
            s.quit()
            logger.info(f"Sent email alert to {alert_email}")
        except Exception as e:
            logger.error(f"Failed to send email alert: {str(e)}")
            
    return {"status": "published", "alert": alert_data}