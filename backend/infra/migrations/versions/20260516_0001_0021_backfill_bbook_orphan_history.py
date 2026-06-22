"""Backfill TradeHistory rows for closed positions missed by b-book-engine.

Migration 0018 ran a one-time backfill but the underlying bug stayed live:
b-book-engine matching_engine._close_position fired on every SL/TP trigger
yet never inserted a TradeHistory row, so any auto-closed trade after 0018
deployed silently disappeared from the "Closed Positions" tab.

This migration repeats the same idempotent backfill so production data
created after 0018 (and before the b-book-engine fix is deployed alongside
this migration) becomes visible again. Safe to re-run — the LEFT JOIN +
NULL filter only inserts where no history row exists.

Revision ID: 0021
Revises: 0020
"""
from alembic import op


revision = "0021"
down_revision = "0020"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        INSERT INTO trade_history (
            id, position_id, account_id, instrument_id, side,
            lots, open_price, close_price,
            swap, commission, profit,
            opened_at, closed_at, close_reason
        )
        SELECT
            gen_random_uuid(),
            p.id,
            p.account_id,
            p.instrument_id,
            p.side,
            p.lots,
            p.open_price,
            COALESCE(p.close_price, p.open_price),
            COALESCE(p.swap, 0),
            COALESCE(p.commission, 0),
            COALESCE(p.profit, 0),
            p.created_at,
            COALESCE(p.closed_at, now()),
            CASE
                WHEN p.stop_loss IS NOT NULL AND p.close_price IS NOT NULL AND (
                    (LOWER(CAST(p.side AS TEXT)) = 'buy'  AND p.close_price <= p.stop_loss)
                 OR (LOWER(CAST(p.side AS TEXT)) = 'sell' AND p.close_price >= p.stop_loss)
                ) THEN 'sl'
                WHEN p.take_profit IS NOT NULL AND p.close_price IS NOT NULL AND (
                    (LOWER(CAST(p.side AS TEXT)) = 'buy'  AND p.close_price >= p.take_profit)
                 OR (LOWER(CAST(p.side AS TEXT)) = 'sell' AND p.close_price <= p.take_profit)
                ) THEN 'tp'
                WHEN p.comment ILIKE '%stop-out%' THEN 'stop_out'
                WHEN p.is_admin_modified IS TRUE THEN 'admin'
                ELSE 'manual'
            END
        FROM positions p
        LEFT JOIN trade_history th ON th.position_id = p.id
        WHERE p.status = 'closed'
          AND th.id IS NULL
          AND p.closed_at IS NOT NULL;
    """)


def downgrade() -> None:
    # No safe downgrade — see migration 0018 for the same reasoning.
    pass
