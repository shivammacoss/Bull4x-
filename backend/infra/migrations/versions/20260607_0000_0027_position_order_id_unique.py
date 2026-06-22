"""Add unique constraint on positions.order_id to prevent duplicate fills.

A pending order must produce at most one position. Without this constraint
a race condition (double-click, concurrent engine ticks) could silently
create two positions for the same order.

Revision ID: 0027
Revises: 0026
"""
from alembic import op

revision = "0027"
down_revision = "0026"
branch_labels = None
depends_on = None


def upgrade():
    # First, clean up any existing duplicates (keep the earliest position per order_id)
    op.execute("""
        DELETE FROM positions
        WHERE id IN (
            SELECT id FROM (
                SELECT id, ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY created_at ASC) AS rn
                FROM positions
                WHERE order_id IS NOT NULL
            ) dupes
            WHERE rn > 1
        )
    """)
    op.create_unique_constraint("uq_positions_order_id", "positions", ["order_id"])


def downgrade():
    op.drop_constraint("uq_positions_order_id", "positions", type_="unique")
