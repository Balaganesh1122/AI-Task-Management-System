import uuid

from sqlalchemy import Column, Float, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"))

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    allocation_score = Column(Float)

    reason = Column(Text)