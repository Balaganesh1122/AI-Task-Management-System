from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.task import TaskCreate
from app.services.task_service import create_task
from typing import Optional
from uuid import UUID
from app.services.task_service import get_tasks
from uuid import UUID
from app.services.task_service import get_task_by_id
from app.services.task_service import update_task
from app.schemas.task import TaskUpdate
from app.services.task_service import delete_task
from app.schemas.task import TaskStatusUpdate
from app.services.task_service import update_task_status


router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"]
)


@router.post("/")
def create_new_task(
    task: TaskCreate,
    db: Session = Depends(get_db)
):

    new_task = create_task(db, task)

    return {
        "message": "Task created successfully",
        "task_id": str(new_task.id)
    }

@router.get("/")
def list_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_to: Optional[UUID] = None,
    project_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
):

    tasks = get_tasks(
        db,
        status,
        priority,
        assigned_to,
        project_id,
    )

    return tasks

@router.get("/{task_id}")
def get_single_task(
    task_id: UUID,
    db: Session = Depends(get_db)
):

    task = get_task_by_id(db, task_id)

    return task

@router.put("/{task_id}")
def update_existing_task(
    task_id: UUID,
    task: TaskUpdate,
    db: Session = Depends(get_db)
):

    updated_task = update_task(
        db,
        task_id,
        task
    )

    return {
        "message": "Task updated successfully",
        "task": updated_task
    }

@router.delete("/{task_id}")
def delete_existing_task(
    task_id: UUID,
    db: Session = Depends(get_db)
):

    return delete_task(db, task_id)

@router.put("/{task_id}/status")
def change_task_status(
    task_id: UUID,
    status: TaskStatusUpdate,
    db: Session = Depends(get_db)
):

    return update_task_status(
        db,
        task_id,
        status
    )