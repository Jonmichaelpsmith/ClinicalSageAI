from datetime import datetime, timedelta
import os, smtplib
from email.message import EmailMessage
import requests
from pathlib import Path
import json

from dateutil import parser
from ind_automation import db, saml_creds
from ind_automation.credentials import load as load_esg
from ind_automation.tasks import celery_app

# For fallback/system-wide notifications
TEAMS_WEBHOOK_URL=os.getenv("TEAMS_WEBHOOK_URL")
SMTP_HOST=os.getenv('SMTP_HOST'); SMTP_PORT=int(os.getenv('SMTP_PORT','0'))
SMTP_USER=os.getenv('SMTP_USER'); SMTP_PASS=os.getenv('SMTP_PASS'); ALERT_EMAIL=os.getenv('ALERT_EMAIL')

# For customer-specific Teams webhooks
WEBHOOKS_DIR = Path('data/teams_webhooks')
WEBHOOKS_DIR.mkdir(parents=True, exist_ok=True)

def _get_org_webhook(org_id: str) -> str:
    """Get the organization-specific Teams webhook URL if configured"""
    webhook_path = WEBHOOKS_DIR / f"{org_id}.json"
    if not webhook_path.exists():
        return None
        
    try:
        with open(webhook_path, 'r') as f:
            data = json.load(f)
            return data.get('webhook_url')
    except Exception:
        return None

def _send_teams(message, org_id=None):
    """
    Send Teams notification - either to org-specific webhook or system webhook
    
    Args:
        message: The message to send
        org_id: Optional organization ID to use their specific webhook
    """
    # First try organization-specific webhook if org_id is provided
    webhook_url = None
    if org_id:
        webhook_url = _get_org_webhook(org_id)
    
    # Fall back to system-wide webhook if no org webhook or if no org_id
    if not webhook_url:
        webhook_url = TEAMS_WEBHOOK_URL
        
    # If no webhook available, skip sending
    if not webhook_url:
        return
        
    payload = {
        "@type":"MessageCard","@context":"https://schema.org/extensions",
        "summary":"TrialSage Alert","themeColor":"0076D7",
        "title":"TrialSage Compliance Alert",
        "text": message.replace('\n','<br>')
    }
    try:
        requests.post(webhook_url, json=payload, timeout=5)
    except Exception as e:
        print('Teams webhook error', e)

def _send_email(subject, body):
    if not SMTP_HOST or not ALERT_EMAIL: return
    msg = EmailMessage(); msg['Subject']=subject; msg['From']=SMTP_USER; msg['To']=ALERT_EMAIL; msg.set_content(body)
    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as s:
        s.login(SMTP_USER, SMTP_PASS); s.send_message(msg)

@celery_app.on_after_configure.connect
def setup_periodic(sender, **_):
    sender.add_periodic_task(24*3600, nightly_audit.s(), name='Nightly audit 2AM UTC',
                             expires=3600, run_every=86400)

@celery_app.task
def nightly_audit():
    now=datetime.utcnow(); alerts=[]
    for file in (db.Path('data/projects').glob('*.json')):
        org=file.stem; meta=db.load(org)
        # ESG key age
        esg=load_esg(org)
        if esg:
            created=parser.parse(meta.get('created','2020-01-01'))
            if now-created>timedelta(days=365):
                alerts.append((org,'ESG key >12mo; rotate soon'))
        # SAML cert expiry
        s=saml_creds.load(org)
        if s:
            # crude expiry by reading cert end date line
            for line in s['idp_x509'].splitlines():
                if 'Not After' in line:
                    exp=parser.parse(line.split(':',1)[1].strip())
                    if exp-now<timedelta(days=30):
                        alerts.append((org,'SAML certificate expires <30 days'))
    for org,msg in alerts:
        db.append_history(org,{"type":"alert","msg":msg,"timestamp":now.isoformat()})
    # Group alerts by organization
    by_org = {}
    for org, msg in alerts:
        if org not in by_org:
            by_org[org] = []
        by_org[org].append(msg)
    
    # Send org-specific alerts to their Teams channels
    for org, messages in by_org.items():
        org_msg = f"Organization: {org}\n" + "\n".join(f"- {m}" for m in messages)
        # Send to org's Teams channel if configured
        _send_teams(org_msg, org_id=org)
    
    # Also send an aggregate alert to system-wide channels if any alerts exist
    if alerts:
        msg = "\n".join(f"{o}: {m}" for o,m in alerts)
        _send_email('TrialSage audit alerts', msg)
        _send_teams(msg)
