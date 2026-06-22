"""FX rate config — per-pair markup_percent applied to live FX rates.

Backs the USD↔INR conversion shown on UPI deposit/withdraw forms.
Phase 1 ships with USD/INR seeded at 0% markup (raw spot rate). Admin can
edit markup later from the admin panel (separate PR).

Revision ID: 0024
Revises: 0023
"""
from alembic import op


revision = "0024"
down_revision = "0023"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS fx_rate_config (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            currency_pair VARCHAR(16) UNIQUE NOT NULL,
            markup_percent NUMERIC(6, 4) NOT NULL DEFAULT 0,
            updated_at TIMESTAMPTZ DEFAULT now()
        );
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_fx_rate_config_pair ON fx_rate_config (currency_pair);")
    op.execute("""
        INSERT INTO fx_rate_config (currency_pair, markup_percent)
        VALUES ('USD/INR', 0)
        ON CONFLICT (currency_pair) DO NOTHING;
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS fx_rate_config;")
