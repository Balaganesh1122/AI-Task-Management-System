from datetime import date

from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation


def save_recommendation(db: Session, data):
    recommendation = Recommendation(
        user_id=data.user_id,
        recommendation=data.recommendation,
        status="pending"
    )

    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)

    return {
        "message": "Recommendation saved successfully",
        "id": str(recommendation.id),
        "user_id": recommendation.user_id,
        "recommendation": recommendation.recommendation,
        "status": recommendation.status,
        "created_at": recommendation.created_at
    }


def get_today_recommendations(db: Session):
    recommendations = (
        db.query(Recommendation)
        .filter(
            Recommendation.created_at >= date.today(),
            Recommendation.status == "pending"
        )
        .order_by(Recommendation.created_at.desc())
        .all()
    )

    return [
        {
            "id": str(item.id),
            "user_id": item.user_id,
            "recommendation": item.recommendation,
            "status": item.status,
            "created_at": item.created_at
        }
        for item in recommendations
    ]


def get_recommendation_history(db: Session):
    recommendations = (
        db.query(Recommendation)
        .order_by(Recommendation.created_at.desc())
        .all()
    )

    return [
        {
            "id": str(item.id),
            "user_id": item.user_id,
            "recommendation": item.recommendation,
            "status": item.status,
            "created_at": item.created_at
        }
        for item in recommendations
    ]


def update_recommendation_status(
    db: Session,
    recommendation_id,
    status: str
):
    recommendation = (
        db.query(Recommendation)
        .filter(Recommendation.id == recommendation_id)
        .first()
    )

    if not recommendation:
        return {
            "message": "Recommendation not found"
        }

    recommendation.status = status

    db.commit()
    db.refresh(recommendation)

    return {
        "message": f"Recommendation {status}",
        "id": str(recommendation.id),
        "status": recommendation.status
    }