"""MAM/Signal monthly fee settlement — defer per-trade fees to month-end.

The previous model charged the master's performance fee on every individual
winning trade, which left followers worse off when their losing trades
weren't netted against the wins. The new model accumulates all closed-trade
P&L over a billing period (default: calendar month) and settles a single
fee against the NET result, with a high-water mark so master never collects
fee on recovery from a previous drawdown.

Settlement triggers:
  - Calendar month end (cron, runs daily, settles periods whose period_end
    has passed)
  - Follower stops copying (immediate)
  - Master account deletion (immediate)

PAMM excluded — pool model handles distribution differently.

Schema changes:
  1. New `mam_settlement_periods` table (one row per billing period per
     allocation, status flips active → settled).
  2. `investor_allocations` gets `current_period_id`, `lifetime_master_fee_paid`,
     `lifetime_admin_fee_paid` for fast UI queries.
  3. Backfill: every active MAM/signal allocation gets an initial active
     period row anchored at "now" so the first settlement only counts
     trades from this point forward (we deliberately don't retroactively
     re-charge past per-trade fees).

Revision ID: 0017
Revises: 0016
"""
from alembic import op


revision = "0017"
down_revision = "0016"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── 1. Settlement period table ──────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS mam_settlement_periods (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            allocation_id UUID NOT NULL REFERENCES investor_allocations(id) ON DELETE CASCADE,
            master_id UUID NOT NULL REFERENCES master_accounts(id) ON DELETE CASCADE,
            period_start TIMESTAMPTZ NOT NULL,
            period_end TIMESTAMPTZ NOT NULL,
            performance_fee_pct NUMERIC(5,2) NOT NULL,
            admin_commission_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
            starting_balance NUMERIC(18,8) NOT NULL,
            high_water_mark NUMERIC(18,8) NOT NULL,
            total_deposits NUMERIC(18,8) NOT NULL DEFAULT 0,
            total_withdrawals NUMERIC(18,8) NOT NULL DEFAULT 0,
            ending_balance NUMERIC(18,8),
            gross_pnl NUMERIC(18,8),
            performance_fee_charged NUMERIC(18,8) DEFAULT 0,
            admin_fee_charged NUMERIC(18,8) DEFAULT 0,
            net_pnl_to_follower NUMERIC(18,8),
            status VARCHAR(20) NOT NULL DEFAULT 'active',
            settle_reason VARCHAR(20),
            settled_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CHECK (status IN ('active', 'settled')),
            CHECK (settle_reason IS NULL OR settle_reason IN ('month_end', 'unfollow', 'master_deleted'))
        );
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_mam_periods_allocation ON mam_settlement_periods(allocation_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_mam_periods_master ON mam_settlement_periods(master_id);")
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_mam_periods_active_due
        ON mam_settlement_periods(period_end)
        WHERE status = 'active';
    """)

    # ── 2. Allocation columns for UI shortcuts + period pointer ─────────
    op.execute("""
        ALTER TABLE investor_allocations
        ADD COLUMN IF NOT EXISTS current_period_id UUID REFERENCES mam_settlement_periods(id),
        ADD COLUMN IF NOT EXISTS lifetime_master_fee_paid NUMERIC(18,8) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS lifetime_admin_fee_paid NUMERIC(18,8) NOT NULL DEFAULT 0;
    """)

    # ── 3. Backfill: open an initial active period for every active
    #     MAM / signal allocation. Anchored at NOW — past trades stay on
    #     the old per-trade model, future trades will be accumulated for
    #     this period and settled at month-end.
    op.execute("""
        WITH eligible AS (
            SELECT a.id            AS allocation_id,
                   a.master_id     AS master_id,
                   a.investor_account_id AS account_id,
                   m.performance_fee_pct AS perf_pct,
                   m.admin_commission_pct AS admin_pct,
                   COALESCE(ta.balance, 0) AS bal
            FROM investor_allocations a
            JOIN master_accounts m ON m.id = a.master_id
            LEFT JOIN trading_accounts ta ON ta.id = a.investor_account_id
            WHERE a.status = 'active'
              AND m.master_type IN ('mamm', 'signal_provider')
              AND a.current_period_id IS NULL
        ),
        inserted AS (
            INSERT INTO mam_settlement_periods (
                allocation_id, master_id, period_start, period_end,
                performance_fee_pct, admin_commission_pct,
                starting_balance, high_water_mark, status
            )
            SELECT
                e.allocation_id, e.master_id,
                date_trunc('day', now()),
                date_trunc('month', now()) + interval '1 month' - interval '1 second',
                e.perf_pct, COALESCE(e.admin_pct, 0),
                e.bal, e.bal,
                'active'
            FROM eligible e
            RETURNING id, allocation_id
        )
        UPDATE investor_allocations a
        SET current_period_id = i.id
        FROM inserted i
        WHERE a.id = i.allocation_id;
    """)


def downgrade() -> None:
    op.execute("ALTER TABLE investor_allocations DROP COLUMN IF EXISTS current_period_id;")
    op.execute("ALTER TABLE investor_allocations DROP COLUMN IF EXISTS lifetime_master_fee_paid;")
    op.execute("ALTER TABLE investor_allocations DROP COLUMN IF EXISTS lifetime_admin_fee_paid;")
    op.execute("DROP TABLE IF EXISTS mam_settlement_periods;")
