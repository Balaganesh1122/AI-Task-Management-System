from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.recommendation import RecommendationCreate
from app.services.recommendation_service import save_recommendation
from app.services.recommendation_service import get_today_recommendations
from app.services.recommendation_service import get_recommendation_history
from app.services.recommendation_service import update_recommendation_status


router = APIRouter(
    prefix="/api/recommendations",
    tags=["Recommendations"]
)


@router.post("/")
def create_recommendation(
    recommendation: RecommendationCreate,
    db: Session = Depends(get_db)
):
    return save_recommendation(db, recommendation)


@router.get("/today")
def today(
    db: Session = Depends(get_db)
):
    return get_today_recommendations(db)


@router.get("/history")
def history(
    db: Session = Depends(get_db)
):
    return get_recommendation_history(db)


@router.put("/{recommendation_id}/accept")
def accept(
    recommendation_id: UUID,
    db: Session = Depends(get_db)
):
    return update_recommendation_status(
        db,
        recommendation_id,
        "accepted"
    )


@router.put("/{recommendation_id}/dismiss")
def dismiss(
    recommendation_id: UUID,
    db: Session = Depends(get_db)
):
    return update_recommendation_status(
        db,
        recommendation_id,
        "dismissed"
    )