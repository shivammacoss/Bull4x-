"""Compound index on positions(account_id, status) — covers the hot query.

`list_positions` and `place_order`'s margin recalc both run
    SELECT ... FROM positions WHERE account_id = ? AND status = 'open'
which became O(table-scan) for accounts that accumulated a long closed-
position history. A two-column btree turns that into an instant index-
only lookup. Keep the single-column index on `account_id` (still useful
for portfolio queries that don't filter by status).

Revision ID: 0025
Revises: 0024
"""
from alembic import op


revision = "0025"
down_revision = "0024"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_positions_account_status "
        "ON positions (account_id, status);"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_positions_account_status;")
