"""Backfill TradeHistory rows for closed positions that have no history row.

Two existing code paths historically closed positions without writing a
TradeHistory row, so those trades silently disappeared from the user's
"Closed Trades" list and the admin trades view:

  1. risk-engine _execute_stop_out — closed positions on margin call but
     never inserted a history row (now fixed).
  2. business_service.delete_master — sweeps follower positions to
     status=closed with profit=0 but doesn't write history (intentional;
     refund is recorded via Transaction instead).

This migration walks every closed position that has no matching
trade_history row and creates one. close_reason is inferred from the
close_price relative to SL/TP when possible, otherwise falls back to
'manual' (the historical default).

Idempotent — only inserts where no history row exists yet.

Revision ID: 0018
Revises: 0017
"""
from alembic import op


revision = "0018"
down_revision = "0017"
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
                -- SL hit: BUY closed at/below SL, or SELL closed at/above SL
                WHEN p.stop_loss IS NOT NULL AND p.close_price IS NOT NULL AND (
                    (LOWER(CAST(p.side AS TEXT)) = 'buy'  AND p.close_price <= p.stop_loss)
                 OR (LOWER(CAST(p.side AS TEXT)) = 'sell' AND p.close_price >= p.stop_loss)
                ) THEN 'sl'
                -- TP hit: BUY closed at/above TP, or SELL closed at/below TP
                WHEN p.take_profit IS NOT NULL AND p.close_price IS NOT NULL AND (
                    (LOWER(CAST(p.side AS TEXT)) = 'buy'  AND p.close_price >= p.take_profit)
                 OR (LOWER(CAST(p.side AS TEXT)) = 'sell' AND p.close_price <= p.take_profit)
                ) THEN 'tp'
                -- Risk-engine stop-out leaves a recognizable comment
                WHEN p.comment ILIKE '%stop-out%' THEN 'stop_out'
                ELSE 'manual'
            END
        FROM positions p
        LEFT JOIN trade_history th ON th.position_id = p.id
        WHERE p.status = 'closed'
          AND th.id IS NULL
          AND p.closed_at IS NOT NULL;
    """)


def downgrade() -> None:
    # No safe downgrade — we'd need to know which specific rows the
    # backfill inserted. If you must roll back, manually identify and
    # delete history rows whose creation timestamp matches this migration
    # run.
    pass
