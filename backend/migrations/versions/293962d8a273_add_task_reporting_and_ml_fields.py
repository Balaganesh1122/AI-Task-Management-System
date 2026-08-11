"""add task reporting and ml fields

Revision ID: 293962d8a273
Revises: 3a6eedac118f
Create Date: 2026-08-11 16:32:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "293962d8a273"
down_revision: Union[str, Sequence[str], None] = "3a6eedac118f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add missing ML/reporting fields to tasks."""

    # =====================================================
    # ML INPUT FEATURES
    # =====================================================

    op.add_column(
        "tasks",
        sa.Column(
            "complexity",
            sa.String(length=20),
            nullable=True,
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "team",
            sa.String(length=50),
            nullable=True,
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "estimated_hours",
            sa.Float(),
            nullable=True,
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "actual_hours",
            sa.Float(),
            nullable=True,
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "delay_days",
            sa.Float(),
            nullable=True,
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "bugs_reported",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "rework_hours",
            sa.Float(),
            nullable=True,
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "sprint",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "escalation_count",
            sa.Integer(),
            nullable=True,
        ),
    )

    # =====================================================
    # ML OUTPUT FEATURES
    # =====================================================

    op.add_column(
        "tasks",
        sa.Column(
            "predicted_delay",
            sa.String(length=20),
            nullable=True,
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "predicted_completion_days",
            sa.Float(),
            nullable=True,
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "predicted_risk",
            sa.String(length=20),
            nullable=True,
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "last_predicted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Remove ML/reporting fields from tasks."""

    op.drop_column("tasks", "last_predicted_at")
    op.drop_column("tasks", "predicted_risk")
    op.drop_column("tasks", "predicted_completion_days")
    op.drop_column("tasks", "predicted_delay")

    op.drop_column("tasks", "escalation_count")
    op.drop_column("tasks", "sprint")
    op.drop_column("tasks", "rework_hours")
    op.drop_column("tasks", "bugs_reported")
    op.drop_column("tasks", "delay_days")
    op.drop_column("tasks", "actual_hours")
    op.drop_column("tasks", "estimated_hours")
    op.drop_column("tasks", "team")
    op.drop_column("tasks", "complexity")