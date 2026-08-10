from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.services.project_service import get_all_projects

router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"]
)


@router.get("/list")
def project_list(
    db: Session = Depends(get_db)
):
    return get_all_projects(db)