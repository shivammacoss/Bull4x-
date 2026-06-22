"""IB commission idempotency + extended source references.

Two changes to `ib_commissions`:

1. The `source_trade_id` FK to `orders.id` is dropped. The new IB engine
   passes `TradeHistory.id` for trade-close events and `Deposit.id` for
   CPA events; the column now just stores an opaque UUID identifier.

2. A composite UNIQUE constraint over
   `(ib_id, source_trade_id, commission_type, mlm_level)` so a retried
   close handler can't double-pay the same IB for the same trade.

Both changes are idempotent (constraint dropped via DO-block lookup).

Revision ID: 0022
Revises: 0021
"""
from alembic import op


revision = "0022"
down_revision = "0021"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── 1) Drop any FK on source_trade_id (constraint name is auto-generated,
    # so look it up at runtime).
    op.execute(
        """
        DO $$
        DECLARE
            fk_name TEXT;
        BEGIN
            SELECT conname
              INTO fk_name
              FROM pg_constraint
             WHERE conrelid = 'ib_commissions'::regclass
               AND contype  = 'f'
               AND conkey   = ARRAY[
                   (SELECT attnum FROM pg_attribute
                     WHERE attrelid = 'ib_commissions'::regclass
                       AND attname  = 'source_trade_id')
               ];
            IF fk_name IS NOT NULL THEN
                EXECUTE 'ALTER TABLE ib_commissions DROP CONSTRAINT ' || quote_ident(fk_name);
            END IF;
        END$$;
        """
    )

    # ── 2) Composite unique constraint for idempotency.
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                 WHERE conname = 'uq_ib_commissions_idem'
            ) THEN
                ALTER TABLE ib_commissions
                  ADD CONSTRAINT uq_ib_commissions_idem
                  UNIQUE (ib_id, source_trade_id, commission_type, mlm_level);
            END IF;
        END$$;
        """
    )

    # Helpful read index for "give me everything this IB earned on this deposit/trade".
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_ib_commissions_source "
        "ON ib_commissions (source_trade_id, commission_type);"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_ib_commissions_source;")
    op.execute("ALTER TABLE ib_commissions DROP CONSTRAINT IF EXISTS uq_ib_commissions_idem;")
    # FK is intentionally not restored — re-adding would fail on rows whose
    # source_trade_id now references TradeHistory or Deposit (not Orders).
