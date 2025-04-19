"""
Tasks module for IND Automation

This module defines Celery tasks for background processing, scheduling,
and async operations for the IND Automation system.
"""

import os
from celery import Celery

# Create Celery app
celery_app = Celery('ind_automation')

# Configure using object
celery_app.conf.update(
    broker_url=os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    result_backend=os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0'),
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    # Task settings
    task_acks_late=True,
    task_track_started=True,
    # Beat settings
    beat_schedule={
        'nightly-audit-2am': {
            'task': 'ind_automation.audit.nightly_audit',
            'schedule': 86400,  # Daily (seconds)
            'args': (),
            'kwargs': {},
            'options': {'expires': 3600},  # Expire after 1 hour
        },
    },
)

# Make sure the tasks are discovered/imported
celery_app.autodiscover_tasks(['ind_automation'])

# Example task for testing
@celery_app.task
def test_task(x, y):
    """Simple test task to verify Celery is working"""
    return x + y
import os, io, datetime, asyncio, json, requests, pytz
from celery.schedules import crontab

TEAMS_WEBHOOK_URL = os.getenv('TEAMS_WEBHOOK_URL')
PUBLIC_DIR = pathlib.Path('public/insights_reports'); PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
BASE_URL = os.getenv('BASE_URL', 'http://localhost:3000')

@celery_app.task
def generate_and_notify_pdf(org):
    # 1) Generate snapshot bytes
    pdf_bytes = asyncio.run(insights_pdf.render_pdf(f"{BASE_URL}/#/insights?org={org}&print=1"))
    branded = branded_pdf.brand_pdf(pdf_bytes, org)
    # 2) save to public folder
    fname = f"Insights_{org}_{datetime.date.today()}.pdf"
    path = PUBLIC_DIR / fname; path.write_bytes(branded.read())
    url = f"{BASE_URL}/files/insights_reports/{fname}"

    # 3) log history
    db.append_history(org, {"type": "insights_pdf", "url": url, "timestamp": datetime.datetime.utcnow().isoformat()})

    # 4) Teams card
    if TEAMS_WEBHOOK_URL:
        payload = {
            "@type": "MessageCard", "@context": "https://schema.org/extensions",
            "summary": "Weekly Insights Report",
            "themeColor": "0076D7",
            "title": f"Weekly Compliance Insights – {org}",
            "text": f"[Download PDF]({url}) – generated {datetime.date.today()}."
        }
        try:
            requests.post(TEAMS_WEBHOOK_URL, json=payload, timeout=5)
        except Exception as e:
            print('Teams send error', e)

# 5) schedule for each org
@celery_app.on_after_finalize.connect
def setup_weekly(sender, **_):
    sender.add_periodic_task(
        crontab(hour=15, minute=0, day_of_week='mon'),  # 15:00 UTC ≈ 08:00 PT
        generate_all_pdfs.s(),
        name='weekly pdf'
    )

@celery_app.task
def generate_all_pdfs():
    for f in pathlib.Path('data/projects').glob('*.json'):
        org = f.stem
        generate_and_notify_pdf.delay(org)
