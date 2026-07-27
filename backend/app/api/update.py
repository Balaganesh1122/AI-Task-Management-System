from uuid import UUID

from fastapi import APIRouter

from app.services.update_service import generate_task_update
from app.services.update_service import get_task_updates
from app.services.update_service import get_full_timeline

router = APIRouter(
    prefix="/api/tasks",
    tags=["Task Updates"]
)


@router.post("/{task_id}/updates/generate")
def generate_update(task_id: UUID):

    return generate_task_update(task_id)


@router.get("/{task_id}/updates")
def task_updates(task_id: UUID):

    return get_task_updates(task_id)

@router.get("/{task_id}/full-timeline")
def full_timeline(task_id: UUID):

    return get_full_timeline(task_id)