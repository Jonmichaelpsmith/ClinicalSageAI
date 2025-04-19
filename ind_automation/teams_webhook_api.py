"""
Microsoft Teams Webhook API for IND Automation

This module provides API endpoints for customers to manage their 
Microsoft Teams webhook URLs for receiving alerts and notifications.
"""

import os
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, validator
import requests

from ind_automation import rbac, db

router = APIRouter()

# Models
class TeamsWebhook(BaseModel):
    webhook_url: str
    
    @validator('webhook_url')
    def validate_url(cls, v):
        if not v.startswith('https://'):
            raise ValueError('Webhook URL must use HTTPS')
        if not ('webhook.office.com' in v or 'office365.com' in v):
            raise ValueError('URL must be a valid Microsoft Teams webhook URL')
        return v

# Constants
WEBHOOKS_DIR = Path('data/teams_webhooks')

# Make sure the directory exists
WEBHOOKS_DIR.mkdir(parents=True, exist_ok=True)

# Helper functions
def _get_webhook_path(org_id: str) -> Path:
    """Get the path to the webhook file for an organization"""
    return WEBHOOKS_DIR / f"{org_id}.json"

def _load_webhook(org_id: str) -> dict:
    """Load webhook configuration for an organization"""
    path = _get_webhook_path(org_id)
    if not path.exists():
        return {}
    
    try:
        with open(path, 'r') as f:
            return json.load(f)
    except Exception:
        return {}

def _save_webhook(org_id: str, webhook_url: str) -> None:
    """Save webhook configuration for an organization"""
    path = _get_webhook_path(org_id)
    
    with open(path, 'w') as f:
        json.dump({"webhook_url": webhook_url}, f)

def _delete_webhook(org_id: str) -> bool:
    """Delete webhook configuration for an organization"""
    path = _get_webhook_path(org_id)
    if path.exists():
        path.unlink()
        return True
    return False

def send_teams_message(org_id: str, title: str, message: str) -> bool:
    """
    Send a message to Microsoft Teams via webhook
    
    Args:
        org_id: Organization ID
        title: Message title
        message: Message content
        
    Returns:
        bool: True if successful, False otherwise
    """
    webhook_config = _load_webhook(org_id)
    webhook_url = webhook_config.get('webhook_url')
    
    if not webhook_url:
        return False
        
    try:
        payload = {
            "@type": "MessageCard",
            "@context": "https://schema.org/extensions",
            "summary": title,
            "themeColor": "0076D7",
            "title": title,
            "text": message.replace('\n', '<br>')
        }
        
        response = requests.post(webhook_url, json=payload, timeout=5)
        return response.status_code == 200
    except Exception:
        return False

# API Routes
@router.get("/api/ind/{org_id}/teams-webhook")
async def get_webhook(org_id: str, _=Depends(rbac.requires("ind.read"))):
    """Get Teams webhook configuration for an organization"""
    return _load_webhook(org_id)

@router.post("/api/ind/{org_id}/teams-webhook")
async def save_webhook(org_id: str, webhook: TeamsWebhook, _=Depends(rbac.requires("ind.write"))):
    """Save Teams webhook configuration for an organization"""
    _save_webhook(org_id, webhook.webhook_url)
    return {"status": "success"}

@router.delete("/api/ind/{org_id}/teams-webhook")
async def delete_webhook(org_id: str, _=Depends(rbac.requires("ind.write"))):
    """Delete Teams webhook configuration for an organization"""
    if _delete_webhook(org_id):
        return {"status": "success", "message": "Webhook configuration deleted"}
    else:
        return {"status": "success", "message": "No webhook configuration found"}

@router.post("/api/ind/{org_id}/teams-webhook/test")
async def test_webhook(org_id: str, _=Depends(rbac.requires("ind.write"))):
    """Send a test message to Teams to verify webhook configuration"""
    result = send_teams_message(
        org_id,
        "TrialSage Test Notification",
        f"This is a test notification from TrialSage for organization {org_id}. "
        f"If you can see this message, Teams alerts are correctly configured."
    )
    
    if result:
        # Record in history for audit
        db.append_history(org_id, {
            "type": "teams_webhook",
            "msg": "Teams webhook test was successful",
            "timestamp": db.now()
        })
        return {"status": "success", "message": "Test message sent successfully"}
    else:
        return {"status": "error", "message": "Failed to send test message"}