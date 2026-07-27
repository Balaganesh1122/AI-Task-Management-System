from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.services.user_service import get_user_workload
from fastapi import Query
from app.services.user_service import get_users_by_skill


router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.get("/workload")
def workload(
    db: Session = Depends(get_db)
):
    return get_user_workload(db)

@router.get("/skills-match")
def skills_match(
    task_category: str = Query(...),
    db: Session = Depends(get_db)
):

    return get_users_by_skill(db, task_category)