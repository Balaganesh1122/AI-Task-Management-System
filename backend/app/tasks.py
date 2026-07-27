from app.core.celery_app import celery_app


@celery_app.task
def test_task():
    print("Celery is working!")
    return "Celery Working"