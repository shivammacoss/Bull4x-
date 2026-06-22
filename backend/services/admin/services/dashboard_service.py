"""Admin Dashboard Service — stats and revenue series."""
from datetime import datetime, timedelta, date

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from packages.common.src.models import (
    User, Position, Deposit, Withdrawal, Transaction, SupportTicket, PositionStatus,
)
from packages.common.src.admin_schemas import (
    DashboardStats, DashboardRevenueSeries, DashboardRevenuePoint,
)


async def get_dashboard_stats(db: AsyncSession) -> DashboardStats:
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    from packages.common.src.models import TradingAccount

    # Total Users: matches User Management page — all except admin/super_admin.
    total_users_q = await db.execute(
        select(func.count(User.id)).where(
            User.role.notin_(["admin", "super_admin"]),
        )
    )
    total_users = total_users_q.scalar() or 0

    # Active Traders: distinct users who traded in the last 30 days
    # (opened a position OR closed a trade). Broader than "has open position now".
    from packages.common.src.models import TradeHistory
    thirty_days_ago = today_start - timedelta(days=30)

    # Users with positions opened in last 30 days on a LIVE account. Demo
    # activity is excluded — both demo accounts and demo users — so "active
    # traders" reflects real customer count.
    open_users_q = (
        select(TradingAccount.user_id)
        .select_from(Position)
        .join(TradingAccount, TradingAccount.id == Position.account_id)
        .join(User, User.id == TradingAccount.user_id)
        .where(
            Position.created_at >= thirty_days_ago,
            TradingAccount.is_demo == False,
            User.is_demo == False,
        )
    )
    # Users with trades closed in last 30 days on a LIVE account.
    closed_users_q = (
        select(TradingAccount.user_id)
        .select_from(TradeHistory)
        .join(TradingAccount, TradingAccount.id == TradeHistory.account_id)
        .join(User, User.id == TradingAccount.user_id)
        .where(
            TradeHistory.closed_at >= thirty_days_ago,
            TradingAccount.is_demo == False,
            User.is_demo == False,
        )
    )
    combined = open_users_q.union(closed_users_q).subquery()
    active_traders_q = await db.execute(
        select(func.count(func.distinct(combined.c.user_id)))
    )
    active_traders = active_traders_q.scalar() or 0

    # Deposits Today: approved deposits since midnight UTC.
    deposits_today_q = await db.execute(
        select(func.coalesce(func.sum(Deposit.amount), 0)).where(
            Deposit.status.in_(["approved", "auto_approved"]),
            Deposit.created_at >= today_start,
        )
    )
    deposits_today = float(deposits_today_q.scalar() or 0)

    # Withdrawals Today.
    withdrawals_today_q = await db.execute(
        select(func.coalesce(func.sum(Withdrawal.amount), 0)).where(
            Withdrawal.status.in_(["approved", "completed"]),
            Withdrawal.created_at >= today_start,
        )
    )
    withdrawals_today = float(withdrawals_today_q.scalar() or 0)

    # All monetary aggregates below are normalized to USD. INR-account figures
    # (profit, commission) are STORED in INR, so a raw SUM across accounts would
    # mix currencies. We group by account currency and divide INR totals by the
    # live USD→INR rate so the broker cards are always one currency (USD).
    from packages.common.src.fx_utils import get_usd_to_account_rate
    try:
        usd_inr_rate = float(await get_usd_to_account_rate("INR"))
    except Exception:
        usd_inr_rate = 0.0

    def _sum_usd(rows) -> float:
        total = 0.0
        for currency, amt in rows:
            amt = float(amt or 0)
            if (currency or "USD").upper() == "INR" and usd_inr_rate > 0:
                total += amt / usd_inr_rate
            else:
                total += amt
        return total

    # Platform P&L (all-time, LIVE accounts only): broker wins when real
    # traders lose → negate total user profit. Demo P&L is excluded so a
    # winning streak on demo doesn't show as broker losses. We exclude demo
    # at BOTH levels — demo ACCOUNTS (is_demo) and demo USERS — because the
    # shared demo user is provisioned a non-demo "Standard" account too, so
    # filtering on account alone lets demo trades bleed into broker revenue.
    pnl_rows = (await db.execute(
        select(TradingAccount.currency, func.coalesce(func.sum(Position.profit), 0))
        .join(TradingAccount, Position.account_id == TradingAccount.id)
        .join(User, TradingAccount.user_id == User.id)
        .where(
            Position.status == PositionStatus.CLOSED.value,
            TradingAccount.is_demo == False,
            User.is_demo == False,
        )
        .group_by(TradingAccount.currency)
    )).all()
    user_pnl = _sum_usd(pnl_rows)

    commission_all_rows = (await db.execute(
        select(TradingAccount.currency, func.coalesce(func.sum(Transaction.amount), 0))
        .join(TradingAccount, Transaction.account_id == TradingAccount.id)
        .join(User, TradingAccount.user_id == User.id)
        .where(
            Transaction.type == "commission",
            TradingAccount.is_demo == False,
            User.is_demo == False,
        )
        .group_by(TradingAccount.currency)
    )).all()
    total_commission = _sum_usd(commission_all_rows)

    platform_pnl = -user_pnl + total_commission

    # Commission paid today (LIVE accounts only — demo account AND demo user excluded).
    commission_today_rows = (await db.execute(
        select(TradingAccount.currency, func.coalesce(func.sum(Transaction.amount), 0))
        .join(TradingAccount, Transaction.account_id == TradingAccount.id)
        .join(User, TradingAccount.user_id == User.id)
        .where(
            Transaction.type == "commission",
            Transaction.created_at >= today_start,
            TradingAccount.is_demo == False,
            User.is_demo == False,
        )
        .group_by(TradingAccount.currency)
    )).all()
    commission_paid = _sum_usd(commission_today_rows)

    # Pending Deposits count.
    pending_deposits_q = await db.execute(
        select(func.count(Deposit.id)).where(Deposit.status == "pending")
    )
    pending_deposits_count = pending_deposits_q.scalar() or 0

    # Open Support Tickets.
    open_tickets_q = await db.execute(
        select(func.count(SupportTicket.id)).where(
            SupportTicket.status.in_(["open", "in_progress"])
        )
    )
    open_tickets_count = open_tickets_q.scalar() or 0

    return DashboardStats(
        total_users=total_users,
        active_traders=active_traders,
        deposits_today=deposits_today,
        withdrawals_today=withdrawals_today,
        platform_pnl=platform_pnl,
        commission_paid=commission_paid,
        pending_deposits_count=pending_deposits_count,
        open_tickets_count=open_tickets_count,
    )


async def dashboard_revenue_series(days: int, db: AsyncSession) -> DashboardRevenueSeries:
    end_d: date = datetime.utcnow().date()
    start_d: date = end_d - timedelta(days=days - 1)
    cutoff = datetime.combine(start_d, datetime.min.time())

    day_bucket = func.date_trunc("day", Deposit.created_at)
    dep_rows = (
        await db.execute(
            select(day_bucket, func.coalesce(func.sum(Deposit.amount), 0))
            .where(
                Deposit.status.in_(["approved", "auto_approved"]),
                Deposit.created_at >= cutoff,
            )
            .group_by(day_bucket)
            .order_by(day_bucket)
        )
    ).all()

    w_bucket = func.date_trunc("day", Withdrawal.created_at)
    w_rows = (
        await db.execute(
            select(w_bucket, func.coalesce(func.sum(Withdrawal.amount), 0))
            .where(
                Withdrawal.status.in_(["approved", "completed"]),
                Withdrawal.created_at >= cutoff,
            )
            .group_by(w_bucket)
            .order_by(w_bucket)
        )
    ).all()

    by_day: dict[str, tuple[float, float]] = {}

    def _add_dep(row):
        bkt, total = row[0], float(row[1] or 0)
        k = bkt.date().isoformat() if hasattr(bkt, "date") else str(bkt)[:10]
        d, w = by_day.get(k, (0.0, 0.0))
        by_day[k] = (d + total, w)

    def _add_w(row):
        bkt, total = row[0], float(row[1] or 0)
        k = bkt.date().isoformat() if hasattr(bkt, "date") else str(bkt)[:10]
        d, w = by_day.get(k, (0.0, 0.0))
        by_day[k] = (d, w + total)

    for row in dep_rows:
        _add_dep(row)
    for row in w_rows:
        _add_w(row)

    points: list[DashboardRevenuePoint] = []
    cur = start_d
    while cur <= end_d:
        key = cur.isoformat()
        dep_amt, wdr_amt = by_day.get(key, (0.0, 0.0))
        points.append(
            DashboardRevenuePoint(
                date=key,
                deposits=dep_amt,
                withdrawals=wdr_amt,
                net=dep_amt - wdr_amt,
            )
        )
        cur += timedelta(days=1)

    return DashboardRevenueSeries(points=points)
