from datetime import date
from uuid import UUID
from typing import Optional

from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    description: str
    priority: str
    status: str
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