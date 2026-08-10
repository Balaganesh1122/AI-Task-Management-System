"""add ML task and user fields

Revision ID: 3a6eedac118f
Revises: 2d46ca8009d0
Create Date: 2026-08-10 22:29:22.862970

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic

revision: str = "3a6eedac118f"
down_revision: Union[str, Sequence[str], None] = "2d46ca8009d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # =====================================================
    # ML INPUT FEATURES - TASK
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
    # ML OUTPUT FEATURES - TASK
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

    # =====================================================
    # ML INPUT FEATURES - USER
    # =====================================================

    op.add_column(
        "users",
        sa.Column(
            "experience_years",
            sa.Float(),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""

    # =====================================================
    # USER ML FIELD
    # =====================================================

    op.drop_column(
        "users",
        "experience_years",
    )

    # =====================================================
    # TASK ML OUTPUT FIELDS
    # =====================================================

    op.drop_column(
        "tasks",
        "predicted_completion_days",
    )

    op.drop_column(
        "tasks",
        "predicted_delay",
    )

    # =====================================================
    # TASK ML INPUT FIELDS
    # =====================================================

    op.drop_column(
        "tasks",
        "escalation_count",
    )

    op.drop_column(
        "tasks",
        "sprint",
    )

    op.drop_column(
        "tasks",
        "rework_hours",
    )

    op.drop_column(
        "tasks",
        "bugs_reported",
    )

    op.drop_column(
        "tasks",
        "delay_days",
    )

    op.drop_column(
        "tasks",
        "actual_hours",
    )

    op.drop_column(
        "tasks",
        "estimated_hours",
    )

    op.drop_column(
        "tasks",
        "team",
    )

    op.drop_column(
        "tasks",
        "complexity",
    )