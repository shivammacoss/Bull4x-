"""CPA (Cost-Per-Acquisition) Engine — fires when a referred trader's FIRST
deposit is approved. Pays a flat `cpa_per_deposit` to the direct IB only
(CPA is an acquisition incentive — diluting it across the MLM chain
destroys the incentive structure, so it is L1-only by design).

Idempotency: keyed on (ib_id, source_trade_id=deposit_id, commission_type='cpa').
"""
from __future__ import annotations

import logging
from decimal import Decimal, ROUND_HALF_UP
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from packages.common.src.models import (
    Deposit, Referral, IBProfile, IBCommission, IBCommissionPlan,
    TradingAccount, Transaction,
)

logger = logging.getLogger("cpa-engine")

QUANTUM = Decimal("0.00000001")


def _q(d: Decimal) -> Decimal:
    return d.quantize(QUANTUM, rounding=ROUND_HALF_UP)


async def maybe_pay_cpa_on_deposit(
    db: AsyncSession,
    *,
    deposit: Deposit,
) -> None:
    """If `deposit` is the trader's first successful deposit AND they were
    referred AND the IB's plan has cpa_per_deposit > 0, credit the direct IB.

    Caller must invoke AFTER marking the deposit `approved`/`auto_approved`
    so the COUNT query sees it. The function is idempotent across retries.
    """
    if deposit is None or deposit.status not in ("approved", "auto_approved"):
        return
    if not deposit.user_id or not deposit.amount or deposit.amount <= 0:
        return

    # 1) Was this user referred by an IB?
    referral = (await db.execute(
        select(Referral).where(Referral.referred_id == deposit.user_id)
    )).scalar_one_or_none()
    if not referral or not referral.ib_profile_id:
        return
    if referral.referrer_id == deposit.user_id:
        logger.warning("CPA blocked (self-referral) for user %s", deposit.user_id)
        return

    # 2) Direct IB profile (must be active to receive CPA).
    direct_ib = (await db.execute(
        select(IBProfile).where(
            IBProfile.id == referral.ib_profile_id,
            IBProfile.is_active == True,
        )
    )).scalar_one_or_none()
    if not direct_ib:
        return
    if direct_ib.user_id == deposit.user_id:
        logger.warning("CPA blocked (IB == trader) for user %s", deposit.user_id)
        return

    # 3) FIRST deposit only — count prior approved/auto_approved deposits.
    # We exclude THIS deposit from the count so an idempotent re-run of the
    # approve handler still treats it as the first.
    prior_count = (await db.execute(
        select(func.count(Deposit.id)).where(
            Deposit.user_id == deposit.user_id,
            Deposit.status.in_(("approved", "auto_approved")),
            Deposit.id != deposit.id,
            Deposit.approved_at < deposit.approved_at if deposit.approved_at else True,
        )
    )).scalar() or 0
    if prior_count > 0:
        return  # Not the first → no CPA.

    # 4) Resolve plan: direct IB's plan → default. Skip if cpa_per_deposit ≤ 0.
    plan: IBCommissionPlan | None = None
    if direct_ib.commission_plan_id:
        plan = (await db.execute(
            select(IBCommissionPlan).where(IBCommissionPlan.id == direct_ib.commission_plan_id)
        )).scalar_one_or_none()
    if not plan:
        plan = (await db.execute(
            select(IBCommissionPlan).where(IBCommissionPlan.is_default == True)
        )).scalar_one_or_none()
    if not plan or not plan.cpa_per_deposit or plan.cpa_per_deposit <= 0:
        return

    cpa = _q(Decimal(plan.cpa_per_deposit))

    # 5) Idempotency: never double-pay CPA for the same deposit.
    existing = (await db.execute(
        select(IBCommission.id).where(
            IBCommission.ib_id == direct_ib.id,
            IBCommission.source_trade_id == deposit.id,
            IBCommission.commission_type == "cpa",
        )
    )).scalar_one_or_none()
    if existing is not None:
        return

    # 6) Credit the IB's live, non-demo account (USD preferred). If none
    # exists, record as pending and bump pending_payout — admin can settle.
    ib_account = (await db.execute(
        select(TradingAccount).where(
            TradingAccount.user_id == direct_ib.user_id,
            TradingAccount.is_demo == False,
            TradingAccount.is_active == True,
        ).order_by(
            (TradingAccount.currency != "USD").asc(),
            TradingAccount.created_at.asc(),
        ).limit(1)
    )).scalar_one_or_none()

    if ib_account is None:
        db.add(IBCommission(
            ib_id=direct_ib.id,
            source_user_id=deposit.user_id,
            source_trade_id=deposit.id,
            commission_type="cpa",
            amount=cpa,
            mlm_level=1,
            status="pending",
        ))
        direct_ib.pending_payout = _q((direct_ib.pending_payout or Decimal("0")) + cpa)
        logger.warning(
            "CPA $%.8f to IB %s recorded as PENDING — no live account on file",
            float(cpa), direct_ib.referral_code,
        )
        return

    ib_account.balance = _q((ib_account.balance or Decimal("0")) + cpa)
    ib_account.equity = _q(ib_account.balance + (ib_account.credit or Decimal("0")))
    ib_account.free_margin = _q(ib_account.equity - (ib_account.margin_used or Decimal("0")))

    db.add(IBCommission(
        ib_id=direct_ib.id,
        source_user_id=deposit.user_id,
        source_trade_id=deposit.id,
        commission_type="cpa",
        amount=cpa,
        mlm_level=1,
        status="paid",
    ))
    db.add(Transaction(
        user_id=direct_ib.user_id,
        account_id=ib_account.id,
        type="ib_commission",
        amount=cpa,
        balance_after=ib_account.balance,
        description=f"CPA bonus: first deposit by referred user",
    ))
    direct_ib.total_earned = _q((direct_ib.total_earned or Decimal("0")) + cpa)

    logger.info(
        "CPA $%.8f credited to IB %s for first deposit by %s",
        float(cpa), direct_ib.referral_code, deposit.user_id,
    )
