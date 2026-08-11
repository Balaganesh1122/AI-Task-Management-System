from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.email_log import EmailLog
from app.tasks import send_email_task


# =========================================================
# SEND EMAIL
# =========================================================

def send_email(email, db: Session):
    """
    Create an EmailLog record and queue the email through Celery.
    """

    # -----------------------------------------------------
    # Create database log
    # -----------------------------------------------------

    email_log = EmailLog(
        type="General",
        recipient=str(email.to),
        subject=email.subject,
        status="Queued",
    )

    db.add(email_log)
    db.commit()
    db.refresh(email_log)

    # -----------------------------------------------------
    # Queue Celery task
    # -----------------------------------------------------

    task_result = send_email_task.delay(
        recipient=str(email.to),
        subject=email.subject,
        body=email.body,
        email_log_id=str(email_log.id),
    )

    return {
        "message": "Email queued successfully",
        "email_id": str(email_log.id),
        "celery_task_id": task_result.id,
        "to": str(email.to),
        "subject": email.subject,
        "status": "Queued",
        "queued_at": datetime.now(timezone.utc),
    }


# =========================================================
# GET EMAIL LOGS
# =========================================================

def get_email_logs(db: Session):
    """
    Return real email logs from PostgreSQL.
    """

    logs = (
        db.query(EmailLog)
        .order_by(EmailLog.sent_at.desc())
        .all()
    )

    result = []

    for log in logs:

        result.append(
            {
                "id": str(log.id),
                "taskName": "",
                "assigneeName": "",
                "assigneeAvatar": "",
                "emailAddress": log.recipient,
                "assignedBy": "System",
                "subject": log.subject,
                "status": log.status,
                "emailType": log.type,
                "sentTime": (
                    log.sent_at.isoformat()
                    if log.sent_at
                    else None
                ),
                "deliveryTime": "",
                "content": "",
            }
        )

    return result