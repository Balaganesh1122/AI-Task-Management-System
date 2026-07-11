from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.auth import RegisterRequest
from app.services.auth_service import create_user

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(user: RegisterRequest, db: Session = Depends(get_db)):
    new_user = create_user(db, user)

    return {
        "message": "User registered successfully",
        "user_id": str(new_user.id)
    }