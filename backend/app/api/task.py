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
from app.schemas.ai_task import TaskExtractionRequest
from app.services.ai_service import extract_tasks_from_text
from app.services.task_service import get_live_tracking
from app.schemas.task import ManualAssignRequest
from app.services.task_service import manual_assign_task
from app.schemas.task import BulkCreateRequest
from app.services.task_service import bulk_create_tasks
from app.schemas.task import AutoAssignRequest
from app.services.task_service import auto_assign_task
from app.services.task_service import get_at_risk_tasks
from fastapi import Query
from app.services.task_service import search_tasks
from app.services.task_service import get_task_history

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

@router.post("/create-from-text")
def create_tasks_from_text(
    request: TaskExtractionRequest
):

    try:

        extracted = extract_tasks_from_text(
            request.text
        )

        return {
            "message": "AI extraction successful",
            "data": extracted
        }

    except Exception:

        return {
            "message": "AI module not available yet.",
            "status": "Waiting for Deekshitha"
        }
    
@router.get("/tracking/live")
def live_tracking(
db: Session = Depends(get_db)
):

    return get_live_tracking(db)

@router.put("/{task_id}/manual-assign")
def manual_assign(
    task_id: UUID,
    assignment: ManualAssignRequest,
    db: Session = Depends(get_db)
):

    return manual_assign_task(
        db,
        task_id,
        assignment
    )

@router.post("/bulk-create")
def bulk_create(
    request: BulkCreateRequest,
    db: Session = Depends(get_db)
):

    return bulk_create_tasks(db, request)

@router.post("/auto-assign")
def auto_assign(
    request: AutoAssignRequest,
    db: Session = Depends(get_db)
):
    return auto_assign_task(db, request)

@router.get("/at-risk")
def at_risk_tasks(
    db: Session = Depends(get_db)
):

    return get_at_risk_tasks(db)

@router.get("/search")
def search_task(
    query: str = Query(...),
    db: Session = Depends(get_db)
):

    return search_tasks(db, query)

@router.get("/{task_id}/history")
def task_history(
    task_id: UUID,
    db: Session = Depends(get_db)
):

    return get_task_history(db, task_id)