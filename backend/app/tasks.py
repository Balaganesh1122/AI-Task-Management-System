from datetime import datetime, timezone
import os
import smtplib
from email.message import EmailMessage

from app.core.celery_app import celery_app
from app.database.connection import SessionLocal
from app.models.email_log import EmailLog


@celery_app.task
def test_task():
    print("Celery is working!")
    return "Celery Working"


@celery_app.task
def send_email_task(
    recipient: str,
    subject: str,
    body: str,
    email_log_id: str | None = None,
):
    """
    Send an email asynchronously through Celery.

    SMTP configuration is read from environment variables.
    If SMTP is not configured, the task records the email as
    simulated instead of pretending that it was delivered.
    """

    db = SessionLocal()

    try:
        smtp_host = os.getenv("SMTP_HOST")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME")
        smtp_password = os.getenv("SMTP_PASSWORD")
        smtp_from = os.getenv("SMTP_FROM", smtp_username or "")

        # -------------------------------------------------
        # SMTP not configured
        # -------------------------------------------------

        if not smtp_host or not smtp_username or not smtp_password:
            print(
                f"[EMAIL SIMULATION] To={recipient} "
                f"Subject={subject}"
            )

            if email_log_id:
                log = db.query(EmailLog).filter(
                    EmailLog.id == email_log_id
                ).first()

                if log:
                    log.status = "Simulated"
                    db.commit()

            return {
                "status": "Simulated",
                "to": recipient,
                "subject": subject,
            }

        # -------------------------------------------------
        # Build email
        # -------------------------------------------------

        message = EmailMessage()
        message["From"] = smtp_from
        message["To"] = recipient
        message["Subject"] = subject
        message.set_content(body)

        # -------------------------------------------------
        # Send email
        # -------------------------------------------------

        with smtplib.SMTP(smtp_host, smtp_port) as server:

            server.starttls()

            server.login(
                smtp_username,
                smtp_password,
            )

            server.send_message(message)

        # -------------------------------------------------
        # Update email log
        # -------------------------------------------------

        if email_log_id:

            log = db.query(EmailLog).filter(
                EmailLog.id == email_log_id
            ).first()

            if log:
                log.status = "Delivered"
                db.commit()

        return {
            "status": "Delivered",
            "to": recipient,
            "subject": subject,
        }

    except Exception as exc:

        db.rollback()

        if email_log_id:

            log = db.query(EmailLog).filter(
                EmailLog.id == email_log_id
            ).first()

            if log:
                log.status = "Failed"
                db.commit()

        print(f"[EMAIL ERROR] {exc}")

        raise

    finally:
        db.close()


# =========================================================
# SCHEDULED REPORT TASKS
# =========================================================

@celery_app.task
def daily_report():
    print("Generating Daily Report...")
    return "Daily Report Generated"


@celery_app.task
def weekly_report():
    print("Generating Weekly Report...")
    return "Weekly Report Generated"


@celery_app.task
def monthly_report():
    print("Generating Monthly Report...")
    return "Monthly Report Generated"