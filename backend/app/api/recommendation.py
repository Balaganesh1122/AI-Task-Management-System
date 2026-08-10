from fastapi import APIRouter

from app.schemas.recommendation import RecommendationCreate
from app.services.recommendation_service import save_recommendation
from app.services.recommendation_service import get_today_recommendations


router = APIRouter(
    prefix="/api/recommendations",
    tags=["Recommendations"]
)


@router.post("/")
def create_recommendation(
    recommendation: RecommendationCreate
):

    return save_recommendation(recommendation)

@router.get("/today")
def today():

    return get_today_recommendations()