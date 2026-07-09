import uuid

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database.base import Base


class AuditTrail(Base):
    __tablename__ = "audit_trail"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    entity_type = Column(String(100))

    entity_id = Column(UUID(as_uuid=True))

    action = Column(String(100))

    changed_by = Column(UUID(as_uuid=True))

    timestamp = Column(DateTime, server_default=func.now())