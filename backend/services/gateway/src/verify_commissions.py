"""Read-only diagnostic: verify IB / MAM / PAMM commission distribution on REAL data.

Run in the gateway container:
    docker compose -f docker-compose.yml -f docker-compose.prod.yml \
        exec gateway python services/gateway/src/verify_commissions.py

Reports the actual state so we can see which symptom is real:
  - not distributing at all
  - wrong amount (INR credited without FX conversion)
  - stuck in 'pending'
  - only level-1 (MLM chain not walking to uplines)
Makes NO writes.
"""
import asyncio
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select, func

from packages.common.src.database import AsyncSessionLocal
from packages.common.src.models import (
    IBCommission, IBCommissionPlan, IBProfile, Referral,
    TradingAccount, TradeHistory, User,
    MasterAccount, InvestorAllocation, MAMSettlementPeriod,
)


def hdr(t):
    print("\n" + "=" * 62 + f"\n{t}\n" + "=" * 62)


async def verify_ib(db):
    hdr("IB COMMISSION")

    # --- Plan config (zero rates => nothing ever distributes) ---
    plans = (await db.execute(select(IBCommissionPlan))).scalars().all()
    print(f"Commission plans: {len(plans)}")
    for p in plans:
        star = " (DEFAULT)" if p.is_default else ""
        print(f"  · {p.name}{star}: per_lot={float(p.commission_per_lot or 0)} "
              f"per_trade={float(p.commission_per_trade or 0)} "
              f"spread%={float(p.spread_share_pct or 0)} "
              f"levels={p.mlm_levels} dist={p.mlm_distribution}")
    if not any(float(p.commission_per_lot or 0) > 0 or float(p.commission_per_trade or 0) > 0
               or float(p.spread_share_pct or 0) > 0 for p in plans):
        print("  ⚠ ALL plans have ZERO rates → IB commission can never be > 0 (nothing distributes).")

    # --- Setup ---
    n_profiles = (await db.execute(select(func.count(IBProfile.id)))).scalar() or 0
    n_active = (await db.execute(select(func.count(IBProfile.id)).where(IBProfile.is_active == True))).scalar() or 0
    n_with_parent = (await db.execute(select(func.count(IBProfile.id)).where(IBProfile.parent_ib_id.isnot(None)))).scalar() or 0
    n_referrals = (await db.execute(select(func.count(Referral.id)).where(Referral.ib_profile_id.isnot(None)))).scalar() or 0
    print(f"\nIB profiles: {n_profiles} ({n_active} active), with parent (multi-level): {n_with_parent}")
    print(f"Referrals linked to an IB: {n_referrals}")

    # --- Commission rows: totals, by status, by level ---
    n_comm = (await db.execute(select(func.count(IBCommission.id)))).scalar() or 0
    print(f"\nIBCommission rows: {n_comm}")
    if n_comm == 0 and n_referrals > 0:
        print("  ⚠ Referrals exist but ZERO commission rows → NOT distributing at all.")
    by_status = (await db.execute(
        select(IBCommission.status, func.count(IBCommission.id), func.coalesce(func.sum(IBCommission.amount), 0))
        .group_by(IBCommission.status)
    )).all()
    for st, cnt, amt in by_status:
        print(f"  status={st:10} count={cnt:5}  total=${float(amt):.4f}")

    by_level = (await db.execute(
        select(IBCommission.mlm_level, func.count(IBCommission.id))
        .group_by(IBCommission.mlm_level).order_by(IBCommission.mlm_level)
    )).all()
    print("  by MLM level: " + ", ".join(f"L{lv}={cnt}" for lv, cnt in by_level))
    if n_with_parent > 0 and by_level and all(lv == 1 for lv, _ in by_level):
        print("  ⚠ parent chains exist but ALL commissions are level-1 → upline (L2+) NOT being credited.")

    # --- Stuck pending: IB has a live account but pending_payout > 0 ---
    stuck = 0
    profs = (await db.execute(select(IBProfile).where(IBProfile.pending_payout > 0))).scalars().all()
    for pr in profs:
        acc = (await db.execute(select(TradingAccount.id).where(
            TradingAccount.user_id == pr.user_id,
            TradingAccount.is_demo == False, TradingAccount.is_active == True,
        ).limit(1))).scalar_one_or_none()
        if acc is not None:
            stuck += 1
    print(f"\nIBs with pending_payout > 0: {len(profs)}  (of those, {stuck} HAVE a live account but weren't settled)")
    if stuck > 0:
        print("  ⚠ These should have auto-settled → 'stuck in pending' confirmed.")

    # --- FX suspect: 'paid' commissions to an IB whose account is INR ---
    #   The direct-credit path does NOT convert USD→INR (settle path does),
    #   so INR-account IBs are under-credited ~83x.
    paid = (await db.execute(
        select(IBCommission.ib_id, IBCommission.amount)
        .where(IBCommission.status == "paid")
    )).all()
    inr_ib_ids = set()
    for row in (await db.execute(
        select(IBProfile.id).join(TradingAccount, TradingAccount.user_id == IBProfile.user_id)
        .where(TradingAccount.is_demo == False, TradingAccount.is_active == True,
               TradingAccount.currency == "INR")
    )).all():
        inr_ib_ids.add(row[0])
    fx_suspect = [amt for ib_id, amt in paid if ib_id in inr_ib_ids]
    if fx_suspect:
        print(f"\n⚠ FX bug suspects: {len(fx_suspect)} 'paid' commissions credited to INR-account IBs "
              f"(total ${float(sum(fx_suspect)):.2f}) — likely credited as raw USD into INR balance (~83x short).")
    else:
        print("\nNo INR-account IBs with paid commissions (FX bug not triggered on current data).")

    # --- Recent detail ---
    recent = (await db.execute(
        select(IBCommission).order_by(IBCommission.created_at.desc()).limit(10)
    )).scalars().all()
    if recent:
        print("\nRecent 10 IB commissions:")
        print(f"  {'LEVEL':5} {'TYPE':12} {'AMOUNT':>12} {'STATUS':10} {'CREATED'}")
        for c in recent:
            print(f"  L{c.mlm_level:<4} {(c.commission_type or ''):12} {float(c.amount):12.6f} "
                  f"{(c.status or ''):10} {c.created_at}")


async def verify_mam(db):
    hdr("MAM / MAMM SETTLEMENT")
    now = datetime.now(timezone.utc)

    masters = (await db.execute(
        select(MasterAccount).where(MasterAccount.master_type.in_(["mamm", "signal_provider"]))
    )).scalars().all()
    print(f"Eligible masters (mamm/signal_provider): {len(masters)}")
    for m in masters:
        print(f"  · type={m.master_type} perf%={float(m.performance_fee_pct or 0)} "
              f"admin%={float(m.admin_commission_pct or 0)} total_fee_earned=${float(m.total_fee_earned or 0):.2f} "
              f"status={m.status}")

    allocs = (await db.execute(
        select(InvestorAllocation).where(InvestorAllocation.copy_type.in_(["mam", "signal"]),
                                         InvestorAllocation.status == "active")
    )).scalars().all()
    no_period = [a for a in allocs if a.current_period_id is None]
    print(f"\nActive MAM/signal allocations: {len(allocs)}  (without a current period: {len(no_period)})")
    if no_period:
        print("  ⚠ Active allocations with NO settlement period → fees never accrue/settle for these.")

    by_status = (await db.execute(
        select(MAMSettlementPeriod.status, func.count(MAMSettlementPeriod.id))
        .group_by(MAMSettlementPeriod.status)
    )).all()
    print("Settlement periods: " + (", ".join(f"{st}={cnt}" for st, cnt in by_status) or "none"))

    overdue = (await db.execute(
        select(func.count(MAMSettlementPeriod.id)).where(
            MAMSettlementPeriod.status == "active",
            MAMSettlementPeriod.period_end <= now,
        )
    )).scalar() or 0
    print(f"OVERDUE active periods (period_end passed, still active): {overdue}")
    if overdue > 0:
        print("  ⚠ The daily settle cron isn't closing these → MAM fees not being collected.")

    tot_perf = (await db.execute(select(func.coalesce(func.sum(MAMSettlementPeriod.performance_fee_charged), 0)))).scalar() or 0
    tot_admin = (await db.execute(select(func.coalesce(func.sum(MAMSettlementPeriod.admin_fee_charged), 0)))).scalar() or 0
    print(f"Lifetime fees charged across settled periods: perf=${float(tot_perf):.2f} admin=${float(tot_admin):.2f}")


async def verify_pamm(db):
    hdr("PAMM")
    masters = (await db.execute(
        select(MasterAccount).where(MasterAccount.master_type == "pamm")
    )).scalars().all()
    print(f"PAMM masters: {len(masters)}")
    for m in masters:
        allocs = (await db.execute(
            select(func.count(InvestorAllocation.id), func.coalesce(func.sum(InvestorAllocation.allocation_amount), 0))
            .where(InvestorAllocation.master_id == m.id, InvestorAllocation.status == "active")
        )).first()
        pool_acc = await db.get(TradingAccount, m.account_id) if m.account_id else None
        pool_bal = float(pool_acc.balance) if pool_acc else 0.0
        print(f"  · master={m.id} perf%={float(m.performance_fee_pct or 0)} "
              f"investors={allocs[0]} allocated=${float(allocs[1]):.2f} pool_balance=${pool_bal:.2f} "
              f"total_fee_earned=${float(m.total_fee_earned or 0):.2f}")
    print("Note: PAMM uses a pooled model — profit stays in the pool account and is realized"
          "\n      via unit value / redemption, not a per-trade payout. Verify pool balance tracks trades.")


async def main():
    async with AsyncSessionLocal() as db:
        await verify_ib(db)
        await verify_mam(db)
        await verify_pamm(db)


if __name__ == "__main__":
    asyncio.run(main())
