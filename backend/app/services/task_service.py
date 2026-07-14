import json
from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.task import Task
from app.utils.redis_client import redis_client


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

    task.status = status_data.status

    db.commit()
    db.refresh(task)

    # Clear cache
    redis_client.delete("task_list")

    return {
        "message": "Task status updated successfully",
        "task": task
    }