from pydantic import BaseModel


class RecommendationCreate(BaseModel):
    user_id: str
    recommendation: str