"""Spread-revenue capture on Position + TradeHistory.

The matching engine and the quote widener already pickup a spread on
every fill, but until now we never persisted the broker's share — so
the admin Analytics "Spread" cell rendered as $0. This migration adds
a NUMERIC(18,8) column to both tables (default 0) so the fill paths
can write the computed value and the close paths can carry it forward
into history without a second computation.

The same ALTERs are mirrored in backend/services/admin/main.py's
_apply_startup_ddl block so production hosts that don't run alembic
still pick the columns up.

Revision ID: 0026
Revises: 0025
"""
from alembic import op


revision = "0026"
down_revision = "0025"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE positions ADD COLUMN IF NOT EXISTS spread_revenue NUMERIC(18, 8) DEFAULT 0"
    )
    op.execute(
        "ALTER TABLE trade_history ADD COLUMN IF NOT EXISTS spread_revenue NUMERIC(18, 8) DEFAULT 0"
    )


def downgrade() -> None:
    op.execute("ALTER TABLE positions DROP COLUMN IF EXISTS spread_revenue")
    op.execute("ALTER TABLE trade_history DROP COLUMN IF EXISTS spread_revenue")
