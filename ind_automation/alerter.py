from __future__ import annotations
import os, requests, smtplib, ssl
from email.message import EmailMessage
from enum import IntFlag
from typing import Dict, Protocol
from ind_automation.users import AlertChannel, get_channels

SMTP_HOST=os.getenv('SMTP_HOST'); SMTP_PORT=int(os.getenv('SMTP_PORT','465'))
SMTP_USER=os.getenv('SMTP_USER'); SMTP_PASS=os.getenv('SMTP_PASS')
TEAMS_WEBHOOK=os.getenv('TEAMS_WEBHOOK_URL')

class Dispatcher(Protocol):
    def send(self, alert:Dict, user:str)->None: ...

class TeamsDispatcher:
    def send(self, alert:Dict, user:str)->None:
        if not TEAMS_WEBHOOK: return
        payload={"@type":"MessageCard","@context":"https://schema.org/extensions","summary":alert['msg'],"title":"Compliance Alert","text":alert['msg']}
        try: requests.post(TEAMS_WEBHOOK,json=payload,timeout=5)
        except Exception as e: print('Teams send error',e)
class EmailDispatcher:
    def send(self, alert:Dict, user:str)->None:
        if not SMTP_HOST: return
        msg=EmailMessage(); msg['Subject']='Compliance Alert'; msg['From']=SMTP_USER; msg['To']=user; msg.set_content(alert['msg'])
        try:
            with smtplib.SMTP_SSL(SMTP_HOST,SMTP_PORT,context=ssl.create_default_context()) as s:
                s.login(SMTP_USER,SMTP_PASS); s.send_message(msg)
        except Exception as e: print('Email send error',e)

dispatchers={AlertChannel.TEAMS:TeamsDispatcher(), AlertChannel.EMAIL:EmailDispatcher()}

def publish(alert:Dict):
    from ind_automation import users
    for user,meta in users.all_users().items():
        chan=AlertChannel(meta.get('alert_channels',int(AlertChannel.TEAMS)))
        if chan & AlertChannel.TEAMS: dispatchers[AlertChannel.TEAMS].send(alert,user)
        if chan & AlertChannel.EMAIL: dispatchers[AlertChannel.EMAIL].send(alert,user)
