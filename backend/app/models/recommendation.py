import uuid

from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database.base import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(String(100), nullable=False)

    recommendation = Column(Text, nullable=False)

    status = Column(String(20), nullable=False, default="pending")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )