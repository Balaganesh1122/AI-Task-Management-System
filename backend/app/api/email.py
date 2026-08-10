from fastapi import APIRouter

from app.schemas.email import EmailRequest
from app.services.email_service import send_email
from app.services.email_service import get_email_logs


router = APIRouter(
    prefix="/api/email",
    tags=["Email"],
)


@router.post("/send")
def send(email: EmailRequest):
    return send_email(email)


@router.get("/logs")
def email_logs():
    return get_email_logs()