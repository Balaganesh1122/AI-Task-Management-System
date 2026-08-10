from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db

# Schemas
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskStatusUpdate,
    ManualAssignRequest,
    BulkCreateRequest,
    AutoAssignRequest,
    EscalationRequest,
)
from app.schemas.ai_task import TaskExtractionRequest

# Services
from app.services.task_service import (
    create_task,
    get_tasks,
    get_task_by_id,
    update_task,
    delete_task,
    update_task_status,
    get_live_tracking,
    manual_assign_task,
    bulk_create_tasks,
    auto_assign_task,
    get_at_risk_tasks,
    search_tasks,
    get_task_history,
    get_overdue_tasks,
    escalate_task,
    get_overdue_predictions,
)

from app.services.ai_service import extract_tasks_from_text


router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"],
)


# ============================================================
# CREATE TASK
# ============================================================

@router.post("/")
def create_new_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
):
    new_task = create_task(db, task)

    return {
        "message": "Task created successfully",
        "task_id": str(new_task.id),
    }


# ============================================================
# LIST TASKS
# ============================================================

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


# ============================================================
# STATIC ROUTES
# IMPORTANT:
# These routes MUST appear before /{task_id}
# ============================================================


# ------------------------------------------------------------
# CREATE TASKS FROM TEXT
# ------------------------------------------------------------

@router.post("/create-from-text")
def create_tasks_from_text(
    request: TaskExtractionRequest,
):
    try:
        extracted = extract_tasks_from_text(
            request.text
        )

        return {
            "message": "AI extraction successful",
            "data": extracted,
        }

    except Exception:
        return {
            "message": "AI module not available yet.",
            "status": "Waiting for Deekshitha",
        }


# ------------------------------------------------------------
# LIVE TRACKING
# ------------------------------------------------------------

@router.get("/tracking/live")
def live_tracking(
    db: Session = Depends(get_db),
):
    return get_live_tracking(db)


# ------------------------------------------------------------
# BULK CREATE
# ------------------------------------------------------------

@router.post("/bulk-create")
def bulk_create(
    request: BulkCreateRequest,
    db: Session = Depends(get_db),
):
    return bulk_create_tasks(db, request)


# ------------------------------------------------------------
# AUTO ASSIGN
# ------------------------------------------------------------

@router.post("/auto-assign")
def auto_assign(
    request: AutoAssignRequest,
    db: Session = Depends(get_db),
):
    return auto_assign_task(db, request)


# ------------------------------------------------------------
# AT-RISK TASKS
# ------------------------------------------------------------

@router.get("/at-risk")
def at_risk_tasks(
    db: Session = Depends(get_db),
):
    return get_at_risk_tasks(db)


# ------------------------------------------------------------
# SEARCH TASKS
# ------------------------------------------------------------

@router.get("/search")
def search_task(
    query: str = Query(...),
    db: Session = Depends(get_db),
):
    return search_tasks(db, query)


# ------------------------------------------------------------
# OVERDUE TASKS
# ------------------------------------------------------------

@router.get("/overdue")
def overdue_tasks(
    db: Session = Depends(get_db),
):
    return get_overdue_tasks(db)


# ------------------------------------------------------------
# OVERDUE PREDICTIONS
# ------------------------------------------------------------

@router.get("/overdue/predictions")
def overdue_predictions(
    db: Session = Depends(get_db),
):
    return get_overdue_predictions(db)


# ============================================================
# TASK-SPECIFIC ROUTES
# ============================================================


# ------------------------------------------------------------
# MANUAL ASSIGN
# ------------------------------------------------------------

@router.put("/{task_id}/manual-assign")
def manual_assign(
    task_id: UUID,
    assignment: ManualAssignRequest,
    db: Session = Depends(get_db),
):
    return manual_assign_task(
        db,
        task_id,
        assignment,
    )


# ------------------------------------------------------------
# CHANGE TASK STATUS
# ------------------------------------------------------------

@router.put("/{task_id}/status")
def change_task_status(
    task_id: UUID,
    status: TaskStatusUpdate,
    db: Session = Depends(get_db),
):
    return update_task_status(
        db,
        task_id,
        status,
    )


# ------------------------------------------------------------
# TASK HISTORY
# ------------------------------------------------------------

@router.get("/{task_id}/history")
def task_history(
    task_id: UUID,
    db: Session = Depends(get_db),
):
    return get_task_history(
        db,
        task_id,
    )


# ------------------------------------------------------------
# ESCALATE TASK
# ------------------------------------------------------------

@router.post("/{task_id}/escalate")
def escalate(
    task_id: UUID,
    escalation: EscalationRequest,
    db: Session = Depends(get_db),
):
    return escalate_task(
        db,
        task_id,
        escalation,
    )


# ============================================================
# GENERIC TASK-ID ROUTES
# IMPORTANT:
# Keep /{task_id} LAST among GET routes
# ============================================================


# ------------------------------------------------------------
# GET SINGLE TASK
# ------------------------------------------------------------

@router.get("/{task_id}")
def get_single_task(
    task_id: UUID,
    db: Session = Depends(get_db),
):
    task = get_task_by_id(
        db,
        task_id,
    )

    return task


# ------------------------------------------------------------
# UPDATE TASK
# ------------------------------------------------------------

@router.put("/{task_id}")
def update_existing_task(
    task_id: UUID,
    task: TaskUpdate,
    db: Session = Depends(get_db),
):
    updated_task = update_task(
        db,
        task_id,
        task,
    )

    return {
        "message": "Task updated successfully",
        "task": updated_task,
    }


# ------------------------------------------------------------
# DELETE TASK
# ------------------------------------------------------------

@router.delete("/{task_id}")
def delete_existing_task(
    task_id: UUID,
    db: Session = Depends(get_db),
):
    return delete_task(
        db,
        task_id,
    )