"""add ML risk prediction fields

Revision ID: 2d46ca8009d0
Revises: 1e25c6cdd553
Create Date: 2026-08-10 19:47:44.240131

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2d46ca8009d0"
down_revision: Union[str, Sequence[str], None] = "1e25c6cdd553"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "tasks",
        sa.Column(
            "predicted_risk",
            sa.String(length=20),
            nullable=True
        )
    )

    op.add_column(
        "tasks",
        sa.Column(
            "last_predicted_at",
            sa.DateTime(timezone=True),
            nullable=True
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        "tasks",
        "last_predicted_at"
    )

    op.drop_column(
        "tasks",
        "predicted_risk"
    )