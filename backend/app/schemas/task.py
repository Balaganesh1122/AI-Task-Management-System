from datetime import date
from uuid import UUID
from typing import Optional, List

from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    description: str
    priority: str
    status: str = "Pending"
    due_date: date
    assigned_to: Optional[UUID] = None
    project_id: Optional[UUID] = None


class TaskUpdate(BaseModel):
    title: str
    description: str
    priority: str
    status: str
    due_date: date
    assigned_to: Optional[UUID] = None
    project_id: Optional[UUID] = None


class TaskStatusUpdate(BaseModel):
    status: str


class ManualAssignRequest(BaseModel):
    assigned_to: UUID
    reason: str


class BulkTaskCreateRequest(BaseModel):
    title: str
    description: str
    priority: str
    status: str
    due_date: date
    assigned_to: Optional[UUID] = None
    project_id: Optional[UUID] = None


class BulkCreateRequest(BaseModel):
    tasks: List[BulkTaskCreateRequest]

class AutoAssignRequest(BaseModel):
    task_id: UUID

class EscalationRequest(BaseModel):
    reason: str