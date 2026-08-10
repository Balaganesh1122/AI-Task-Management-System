import uuid

from sqlalchemy import Column, String, Float

from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(100),
        unique=True,
        nullable=False
    )

    role = Column(
        String(50),
        nullable=False
    )

    department = Column(
        String(100)
    )

    skills = Column(
        String(255)
    )

    workload_score = Column(
        Float,
        default=0.0
    )

    # =====================================================
    # ML FEATURE
    # =====================================================

    experience_years = Column(
        Float,
        nullable=True,
        default=0.0
    )

    password = Column(
        String(255),
        nullable=False
    )