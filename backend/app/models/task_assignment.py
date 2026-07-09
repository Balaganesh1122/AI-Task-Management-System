import uuid

from sqlalchemy import Column, DateTime, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database.base import Base


class TaskAssignment(Base):
    __tablename__ = "task_assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    task_id = Column(UUID(as_uuid=True))

    user_id = Column(UUID(as_uuid=True))

    assigned_at = Column(DateTime, server_default=func.now())

    allocation_score = Column(Float)