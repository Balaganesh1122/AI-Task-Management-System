from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.auth import RegisterRequest
from app.services.auth_service import create_user
from app.schemas.auth import LoginRequest
from app.services.auth_service import login_user
from fastapi import HTTPException

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

@router.post("/login")
def login(user: LoginRequest, db: Session = Depends(get_db)):

    token = login_user(db, user.email, user.password)

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return token