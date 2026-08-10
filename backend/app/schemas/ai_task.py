from uuid import UUID

from pydantic import BaseModel


class TaskExtractionRequest(BaseModel):
    text: str


class ExtractedTask(BaseModel):
    title: str
    description: str
    priority: str
    due_date: str


class TaskExtractionResponse(BaseModel):
    tasks: list[ExtractedTask]


class AutoAssignRequest(BaseModel):
    task_id: UUID