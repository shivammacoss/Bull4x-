"""IB Commission Engine — distributes trade commissions through the MLM chain.

Triggered ONLY when a trade CLOSES (not on open). The position's lots, the
trader's commission cost, and demo/live flag are passed in by the caller so
no double-payout, no demo-as-real-money, and no open/close exploit.

Per-payout logic for a single closing trade event:
1. Resolve referral → direct IB. Self-referral blocked.
2. Skip everything if demo account.
3. Load plan: direct IB's `commission_plan_id`, else default plan.
4. Compute total commission pool = per_lot * lots + per_trade flat.
5. Add spread-share component = pct * abs(trader's commission charged).
6. Walk the chain up to `min(plan.mlm_levels, len(mlm_distribution))` levels,
   skipping inactive IBs but continuing the walk, breaking on cycle.
7. Idempotent: if (ib_id, source_trade_id, commission_type, mlm_level) already
   exists, skip the insert.

CPA payouts live in cpa_engine.py (triggered on first-deposit approval, not here).
"""
import json
import logging
from decimal import Decimal, ROUND_HALF_UP
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.common.src.models import (
    Referral, IBProfile, IBCommission, IBCommissionPlan,
    TradingAccount, Transaction, SystemSetting,
)

logger = logging.getLogger("ib-engine")

DEFAULT_MLM_DISTRIBUTION = [40, 25, 15, 10, 10]
QUANTUM = Decimal("0.00000001")  # 8 decimal places — matches NUMERIC(18,8)


def _q(d: Decimal) -> Decimal:
    """Quantize to 8 decimals so we don't silently lose precision in DB writes."""
    return d.quantize(QUANTUM, rounding=ROUND_HALF_UP)


async def get_mlm_distribution(db: AsyncSession) -> list[int]:
    """Global fallback distribution from SystemSetting."""
    result = await db.execute(
        select(SystemSetting).where(SystemSetting.key == "mlm_distribution")
    )
    setting = result.scalar_one_or_none()
    if setting and setting.value:
        val = setting.value
        if isinstance(val, str):
            try:
                val = json.loads(val)
            except Exception:
                return DEFAULT_MLM_DISTRIBUTION
        if isinstance(val, list):
            return [int(x) for x in val]
    return DEFAULT_MLM_DISTRIBUTION


async def distribute_ib_commission(
    db: AsyncSession,
    *,
    trader_user_id: UUID,
    source_trade_id: UUID,
    lots: Decimal,
    instrument_symbol: str,
    is_demo: bool,
    trader_commission_charged: Decimal = Decimal("0"),
    commission_type: str = "trade_lot",
) -> None:
    """Distribute commission from a single CLOSED trade up the MLM chain.

    Args:
        trader_user_id: User who placed the trade.
        source_trade_id: UUID that identifies this trade event uniquely
            (use TradeHistory.id for partial+full closes — each row is unique).
        lots: Volume that closed in this event.
        instrument_symbol: For logging.
        is_demo: True → return immediately (no real money on demo).
        trader_commission_charged: Trader's commission cost on this trade (used
            as a proxy for platform revenue when computing spread_share_pct).
        commission_type: Tag stored on the IBCommission row + used in the
            idempotency key. Defaults to "trade_lot" for normal trade closes.
    """
    # 1) Demo trades MUST NOT pay real IB commission.
    if is_demo:
        return

    if lots is None or lots <= 0:
        return

    # 2) Find the referral. Self-referral is rejected.
    referral_q = await db.execute(
        select(Referral).where(Referral.referred_id == trader_user_id)
    )
    referral = referral_q.scalar_one_or_none()
    if not referral or not referral.ib_profile_id:
        return
    if referral.referrer_id == trader_user_id:
        logger.warning("Self-referral blocked: user %s", trader_user_id)
        return

    # 3) Direct IB profile (fetched WITHOUT is_active filter — we still want
    # to walk past an inactive direct IB to credit live uplines).
    direct_ib = (await db.execute(
        select(IBProfile).where(IBProfile.id == referral.ib_profile_id)
    )).scalar_one_or_none()
    if not direct_ib:
        return
    if direct_ib.user_id == trader_user_id:
        logger.warning("Self-referral blocked via direct IB: user %s", trader_user_id)
        return

    # 4) Resolve plan: direct IB's plan → default plan.
    plan: IBCommissionPlan | None = None
    if direct_ib.commission_plan_id:
        plan = (await db.execute(
            select(IBCommissionPlan).where(IBCommissionPlan.id == direct_ib.commission_plan_id)
        )).scalar_one_or_none()
    if not plan:
        plan = (await db.execute(
            select(IBCommissionPlan).where(IBCommissionPlan.is_default == True)
        )).scalar_one_or_none()

    # 5) Compute the base commission pool from per-lot and per-trade.
    # Custom IB override applies to BOTH per_lot and per_trade values, and
    # scales the entire pool (the override semantics: "this IB's plan").
    per_lot = Decimal("0")
    per_trade = Decimal("0")
    if direct_ib.custom_commission_per_lot is not None and direct_ib.custom_commission_per_lot > 0:
        per_lot = Decimal(direct_ib.custom_commission_per_lot)
    elif plan and plan.commission_per_lot:
        per_lot = Decimal(plan.commission_per_lot)

    if direct_ib.custom_commission_per_trade is not None and direct_ib.custom_commission_per_trade > 0:
        per_trade = Decimal(direct_ib.custom_commission_per_trade)
    elif plan and plan.commission_per_trade:
        per_trade = Decimal(plan.commission_per_trade)

    spread_share_pct = Decimal(plan.spread_share_pct) if plan and plan.spread_share_pct else Decimal("0")

    # Base from volume + flat per-trade fee
    total_commission = (per_lot * Decimal(lots)) + per_trade

    # Spread share: platform earned (commission charged to trader) × pct
    if spread_share_pct > 0 and trader_commission_charged:
        spread_revenue = abs(Decimal(trader_commission_charged))
        total_commission += spread_revenue * spread_share_pct / Decimal("100")

    total_commission = _q(total_commission)
    if total_commission <= 0:
        return

    # 6) Resolve distribution list (plan → global setting → hardcoded default)
    # and clamp by plan.mlm_levels.
    mlm_dist: list[int] | None = None
    if plan and plan.mlm_distribution:
        raw = plan.mlm_distribution
        if isinstance(raw, str):
            try:
                raw = json.loads(raw)
            except Exception:
                raw = None
        if isinstance(raw, list) and raw:
            mlm_dist = [int(x) for x in raw]
    if mlm_dist is None:
        mlm_dist = await get_mlm_distribution(db)

    max_levels = plan.mlm_levels if (plan and plan.mlm_levels and plan.mlm_levels > 0) else len(mlm_dist)
    mlm_dist = mlm_dist[:max_levels]

    # Validate sum ≤ 100; clamp last slice if it overruns (defensive — admin
    # validation is the real fix in business_service).
    running = 0
    safe_dist: list[int] = []
    for pct in mlm_dist:
        if running >= 100:
            break
        if running + pct > 100:
            safe_dist.append(100 - running)
            running = 100
        else:
            safe_dist.append(pct)
            running += pct

    # 7) Walk the chain, cycle-guarded, paying each LIVE IB their slice.
    visited: set[UUID] = set()
    current_ib = direct_ib

    for level_idx, pct in enumerate(safe_dist, start=1):
        if current_ib is None:
            break
        if current_ib.id in visited:
            logger.error(
                "IB chain cycle detected at level %d (ib=%s); stopping walk for trade %s",
                level_idx, current_ib.id, source_trade_id,
            )
            break
        visited.add(current_ib.id)

        if pct <= 0:
            current_ib = await _get_parent_ib_unfiltered(current_ib, db)
            continue

        share = _q(total_commission * Decimal(pct) / Decimal("100"))

        # Skip payout for inactive IB but continue the walk to upline.
        if not current_ib.is_active:
            logger.info(
                "Skipping inactive IB %s at L%d for trade %s — chain continues",
                current_ib.referral_code, level_idx, source_trade_id,
            )
            current_ib = await _get_parent_ib_unfiltered(current_ib, db)
            continue

        if share <= 0:
            current_ib = await _get_parent_ib_unfiltered(current_ib, db)
            continue

        # Idempotency: same (ib, trade, type, level) must not double-pay.
        existing = await db.execute(
            select(IBCommission.id).where(
                IBCommission.ib_id == current_ib.id,
                IBCommission.source_trade_id == source_trade_id,
                IBCommission.commission_type == commission_type,
                IBCommission.mlm_level == level_idx,
            )
        )
        if existing.scalar_one_or_none() is not None:
            logger.info(
                "IB commission already recorded for ib=%s trade=%s level=%d type=%s — skipping",
                current_ib.id, source_trade_id, level_idx, commission_type,
            )
            current_ib = await _get_parent_ib_unfiltered(current_ib, db)
            continue

        # Find a live, non-demo trading account to credit. Prefer USD currency
        # so we don't dump USD-denominated commission into an EUR account.
        ib_account_q = await db.execute(
            select(TradingAccount).where(
                TradingAccount.user_id == current_ib.user_id,
                TradingAccount.is_demo == False,
                TradingAccount.is_active == True,
            ).order_by(
                # Prefer USD currency, then earliest account (stable choice).
                (TradingAccount.currency != "USD").asc(),
                TradingAccount.created_at.asc(),
            ).limit(1)
        )
        ib_account = ib_account_q.scalar_one_or_none()

        if ib_account is None:
            logger.warning(
                "IB %s has no live trading account to receive L%d commission ($%.8f) "
                "on trade %s — recording as PENDING (not credited).",
                current_ib.referral_code, level_idx, float(share), source_trade_id,
            )
            db.add(IBCommission(
                ib_id=current_ib.id,
                source_user_id=trader_user_id,
                source_trade_id=source_trade_id,
                commission_type=commission_type,
                amount=share,
                mlm_level=level_idx,
                status="pending",
            ))
            current_ib.pending_payout = _q((current_ib.pending_payout or Decimal("0")) + share)
            current_ib = await _get_parent_ib_unfiltered(current_ib, db)
            continue

        # Credit the account + write transaction + commission row.
        ib_account.balance = _q((ib_account.balance or Decimal("0")) + share)
        ib_account.equity = _q(ib_account.balance + (ib_account.credit or Decimal("0")))
        ib_account.free_margin = _q(ib_account.equity - (ib_account.margin_used or Decimal("0")))

        db.add(IBCommission(
            ib_id=current_ib.id,
            source_user_id=trader_user_id,
            source_trade_id=source_trade_id,
            commission_type=commission_type,
            amount=share,
            mlm_level=level_idx,
            status="paid",
        ))
        db.add(Transaction(
            user_id=current_ib.user_id,
            account_id=ib_account.id,
            type="ib_commission",
            amount=share,
            balance_after=ib_account.balance,
            description=f"IB commission L{level_idx} [{commission_type}]: {instrument_symbol} {lots} lots",
        ))
        current_ib.total_earned = _q((current_ib.total_earned or Decimal("0")) + share)

        logger.info(
            "IB %s L%d: $%.8f credited (%s %s lots, type=%s, trade=%s)",
            current_ib.referral_code, level_idx, float(share),
            instrument_symbol, lots, commission_type, source_trade_id,
        )

        # Auto-settle any older pending commissions now that we have an account.
        if current_ib.pending_payout and current_ib.pending_payout > 0:
            try:
                result = await settle_pending_commissions(
                    db, ib_user_id=current_ib.user_id,
                    target_account_id=ib_account.id,
                )
                if result["settled"] > 0:
                    logger.info(
                        "Auto-settled %d pending commissions ($%.8f) for IB %s",
                        result["settled"], result["amount"], current_ib.referral_code,
                    )
            except Exception as e:
                logger.warning("Auto-settle failed for IB %s: %s", current_ib.referral_code, e)

        current_ib = await _get_parent_ib_unfiltered(current_ib, db)

    # Leftover (sum(safe_dist) < 100 because chain was short or had pct=0):
    # explicitly logged so reconciliation can spot it. Money stays with platform.
    distributed_pct = sum(safe_dist[:len(visited)])
    if distributed_pct < 100:
        leftover_pct = 100 - distributed_pct
        leftover_amt = _q(total_commission * Decimal(leftover_pct) / Decimal("100"))
        logger.info(
            "IB pool leftover: %d%% ($%.8f) retained by platform for trade %s",
            leftover_pct, float(leftover_amt), source_trade_id,
        )


async def settle_pending_commissions(
    db: AsyncSession,
    *,
    ib_user_id: UUID,
    target_account_id: UUID | None = None,
) -> dict:
    """Credit all pending IB commissions to a live trading account.

    If target_account_id is given, credit that specific account (must belong
    to the IB). Otherwise auto-pick the first live USD account (same logic
    as the distribution engine).

    Returns {"settled": int, "amount": float, "account_id": str}.
    """
    profile_q = await db.execute(
        select(IBProfile).where(IBProfile.user_id == ib_user_id)
    )
    profile = profile_q.scalar_one_or_none()
    if not profile:
        return {"settled": 0, "amount": 0, "account_id": None}

    if target_account_id:
        acct_q = await db.execute(
            select(TradingAccount).where(
                TradingAccount.id == target_account_id,
                TradingAccount.user_id == ib_user_id,
                TradingAccount.is_demo == False,
                TradingAccount.is_active == True,
            )
        )
        account = acct_q.scalar_one_or_none()
    else:
        acct_q = await db.execute(
            select(TradingAccount).where(
                TradingAccount.user_id == ib_user_id,
                TradingAccount.is_demo == False,
                TradingAccount.is_active == True,
            ).order_by(
                (TradingAccount.currency != "USD").asc(),
                TradingAccount.created_at.asc(),
            ).limit(1)
        )
        account = acct_q.scalar_one_or_none()

    if not account:
        return {"settled": 0, "amount": 0, "account_id": None, "error": "no_account"}

    pending_q = await db.execute(
        select(IBCommission).where(
            IBCommission.ib_id == profile.id,
            IBCommission.status == "pending",
        )
    )
    pending_rows = pending_q.scalars().all()

    if not pending_rows:
        return {"settled": 0, "amount": 0, "account_id": str(account.id)}

    total = Decimal("0")
    for comm in pending_rows:
        comm.status = "paid"
        total += Decimal(comm.amount or 0)

    total = _q(total)

    credit_amount = total
    fx_rate_used = None
    acct_cur = (account.currency or "USD")
    if acct_cur == "INR":
        from packages.common.src.fx_utils import get_usd_to_account_rate
        fx_rate_used = await get_usd_to_account_rate("INR")
        credit_amount = _q(total * fx_rate_used)

    account.balance = _q((account.balance or Decimal("0")) + credit_amount)
    account.equity = _q(account.balance + (account.credit or Decimal("0")))
    account.free_margin = _q(account.equity - (account.margin_used or Decimal("0")))

    profile.total_earned = _q((profile.total_earned or Decimal("0")) + total)
    profile.pending_payout = _q(max(Decimal("0"), (profile.pending_payout or Decimal("0")) - total))

    desc = f"IB payout: {len(pending_rows)} pending commissions settled"
    if fx_rate_used:
        desc += f" (${float(total):.2f} → ₹{float(credit_amount):.2f})"

    db.add(Transaction(
        user_id=ib_user_id,
        account_id=account.id,
        type="ib_commission",
        amount=credit_amount,
        balance_after=account.balance,
        currency=acct_cur,
        fx_rate_applied=fx_rate_used,
        converted_amount=credit_amount if fx_rate_used else None,
        description=desc,
    ))

    logger.info(
        "Settled %d pending IB commissions ($%.8f → %s %.8f) for user %s → account %s",
        len(pending_rows), float(total), acct_cur, float(credit_amount),
        ib_user_id, account.id,
    )

    return {
        "settled": len(pending_rows),
        "amount": float(credit_amount),
        "amount_usd": float(total),
        "currency": acct_cur,
        "fx_rate": float(fx_rate_used) if fx_rate_used else None,
        "account_id": str(account.id),
    }


async def _get_parent_ib_unfiltered(ib: IBProfile, db: AsyncSession) -> IBProfile | None:
    """Fetch parent regardless of is_active — caller decides whether to PAY.

    Walking past inactive IBs is intentional: we want the uplines of a
    suspended/banned IB to keep earning their share.
    """
    if not ib.parent_ib_id:
        return None
    result = await db.execute(
        select(IBProfile).where(IBProfile.id == ib.parent_ib_id)
    )
    return result.scalar_one_or_none()
