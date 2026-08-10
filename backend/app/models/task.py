import uuid

from sqlalchemy import (
    Column,
    String,
    Text,
    Date,
    Boolean,
    DateTime,
    Float,
    Integer,
)

from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    title = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text
    )

    priority = Column(
        String(20)
    )

    status = Column(
        String(30),
        nullable=False,
        default="Pending"
    )

    due_date = Column(
        Date
    )

    assigned_to = Column(
        UUID(as_uuid=True)
    )

    project_id = Column(
        UUID(as_uuid=True)
    )

    is_deleted = Column(
        Boolean,
        default=False
    )

    is_escalated = Column(
        Boolean,
        default=False
    )

    escalation_reason = Column(
        Text,
        nullable=True
    )

    # =====================================================
    # ML INPUT FEATURES
    # =====================================================

    complexity = Column(
        String(20),
        nullable=True
    )

    team = Column(
        String(50),
        nullable=True
    )

    estimated_hours = Column(
        Float,
        nullable=True
    )

    actual_hours = Column(
        Float,
        nullable=True
    )

    delay_days = Column(
        Float,
        nullable=True
    )

    bugs_reported = Column(
        Integer,
        nullable=True
    )

    rework_hours = Column(
        Float,
        nullable=True
    )

    sprint = Column(
        Integer,
        nullable=True
    )

    escalation_count = Column(
        Integer,
        nullable=True
    )

    # =====================================================
    # ML OUTPUTS
    # =====================================================

    predicted_delay = Column(
        String(20),
        nullable=True
    )

    predicted_completion_days = Column(
        Float,
        nullable=True
    )

    predicted_risk = Column(
        String(20),
        nullable=True
    )

    last_predicted_at = Column(
        DateTime(timezone=True),
        nullable=True
    )