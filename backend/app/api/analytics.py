from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.services.analytics_service import dashboard_summary
from app.services.analytics_service import productivity_report
from app.services.analytics_service import performance_report
from app.services.analytics_service import risk_predictions



router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db)
):

    return dashboard_summary(db)

@router.get("/productivity")
def productivity(
    db: Session = Depends(get_db)
):

    return productivity_report(db)

@router.get("/performance")
def performance(
    db: Session = Depends(get_db)
):

    return performance_report(db)

@router.get("/risk-predictions")
def analytics_risk_predictions(
    db: Session = Depends(get_db)
):

    return risk_predictions(db)