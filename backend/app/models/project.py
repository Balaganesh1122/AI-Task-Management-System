import uuid

from sqlalchemy import Column, String, Date
from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name = Column(String(150), nullable=False)

    status = Column(String(50))

    owner_id = Column(UUID(as_uuid=True))

    start_date = Column(Date)

    end_date = Column(Date)