from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.services import ml_prediction_service as ml

router = APIRouter(
    prefix="/api/ml",
    tags=["ML Predictions"],
)


@router.post("/allocation/{task_id}")
def allocation(
    task_id: UUID,
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Score how well a candidate user fits a task."""
    return ml.predict_allocation(db, task_id, user_id)


@router.post("/predict-delay/{task_id}")
def predict_delay(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Predict whether the task's currently assigned user will finish it on time."""
    return ml.predict_delay(db, task_id)


@router.post("/predict-timeline/{task_id}")
def predict_timeline(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Predict expected completion time in hours for the task."""
    return ml.predict_timeline(db, task_id)


@router.post("/predict-risk/{task_id}")
def predict_risk(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Predict overdue risk level (High/Medium/Low) for the task."""
    return ml.predict_risk(db, task_id)
