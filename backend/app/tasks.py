from app.core.celery_app import celery_app


@celery_app.task
def test_task():
    print("Celery is working!")
    return "Celery Working"

@celery_app.task
def daily_report():
    print("Generating Daily Report...")


@celery_app.task
def weekly_report():
    print("Generating Weekly Report...")


@celery_app.task
def monthly_report():
    print("Generating Monthly Report...")