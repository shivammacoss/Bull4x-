"""Reconcile `trading_accounts.margin_used` from open positions.

Several close paths used to maintain `margin_used` via subtractive math
(`margin_used = max(0, margin_used - released)`). Drift across partial
closes, SL/TP races, MAM mirrors and copy-trade splits caused accounts
to show `MARGIN USED > 0` even when `Positions(0)`. The runtime now
recomputes from authoritative truth on every close; this migration
heals everyone created before the fix shipped.

Idempotent — safe to re-run.

Revision ID: 0023
Revises: 0022
"""
from alembic import op


revision = "0023"
down_revision = "0022"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # For every account, set margin_used = SUM of margin for OPEN positions,
    # then refresh equity + free_margin to stay internally consistent.
    op.execute(
        """
        WITH live_margin AS (
            SELECT
                p.account_id,
                COALESCE(SUM(
                    (p.lots * COALESCE(i.contract_size, 100000) * p.open_price)
                    / NULLIF(ta.leverage, 0)
                ), 0)::numeric(18,8) AS m
            FROM positions p
            JOIN trading_accounts ta ON ta.id = p.account_id
            LEFT JOIN instruments  i  ON i.id  = p.instrument_id
            WHERE p.status = 'open'
            GROUP BY p.account_id
        )
        UPDATE trading_accounts ta
           SET margin_used = COALESCE(lm.m, 0),
               equity      = COALESCE(ta.balance, 0) + COALESCE(ta.credit, 0),
               free_margin = (COALESCE(ta.balance, 0) + COALESCE(ta.credit, 0)) - COALESCE(lm.m, 0)
          FROM (
              SELECT ta2.id AS account_id,
                     (SELECT m FROM live_margin lm2 WHERE lm2.account_id = ta2.id) AS m
              FROM trading_accounts ta2
          ) lm
         WHERE ta.id = lm.account_id;
        """
    )


def downgrade() -> None:
    # Recomputing from truth has no meaningful inverse.
    pass
