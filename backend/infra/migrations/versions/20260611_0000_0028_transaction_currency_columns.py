"""Add currency, fx_rate_applied, converted_amount columns to transactions.

Supports multi-currency trading accounts (INR + USD). When a cross-currency
transfer occurs, the transaction records the currency of the amount, the FX
rate used, and the converted amount in the other currency.

Revision ID: 0028
Revises: 0027
"""
from alembic import op
import sqlalchemy as sa

revision = "0028"
down_revision = "0027"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("transactions", sa.Column("currency", sa.String(5), server_default="USD"))
    op.add_column("transactions", sa.Column("fx_rate_applied", sa.Numeric(18, 8), nullable=True))
    op.add_column("transactions", sa.Column("converted_amount", sa.Numeric(18, 8), nullable=True))


def downgrade():
    op.drop_column("transactions", "converted_amount")
    op.drop_column("transactions", "fx_rate_applied")
    op.drop_column("transactions", "currency")
