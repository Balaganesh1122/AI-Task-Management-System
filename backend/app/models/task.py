import uuid

from sqlalchemy import Column, String, Text, Date
from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    title = Column(String(200), nullable=False)

    description = Column(Text)

    priority = Column(String(20))

    status = Column(String(30))

    due_date = Column(Date)

    assigned_to = Column(UUID(as_uuid=True))

    project_id = Column(UUID(as_uuid=True))