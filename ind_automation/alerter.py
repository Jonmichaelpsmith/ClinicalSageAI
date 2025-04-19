"""Channel‑aware alert dispatcher (Teams & Email). Extendable to Slack etc."""
from __future__ import annotations
from typing import Dict
from .users import AlertChannel, get_channels, all_users
import os, requests, smtplib, ssl
from email.message import EmailMessage

SMTP_HOST=os.getenv('SMTP_HOST'); SMTP_PORT=int(os.getenv('SMTP_PORT','465'))
SMTP_USER=os.getenv('SMTP_USER'); SMTP_PASS=os.getenv('SMTP_PASS')
TEAMS_WEBHOOK=os.getenv('TEAMS_WEBHOOK_URL')

def _send_teams(alert:Dict):
    if not TEAMS_WEBHOOK: return
    payload={"@type":"MessageCard","@context":"https://schema.org/extensions","summary":alert['msg'],"themeColor":"D9534F","title":"Compliance Alert","text":alert['msg']}
    try: requests.post(TEAMS_WEBHOOK,json=payload,timeout=4)
    except Exception as e: print('Teams send error',e)

def _send_email(alert:Dict, user:str):
    if not SMTP_HOST: return
    msg=EmailMessage(); msg['Subject']='TrialSage Alert'; msg['From']=SMTP_USER; msg['To']=user; msg.set_content(alert['msg'])
    try:
        with smtplib.SMTP_SSL(SMTP_HOST,SMTP_PORT,context=ssl.create_default_context()) as s:
            s.login(SMTP_USER,SMTP_PASS); s.send_message(msg)
    except Exception as e:
        print('Email send error',e)

def publish(alert:Dict):
    for user,meta in all_users().items():
        chan=AlertChannel(meta.get('alert_channels',int(AlertChannel.TEAMS)))
        if chan & AlertChannel.TEAMS: _send_teams(alert)
        if chan & AlertChannel.EMAIL: _send_email(alert,user)
