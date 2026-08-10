"""
Runs the trained ML models (allocation_scorer, Delay_model, Timeline_Risk_model,
prediction_model) against real Task/User rows from the database, and caches
results back onto the task.

Replaces the previous stub in recommendation_service.py, which returned
hardcoded fake data.
"""
from datetime import datetime, timezone, date
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User
from app.services import ml_encoders as enc

MODELS_DIR = Path(__file__).resolve().parent.parent / "ml_models"

allocation_model = joblib.load(MODELS_DIR / "allocation_scorer.pkl")
delay_model = joblib.load(MODELS_DIR / "Delay_model.pkl")
# NOTE: pointed at the corrected interim retrain (see VALIDATION_REPORT.md).
# The original Timeline_Risk_model.pkl scored R²=-3.02 on its own training
# data -- a corrupted/wrong artifact, not a generalization issue. Swap this
# back to "Timeline_Risk_model.pkl" once you've re-run Timeline_&_Risk.ipynb
# yourselves, confirmed it reproduces MAE≈6.26 / R²≈0.86, and re-saved it.
timeline_model = joblib.load(MODELS_DIR / "Timeline_Risk_model_FIXED.pkl")
risk_model = joblib.load(MODELS_DIR / "prediction_model.pkl")

# Verified against the real model's .classes_: LabelEncoder alphabetically
# encoded ["High", "Low", "Medium"] -> 0, 1, 2.
RISK_LABELS = {0: "High", 1: "Low", 2: "Medium"}


def _get_task(db: Session, task_id) -> Task:
    task = db.query(Task).filter(Task.id == task_id, Task.is_deleted.is_(False)).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    return task


def _get_user(db: Session, user_id) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    return user


def _require(task: Task, *fields):
    missing = [f for f in fields if getattr(task, f) is None]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Task is missing required fields for this prediction: {', '.join(missing)}. "
                   f"Set them via PATCH before requesting a prediction.",
        )


def _current_delay_days(task: Task) -> float:
    """Days overdue right now, if not yet completed. Falls back to a stored value if set."""
    if task.delay_days is not None:
        return task.delay_days
    if task.due_date and task.status not in ("Done", "Completed"):
        overdue = (date.today() - task.due_date).days
        return float(max(overdue, 0))
    return 0.0


def predict_allocation(db: Session, task_id, user_id) -> dict:
    task = _get_task(db, task_id)
    user = _get_user(db, user_id)
    _require(task, "priority", "complexity", "team", "estimated_hours")

    data = pd.DataFrame([[
        0,  # Task_ID isn't a meaningful predictive feature; kept for column-order parity with training
        enc.encode_user(user.id),
        enc.encode("Priority", task.priority),
        enc.encode("Complexity", task.complexity),
        task.estimated_hours,
        task.actual_hours or 0,
        _current_delay_days(task),
        enc.encode("Team", task.team),
        user.experience_years or 0,
        task.bugs_reported or 0,
        task.rework_hours or 0,
        task.sprint or 1,
    ]], columns=[
        "Task_ID", "Assigned_User", "Priority", "Complexity", "Estimated_Hours",
        "Actual_Hours", "Delay_Days", "Team", "Experience_Years", "Bugs_Reported",
        "Rework_Hours", "Sprint",
    ])

    prediction = allocation_model.predict(data)
    score = float(prediction[0])

    if score == 3:
        status, message = "Highly Recommended", "Employee is highly suitable for this task."
    elif score == 2:
        status, message = "Recommended", "Employee is suitable for this task."
    else:
        status, message = "Not Recommended", "Consider assigning this task to another employee."

    return {
        "task_id": str(task_id),
        "user_id": str(user_id),
        "allocation_score": round(score, 2),
        "status": status,
        "message": message,
        "encoding_verified": enc.using_real_encoders(),
    }


def predict_delay(db: Session, task_id) -> dict:
    task = _get_task(db, task_id)
    _require(task, "assigned_to", "priority", "complexity", "team", "estimated_hours")
    user = _get_user(db, task.assigned_to)

    data = pd.DataFrame([[
        enc.encode_user(user.id),
        enc.encode("Priority", task.priority),
        enc.encode("Complexity", task.complexity),
        task.estimated_hours,
        task.actual_hours or 0,
        enc.encode("Team", task.team),
        user.experience_years or 0,
        task.bugs_reported or 0,
        task.rework_hours or 0,
        task.sprint or 1,
    ]], columns=[
        "Assigned_User", "Priority", "Complexity", "Estimated_Hours", "Actual_Hours",
        "Team", "Experience_Years", "Bugs_Reported", "Rework_Hours", "Sprint",
    ])

    prediction = delay_model.predict(data)
    label = "Delayed" if prediction[0] == 1 else "On Time"

    task.predicted_delay = label
    task.last_predicted_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "task_id": str(task_id),
        "assigned_to": str(task.assigned_to),
        "delay_prediction": int(prediction[0]),
        "status": label,
        "encoding_verified": enc.using_real_encoders(),
    }


def predict_timeline(db: Session, task_id) -> dict:
    task = _get_task(db, task_id)
    _require(task, "assigned_to", "priority", "complexity", "team", "estimated_hours")
    user = _get_user(db, task.assigned_to)

    data = pd.DataFrame([[
        enc.encode("Priority", task.priority),
        enc.encode("Team", task.team),
        enc.encode_user(user.id),
        task.sprint or 1,
        enc.encode("Complexity", task.complexity),
        user.experience_years or 0,
        task.estimated_hours,
        task.bugs_reported or 0,
        task.rework_hours or 0,
    ]], columns=[
        "Priority", "Team", "Assigned_User", "Sprint", "Complexity",
        "Experience_Years", "Estimated_Hours", "Bugs_Reported", "Rework_Hours",
    ])

    prediction = timeline_model.predict(data)
    predicted_days = float(prediction[0])

    # The trained XGBRegressor can extrapolate to physically impossible negative
    # hours for feature combinations outside its training distribution (observed
    # during validation on 10 real scenarios). Floor at 0 as a stopgap; the real
    # fix is retraining with regularization/more representative data — flagged
    # separately, this clip only prevents a nonsensical value from reaching users.
    predicted_days = max(predicted_days, 0.0)
    status = "On Schedule" if predicted_days <= task.estimated_hours else "Schedule Risk"

    task.predicted_completion_days = round(predicted_days, 2)
    task.last_predicted_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "task_id": str(task_id),
        "assigned_to": str(task.assigned_to),
        "estimated_completion_days": round(predicted_days, 2),
        "status": status,
        "encoding_verified": enc.using_real_encoders(),
    }


def predict_risk(db: Session, task_id) -> dict:
    task = _get_task(db, task_id)
    _require(task, "assigned_to", "priority")
    user = _get_user(db, task.assigned_to)

    priority_rank = {"Low": 1, "Medium": 2, "High": 3}.get(task.priority, 2)

    data = pd.DataFrame([[
        _current_delay_days(task),
        priority_rank,
        user.workload_score or 0,
        task.escalation_count or 0,
    ]], columns=["Delay_Days", "Task_Priority", "Assignee_Workload", "Escalation_Count"])

    prediction = risk_model.predict(data)
    risk_level = RISK_LABELS.get(int(prediction[0]), "Unknown")

    task.predicted_risk = risk_level
    task.last_predicted_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "task_id": str(task_id),
        "risk_level": risk_level,
        "days_overdue": _current_delay_days(task),
        "employee_workload": user.workload_score,
    }
