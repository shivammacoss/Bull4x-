"""MAM / Signal-provider monthly fee settlement.

Architecture
------------
During an active period:
  * Follower's closed trades land on their trading account at GROSS P&L
    (the copy engine no longer deducts fee mid-period).
  * Master + admin fees accrue purely as a calculation against the
    period's running P&L; no money moves.

At settlement time (month_end | unfollow | master_deleted):
  * gross_pnl = ending_balance - starting_balance - deposits + withdrawals
  * eligible = max(0, ending_balance - high_water_mark)
  * performance_fee = eligible * perf_pct
  * admin_fee = performance_fee * admin_pct
  * Debit fee from follower's trading account, credit master's main wallet
    + admin wallet, mark period settled, start a new period if the
    allocation is still active.
  * High-water mark carries forward — master never collects fee on a
    recovery from prior drawdown.

PAMM is excluded from this flow (pool model, distributed differently).
"""
from __future__ import annotations

import calendar
import logging
import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from packages.common.src.admin_fees import credit_admin_fee
from packages.common.src.models import (
    InvestorAllocation, MAMSettlementPeriod, MasterAccount,
    TradingAccount, Transaction, User,
)

logger = logging.getLogger("mam_settlement")

ELIGIBLE_MASTER_TYPES = ("mamm", "signal_provider")
SETTLE_REASONS = ("month_end", "unfollow", "master_deleted")


# ───────────────────────── helpers ─────────────────────────

def _calendar_month_end(now: datetime) -> datetime:
    """Last second of the current calendar month, in UTC."""
    last_day = calendar.monthrange(now.year, now.month)[1]
    return datetime(
        now.year, now.month, last_day,
        23, 59, 59, tzinfo=timezone.utc,
    )


async def _is_eligible_master(db: AsyncSession, master_id: uuid.UUID) -> Optional[MasterAccount]:
    """Returns the MasterAccount only if it's an MAM / signal master eligible
    for this settlement model (PAMM excluded)."""
    result = await db.execute(
        select(MasterAccount).where(
            MasterAccount.id == master_id,
            MasterAccount.master_type.in_(ELIGIBLE_MASTER_TYPES),
        )
    )
    return result.scalar_one_or_none()


# ───────────────────────── period lifecycle ─────────────────────────

async def start_new_period(
    db: AsyncSession,
    allocation: InvestorAllocation,
    starting_balance: Decimal,
    period_start: Optional[datetime] = None,
) -> MAMSettlementPeriod:
    """Open a fresh active period for an allocation. Caller must commit.

    Fee percentages are frozen at period-start so a master changing
    performance_fee_pct mid-period only affects future periods.
    """
    master = await _is_eligible_master(db, allocation.master_id)
    if master is None:
        raise ValueError(
            f"Allocation {allocation.id} master is not MAM/signal — settlement n/a"
        )

    now = period_start or datetime.now(timezone.utc)
    period = MAMSettlementPeriod(
        allocation_id=allocation.id,
        master_id=allocation.master_id,
        period_start=now,
        period_end=_calendar_month_end(now),
        performance_fee_pct=master.performance_fee_pct or Decimal("0"),
        admin_commission_pct=master.admin_commission_pct or Decimal("0"),
        starting_balance=starting_balance,
        high_water_mark=starting_balance,
        total_deposits=Decimal("0"),
        total_withdrawals=Decimal("0"),
        status="active",
    )
    db.add(period)
    await db.flush()  # need period.id to point allocation at it
    allocation.current_period_id = period.id
    return period


async def record_capital_event(
    db: AsyncSession,
    allocation_id: uuid.UUID,
    event_type: str,
    amount: Decimal,
) -> None:
    """Record a deposit or withdrawal against the active period so the P&L
    formula doesn't mistake topped-up capital for trading profit.

    `event_type` is "deposit" or "withdrawal"; `amount` is positive.
    """
    if event_type not in ("deposit", "withdrawal"):
        raise ValueError(f"event_type must be deposit or withdrawal, got {event_type}")
    if amount <= 0:
        return  # nothing to record

    alloc = await db.get(InvestorAllocation, allocation_id)
    if not alloc or alloc.current_period_id is None:
        return  # allocation gone or no active period — nothing to track

    period = await db.get(MAMSettlementPeriod, alloc.current_period_id)
    if period is None or period.status != "active":
        return

    if event_type == "deposit":
        period.total_deposits = (period.total_deposits or Decimal("0")) + amount
    else:
        period.total_withdrawals = (period.total_withdrawals or Decimal("0")) + amount


# ───────────────────────── pending fee calculation ─────────────────────────

async def compute_pending_fee(
    db: AsyncSession,
    allocation_id: uuid.UUID,
) -> dict:
    """Compute what the period would settle to if it closed RIGHT NOW.
    Pure read — no DB writes. Used by UI cards to display live numbers.
    """
    alloc = await db.get(InvestorAllocation, allocation_id)
    if not alloc:
        return _empty_pending(reason="allocation_not_found")
    if alloc.current_period_id is None:
        return _empty_pending(reason="no_active_period")

    period = await db.get(MAMSettlementPeriod, alloc.current_period_id)
    if period is None or period.status != "active":
        return _empty_pending(reason="period_not_active")

    account = await db.get(TradingAccount, alloc.investor_account_id) if alloc.investor_account_id else None
    current_balance = (account.balance or Decimal("0")) if account else Decimal("0")

    starting = period.starting_balance or Decimal("0")
    deposits = period.total_deposits or Decimal("0")
    withdrawals = period.total_withdrawals or Decimal("0")
    hwm = period.high_water_mark or starting

    # Net trading P&L for the period — strips out capital movements.
    gross_pnl = current_balance - starting - deposits + withdrawals

    # Track HWM live for display only (persisted at settlement).
    live_hwm = max(hwm, current_balance)
    eligible_for_fee = max(Decimal("0"), current_balance - hwm)

    perf_pct = period.performance_fee_pct or Decimal("0")
    admin_pct = period.admin_commission_pct or Decimal("0")

    perf_fee = eligible_for_fee * perf_pct / Decimal("100")
    admin_fee = perf_fee * admin_pct / Decimal("100")
    master_share = perf_fee - admin_fee
    net_to_follower = gross_pnl - perf_fee

    return {
        "allocation_id": str(allocation_id),
        "period_id": str(period.id),
        "period_start": period.period_start.isoformat(),
        "period_end": period.period_end.isoformat(),
        "performance_fee_pct": float(perf_pct),
        "admin_commission_pct": float(admin_pct),
        "starting_balance": float(starting),
        "current_balance": float(current_balance),
        "high_water_mark": float(live_hwm),
        "total_deposits": float(deposits),
        "total_withdrawals": float(withdrawals),
        "gross_pnl": float(gross_pnl),
        "pending_performance_fee": float(perf_fee),
        "pending_admin_fee": float(admin_fee),
        "pending_master_share": float(master_share),
        "projected_net_to_follower": float(net_to_follower),
    }


def _empty_pending(reason: str) -> dict:
    return {
        "period_id": None,
        "gross_pnl": 0.0,
        "pending_performance_fee": 0.0,
        "pending_admin_fee": 0.0,
        "pending_master_share": 0.0,
        "projected_net_to_follower": 0.0,
        "note": reason,
    }


# ───────────────────────── settlement ─────────────────────────

async def settle_period(
    db: AsyncSession,
    allocation_id: uuid.UUID,
    reason: str,
    *,
    open_next_period: bool = True,
) -> dict:
    """Close the active period: debit fee from follower's trading account,
    credit master's main wallet + admin, mark period settled. If
    `open_next_period` is True (default) and the allocation is still active,
    immediately open a fresh period anchored at NOW.

    Caller must commit.
    """
    if reason not in SETTLE_REASONS:
        raise ValueError(f"reason must be one of {SETTLE_REASONS}, got {reason}")

    alloc = await db.get(InvestorAllocation, allocation_id)
    if alloc is None:
        raise ValueError(f"Allocation {allocation_id} not found")
    if alloc.current_period_id is None:
        return {"settled": False, "note": "no active period to settle"}

    period = await db.get(MAMSettlementPeriod, alloc.current_period_id)
    if period is None or period.status != "active":
        return {"settled": False, "note": "period missing or already settled"}

    master = await _is_eligible_master(db, alloc.master_id)
    if master is None:
        # Master swapped types or got deleted — close the period without fees.
        period.status = "settled"
        period.settled_at = datetime.now(timezone.utc)
        period.settle_reason = reason
        period.ending_balance = period.starting_balance
        period.gross_pnl = Decimal("0")
        period.net_pnl_to_follower = Decimal("0")
        alloc.current_period_id = None
        return {"settled": True, "note": "master ineligible, no fee charged"}

    account = await db.get(TradingAccount, alloc.investor_account_id) if alloc.investor_account_id else None
    if account is None:
        period.status = "settled"
        period.settled_at = datetime.now(timezone.utc)
        period.settle_reason = reason
        alloc.current_period_id = None
        return {"settled": True, "note": "follower account missing, period closed without fee"}

    current_balance = account.balance or Decimal("0")
    starting = period.starting_balance or Decimal("0")
    deposits = period.total_deposits or Decimal("0")
    withdrawals = period.total_withdrawals or Decimal("0")
    hwm = period.high_water_mark or starting
    perf_pct = period.performance_fee_pct or Decimal("0")
    admin_pct = period.admin_commission_pct or Decimal("0")

    gross_pnl = current_balance - starting - deposits + withdrawals
    eligible = max(Decimal("0"), current_balance - hwm)
    perf_fee = eligible * perf_pct / Decimal("100")
    admin_fee = perf_fee * admin_pct / Decimal("100")
    master_share = perf_fee - admin_fee

    # Cap fee at follower's available balance — never overdraw the account.
    if perf_fee > current_balance:
        perf_fee = current_balance
        admin_fee = perf_fee * admin_pct / Decimal("100")
        master_share = perf_fee - admin_fee
        logger.warning(
            "MAM settlement: fee capped at available balance for allocation=%s",
            allocation_id,
        )

    if perf_fee > 0:
        account.balance = current_balance - perf_fee
        account.equity = account.balance + (account.credit or Decimal("0"))
        account.free_margin = account.equity - (account.margin_used or Decimal("0"))

        db.add(Transaction(
            user_id=alloc.investor_user_id,
            account_id=account.id,
            type="commission",
            amount=-perf_fee,
            balance_after=account.balance,
            reference_id=period.id,
            description=(
                f"MAM performance fee — period {period.period_start.date()} "
                f"to {period.period_end.date()} ({reason})"
            ),
        ))

        master_user = await db.get(User, master.user_id)
        if master_user is not None:
            master_user.main_wallet_balance = (
                master_user.main_wallet_balance or Decimal("0")
            ) + master_share
            db.add(Transaction(
                user_id=master.user_id,
                account_id=master.account_id,
                type="ib_commission",
                amount=master_share,
                balance_after=master_user.main_wallet_balance,
                reference_id=period.id,
                description=(
                    f"MAM master fee earnings — period {period.period_start.date()} "
                    f"to {period.period_end.date()} ({reason})"
                ),
            ))

        if admin_fee > 0:
            await credit_admin_fee(
                db, admin_fee,
                description=(
                    f"Platform commission ({admin_pct}%) from MAM master "
                    f"{master.id} settlement ({reason})"
                ),
                reference_id=period.id,
            )

        master.total_fee_earned = (master.total_fee_earned or Decimal("0")) + master_share
        alloc.lifetime_master_fee_paid = (alloc.lifetime_master_fee_paid or Decimal("0")) + master_share
        alloc.lifetime_admin_fee_paid = (alloc.lifetime_admin_fee_paid or Decimal("0")) + admin_fee

    # Persist period results
    period.ending_balance = account.balance
    period.gross_pnl = gross_pnl
    period.performance_fee_charged = perf_fee
    period.admin_fee_charged = admin_fee
    period.net_pnl_to_follower = gross_pnl - perf_fee
    period.high_water_mark = max(hwm, account.balance)
    period.status = "settled"
    period.settle_reason = reason
    period.settled_at = datetime.now(timezone.utc)

    # Open next period if allocation is still active and it's a normal cycle close
    next_period_id = None
    if open_next_period and alloc.status == "active" and reason == "month_end":
        next_period = await start_new_period(
            db, alloc, starting_balance=account.balance,
            period_start=period.settled_at + timedelta(seconds=1),
        )
        # carry HWM forward so a new period doesn't reset the high-water mark
        next_period.high_water_mark = period.high_water_mark
        next_period_id = next_period.id
    else:
        # unfollow / master_deleted — no next period
        alloc.current_period_id = None

    return {
        "settled": True,
        "period_id": str(period.id),
        "next_period_id": str(next_period_id) if next_period_id else None,
        "gross_pnl": float(gross_pnl),
        "performance_fee": float(perf_fee),
        "admin_fee": float(admin_fee),
        "master_share": float(master_share),
        "reason": reason,
    }


async def settle_all_due_periods(db: AsyncSession) -> dict:
    """Cron entry — settle every active period whose period_end has passed.
    Called once per day from stats_engine.
    """
    now = datetime.now(timezone.utc)
    due_q = await db.execute(
        select(MAMSettlementPeriod.allocation_id).where(
            MAMSettlementPeriod.status == "active",
            MAMSettlementPeriod.period_end <= now,
        )
    )
    allocation_ids = [row[0] for row in due_q.all()]

    settled = 0
    skipped = 0
    errors = 0
    for alloc_id in allocation_ids:
        try:
            result = await settle_period(db, alloc_id, reason="month_end")
            if result.get("settled"):
                settled += 1
            else:
                skipped += 1
        except Exception as e:
            errors += 1
            logger.error("MAM settle_period failed for allocation=%s: %s", alloc_id, e)

    return {"due": len(allocation_ids), "settled": settled, "skipped": skipped, "errors": errors}
