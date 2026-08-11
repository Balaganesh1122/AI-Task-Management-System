from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.email import EmailRequest
from app.services.email_service import send_email
from app.services.email_service import get_email_logs


router = APIRouter(
    prefix="/api/email",
    tags=["Email"],
)


@router.post("/send")
def send(
    email: EmailRequest,
    db: Session = Depends(get_db),
):
    """
    Queue an email for asynchronous delivery.
    """

    return send_email(
        email,
        db,
    )


@router.get("/logs")
def email_logs(
    db: Session = Depends(get_db),
):
    """
    Return email delivery logs.
    """

    return get_email_logs(db)