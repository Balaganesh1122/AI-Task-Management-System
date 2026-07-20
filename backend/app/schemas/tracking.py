from pydantic import BaseModel


class LiveTrackingResponse(BaseModel):
    total_tasks: int
    pending: int
    in_progress: int
    completed: int
    overdue: int
    completion_rate: float