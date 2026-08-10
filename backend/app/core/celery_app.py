from celery import Celery

celery_app = Celery(
    "ai_task_management",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

celery_app.conf.update(
    timezone="Asia/Kolkata",
    enable_utc=False
)

from celery.schedules import crontab

celery_app.conf.beat_schedule = {

    "daily-report": {
        "task": "app.tasks.daily_report",
        "schedule": crontab(hour=18, minute=0),
    },

    "weekly-report": {
        "task": "app.tasks.weekly_report",
        "schedule": crontab(day_of_week=1, hour=8, minute=0),
    },

    "monthly-report": {
        "task": "app.tasks.monthly_report",
        "schedule": crontab(day_of_month=1, hour=9, minute=0),
    }

}