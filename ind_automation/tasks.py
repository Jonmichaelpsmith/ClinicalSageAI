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