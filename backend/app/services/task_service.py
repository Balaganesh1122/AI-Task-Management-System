import json
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.task import Task
from app.utils.redis_client import redis_client
from sqlalchemy import or_
from datetime import date



# ----------------------------
# CREATE TASK
# ----------------------------

def create_task(db: Session, task):

    db_task = Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        assigned_to=task.assigned_to,
        project_id=task.project_id,
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    # Clear cache whenever data changes
    redis_client.delete("task_list")

    return db_task


# ----------------------------
# GET ALL TASKS (WITH REDIS CACHE)
# ----------------------------

def get_tasks(
    db: Session,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_to: Optional[UUID] = None,
    project_id: Optional[UUID] = None,
):

    # Cache only when no filters are used
    if (
        status is None
        and priority is None
        and assigned_to is None
        and project_id is None
    ):
        cached_tasks = redis_client.get("task_list")

        if cached_tasks:
            return json.loads(cached_tasks)

    query = db.query(Task).filter(Task.is_deleted == False)

    if status:
        query = query.filter(Task.status == status)

    if priority:
        query = query.filter(Task.priority == priority)

    if assigned_to:
        query = query.filter(Task.assigned_to == assigned_to)

    if project_id:
        query = query.filter(Task.project_id == project_id)

    tasks = query.all()

    task_data = []

    for task in tasks:
        task_data.append(
            {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "status": task.status,
                "due_date": str(task.due_date) if task.due_date else None,
                "assigned_to": str(task.assigned_to) if task.assigned_to else None,
                "project_id": str(task.project_id) if task.project_id else None,
                "is_deleted": task.is_deleted,
            }
        )

    # Cache only unfiltered task list
    if (
        status is None
        and priority is None
        and assigned_to is None
        and project_id is None
    ):
        redis_client.setex(
            "task_list",
            60,
            json.dumps(task_data)
        )

    return task_data


# ----------------------------
# GET TASK BY ID
# ----------------------------

def get_task_by_id(db: Session, task_id):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.is_deleted == False
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task


# ----------------------------
# UPDATE TASK
# ----------------------------

def update_task(db: Session, task_id, task_data):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.is_deleted == False
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    task.title = task_data.title
    task.description = task_data.description
    task.priority = task_data.priority
    task.status = task_data.status
    task.due_date = task_data.due_date
    task.assigned_to = task_data.assigned_to
    task.project_id = task_data.project_id

    db.commit()
    db.refresh(task)

    # Clear cache
    redis_client.delete("task_list")

    return task


# ----------------------------
# SOFT DELETE TASK
# ----------------------------

def delete_task(db: Session, task_id):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.is_deleted == False
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    task.is_deleted = True

    db.commit()

    # Clear cache
    redis_client.delete("task_list")

    return {
        "message": "Task deleted successfully"
    }


# ----------------------------
# UPDATE TASK STATUS
# ----------------------------

VALID_TRANSITIONS = {
    "Pending": ["In Progress"],
    "In Progress": ["Completed"],
    "Completed": [],
}


def update_task_status(db: Session, task_id, status_data):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.is_deleted == False
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    current_status = task.status
    new_status = status_data.status

    if new_status not in VALID_TRANSITIONS.get(current_status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition from '{current_status}' to '{new_status}'"
        )

    task.status = new_status

    db.commit()
    db.refresh(task)

    return {
        "message": "Task status updated successfully",
        "task": task
    }

from datetime import date


def get_live_tracking(db: Session):

    total = db.query(Task).filter(
        Task.is_deleted == False
    ).count()

    pending = db.query(Task).filter(
        Task.status == "Pending",
        Task.is_deleted == False
    ).count()

    in_progress = db.query(Task).filter(
        Task.status == "In Progress",
        Task.is_deleted == False
    ).count()

    completed = db.query(Task).filter(
        Task.status == "Completed",
        Task.is_deleted == False
    ).count()

    overdue = db.query(Task).filter(
        Task.due_date < date.today(),
        Task.status != "Completed",
        Task.is_deleted == False
    ).count()

    completion_rate = 0

    if total > 0:
        completion_rate = round(
            (completed / total) * 100,
            2
        )

    return {
        "total_tasks": total,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed,
        "overdue": overdue,
        "completion_rate": completion_rate
    }

from fastapi import HTTPException


def manual_assign_task(
    db: Session,
    task_id,
    assignment
):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.is_deleted == False
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    task.assigned_to = assignment.assigned_to

    db.commit()
    db.refresh(task)

    return {
        "message": "Task assigned successfully",
        "task": task,
        "reason": assignment.reason
    }

def bulk_create_tasks(db: Session, request):

    created_tasks = []

    for item in request.tasks:

        task = Task(
            title=item.title,
            description=item.description,
            priority=item.priority,
            status=item.status,
            due_date=item.due_date,
            assigned_to=item.assigned_to,
            project_id=item.project_id
        )

        db.add(task)
        created_tasks.append(task)

        db.commit()

        for task in created_tasks:
            db.refresh(task)

        return {
            "message": f"{len(created_tasks)} tasks created successfully",
            "tasks": created_tasks
        }
    
def auto_assign_task(db: Session, request):

    task = db.query(Task).filter(
        Task.id == request.task_id,
        Task.is_deleted == False
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return {
        "message": "Waiting for Vaibhav's AllocationScorer integration.",
        "task_id": str(task.id)
    }

def get_at_risk_tasks(db: Session):

    return {
        "message": "Waiting for Vaibhav's Delay Prediction Model.",
        "at_risk_tasks": []
    }



def search_tasks(db: Session, query: str):

    tasks = db.query(Task).filter(
        Task.is_deleted == False,
        or_(
            Task.title.ilike(f"%{query}%"),
            Task.description.ilike(f"%{query}%")
        )
    ).all()

    return tasks


from fastapi import HTTPException


def get_task_history(db: Session, task_id):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.is_deleted == False
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return {
        "task_id": str(task.id),
        "history": [
            {
                "event": "Task Created",
                "status": task.status,
                "timestamp": str(task.due_date)
            }
        ]
    }

def get_overdue_tasks(db: Session):

    tasks = db.query(Task).filter(
        Task.is_deleted == False,
        Task.status != "Done",
        Task.due_date < date.today()
    ).all()

    response = []

    for task in tasks:

        overdue_days = (date.today() - task.due_date).days

        if overdue_days <= 2:
            risk = "Low"
        elif overdue_days <= 5:
            risk = "Medium"
        else:
            risk = "High"

        response.append({
            "task_id": str(task.id),
            "title": task.title,
            "status": task.status,
            "due_date": task.due_date,
            "overdue_days": overdue_days,
            "risk_level": risk
        })

    return response

def escalate_task(db: Session, task_id, escalation):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.is_deleted == False
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    task.is_escalated = True
    task.escalation_reason = escalation.reason

    db.commit()
    db.refresh(task)

    return {
        "message": "Task escalated successfully",
        "task": task
    }

def get_overdue_predictions(db: Session):

    tasks = db.query(Task).filter(
        Task.is_deleted == False,
        Task.status != "Done"
    ).all()

    predictions = []

    today = date.today()

    for task in tasks:

        days_left = (task.due_date - today).days

        if days_left <= 1:
            risk = "High"
            probability = 0.95

        elif days_left <= 3:
            risk = "Medium"
            probability = 0.75

        elif days_left <= 7:
            risk = "Low"
            probability = 0.40

        else:
            risk = "Minimal"
            probability = 0.10

        predictions.append(
            {
                "task_id": str(task.id),
                "title": task.title,
                "status": task.status,
                "due_date": task.due_date,
                "days_remaining": days_left,
                "predicted_risk": risk,
                "probability": probability
            }
        )

    return predictions