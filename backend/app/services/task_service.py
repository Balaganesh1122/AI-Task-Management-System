from sqlalchemy.orm import Session

from app.models.task import Task


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

    return db_task

from typing import Optional
from uuid import UUID


def get_tasks(
    db: Session,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_to: Optional[UUID] = None,
    project_id: Optional[UUID] = None,
):

    query = db.query(Task).filter(Task.is_deleted == False)

    if status:
        query = query.filter(Task.status == status)

    if priority:
        query = query.filter(Task.priority == priority)

    if assigned_to:
        query = query.filter(Task.assigned_to == assigned_to)

    if project_id:
        query = query.filter(Task.project_id == project_id)

    return query.all()

from fastapi import HTTPException

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

    return task

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

    return {
        "message": "Task deleted successfully"
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

    task.status = status_data.status

    db.commit()
    db.refresh(task)

    return {
        "message": "Task status updated successfully",
        "task": task
    }