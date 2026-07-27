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