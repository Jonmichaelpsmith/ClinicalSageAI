from datetime import datetime, timedelta
import os, smtplib
from email.message import EmailMessage
from dateutil import parser
from ind_automation import db, saml_creds
from ind_automation.credentials import load as load_esg
from ind_automation.tasks import celery_app

SMTP_HOST=os.getenv('SMTP_HOST'); SMTP_PORT=int(os.getenv('SMTP_PORT','0'))
SMTP_USER=os.getenv('SMTP_USER'); SMTP_PASS=os.getenv('SMTP_PASS'); ALERT_EMAIL=os.getenv('ALERT_EMAIL')

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
    if alerts:
        _send_email('TrialSage audit alerts',"\n".join(f"{o}: {m}" for o,m in alerts))
