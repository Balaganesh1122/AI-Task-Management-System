import uuid

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database.base import Base


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    type = Column(String(50))

    recipient = Column(String(100))

    subject = Column(String(200))

    sent_at = Column(DateTime, server_default=func.now())

    status = Column(String(30))