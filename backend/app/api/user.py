from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.services.user_service import (
    get_user_workload,
    get_users_by_skill,
)

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


# ---------------------------------------------------------
# Get all users
# ---------------------------------------------------------
@router.get("/")
def get_users(
    db: Session = Depends(get_db)
):
    users = db.query(User).all()

    return [
        {
            "id": str(user.id),
            "user_id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "skills": user.skills,
            "workload_score": user.workload_score or 0,
        }
        for user in users
    ]


# ---------------------------------------------------------
# User workload
# ---------------------------------------------------------
@router.get("/workload")
def workload(
    db: Session = Depends(get_db)
):
    return get_user_workload(db)


# ---------------------------------------------------------
# Match users by skill
# ---------------------------------------------------------
@router.get("/skills-match")
def skills_match(
    task_category: str = Query(...),
    db: Session = Depends(get_db)
):
    return get_users_by_skill(db, task_category)