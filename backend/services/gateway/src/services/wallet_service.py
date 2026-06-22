"""Wallet Service — Deposits, withdrawals, transfers, wallet summary."""
import json as _json
import logging
import uuid as uuid_lib
from pathlib import Path
from decimal import Decimal, InvalidOperation
from uuid import UUID
from datetime import datetime, timezone

import httpx
from fastapi import HTTPException, UploadFile
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.common.src.models import (
    BankAccount, BonusOffer, Deposit, FxRateConfig, Transaction, TradingAccount, User, Withdrawal,
)
from packages.common.src.notify import create_notification
from packages.common.src.config import get_settings
from packages.common.src.path_safety import PathTraversalError, safe_join_under_base
from packages.common.src.redis_client import redis_client
from . import oxapay_service

logger = logging.getLogger("wallet_service")

DEPOSIT_PROOF_EXT = {".jpg", ".jpeg", ".png", ".pdf", ".webp"}
MAX_PROOF_BYTES = 10 * 1024 * 1024

METHOD_MAP = {
    "bank": "bank_transfer",
    "bank_transfer": "bank_transfer",
    "upi": "upi",
    "qr": "qr",
    "crypto": "crypto_btc",
    "crypto_btc": "crypto_btc",
    "crypto_eth": "crypto_eth",
    "crypto_usdt": "crypto_usdt",
    "metamask": "metamask",
    "card": "bank_transfer",
    "oxapay": "oxapay",
    "manual": "manual",
}


def _wallet_upload_root() -> Path:
    raw = get_settings().WALLET_UPLOAD_ROOT.strip() or "uploads/wallet"
    p = Path(raw)
    if not p.is_absolute():
        p = Path.cwd() / p
    try:
        p.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        logger.error("Wallet upload dir not writable: %s — %s", p, e)
        raise HTTPException(
            status_code=503,
            detail="File upload is temporarily unavailable. Please contact support.",
        ) from e
    return p


async def _get_user_account_ids(user_id, db: AsyncSession) -> list[UUID]:
    result = await db.execute(
        select(TradingAccount.id).where(TradingAccount.user_id == user_id)
    )
    return [row[0] for row in result.all()]


async def _get_live_account_ids(user_id, db: AsyncSession) -> list[UUID]:
    result = await db.execute(
        select(TradingAccount.id).where(
            TradingAccount.user_id == user_id,
            TradingAccount.is_demo == False,
        )
    )
    return [row[0] for row in result.all()]


async def _get_bank_for_tier(amount: Decimal, db: AsyncSession) -> BankAccount | None:
    result = await db.execute(
        select(BankAccount).where(
            BankAccount.is_active == True,
            BankAccount.min_amount <= amount,
            BankAccount.max_amount >= amount,
        ).order_by(BankAccount.last_used_at.asc().nullsfirst(), BankAccount.rotation_order)
    )
    bank = result.scalars().first()
    if bank:
        bank.last_used_at = datetime.utcnow()
    return bank


# ─── Admin-controlled deposit / withdrawal amount bounds ────────────────
#
# Admin sets four settings via the admin Deposits page:
#   deposit_min, deposit_max, withdrawal_min, withdrawal_max
#
# Convention: a value of 0 (or unset) means "no limit on that side" — so
# the default world is "any amount allowed", matching prior behaviour.
# Validation is shared between the four wallet endpoints so the rules
# stay identical no matter which form the user submits through.

async def _validate_amount_against_limits(
    amount: Decimal, kind: str,
) -> None:
    """Raise 400 when ``amount`` falls outside the admin-configured bounds.

    ``kind`` is either 'deposit' or 'withdrawal' — picks the matching
    setting keys. Limits of 0 are treated as 'unconfigured', so the
    default install allows any positive amount.
    """
    from packages.common.src.settings_store import get_float_setting
    min_key = f"{kind}_min"
    max_key = f"{kind}_max"
    min_val = await get_float_setting(min_key, 0.0)
    max_val = await get_float_setting(max_key, 0.0)
    amt_f = float(amount)
    if min_val and min_val > 0 and amt_f < min_val:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum {kind} amount is ${min_val:,.2f}. You entered ${amt_f:,.2f}.",
        )
    if max_val and max_val > 0 and amt_f > max_val:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {kind} amount is ${max_val:,.2f}. You entered ${amt_f:,.2f}.",
        )


# ─── FX rate (USD → INR for UPI deposit/withdraw display) ───────────────

FX_CACHE_KEY = "fx:USD:INR"
FX_LAST_GOOD_KEY = "fx:USD:INR:last_good"  # serves as stale fallback when both providers fail


def _quantize_rate(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.0001"))


async def _fetch_rate_primary(url: str) -> Decimal | None:
    """fawazahmed0/currency-api shape: { date: ..., usd: { inr: 83.45, ... } }"""
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
        # Provider returns lowercase keys
        usd = data.get("usd") or {}
        raw = usd.get("inr")
        if raw is None:
            return None
        return _quantize_rate(Decimal(str(raw)))
    except Exception as e:
        logger.warning("FX primary provider failed: %s", e)
        return None


async def _fetch_rate_fallback(url: str) -> Decimal | None:
    """open.er-api.com shape: { result: 'success', rates: { INR: 83.45, ... } }"""
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
        if data.get("result") != "success":
            return None
        rates = data.get("rates") or {}
        raw = rates.get("INR")
        if raw is None:
            return None
        return _quantize_rate(Decimal(str(raw)))
    except Exception as e:
        logger.warning("FX fallback provider failed: %s", e)
        return None


async def _get_markup_percent(db: AsyncSession) -> Decimal:
    """Read configured markup for USD/INR. Defaults to 0 if row missing."""
    row = (await db.execute(
        select(FxRateConfig).where(FxRateConfig.currency_pair == "USD/INR")
    )).scalar_one_or_none()
    if not row or row.markup_percent is None:
        return Decimal("0")
    try:
        return Decimal(str(row.markup_percent))
    except InvalidOperation:
        return Decimal("0")


async def get_usd_inr_rate(db: AsyncSession) -> dict:
    """Live USD→INR rate for UPI deposit/withdraw conversion display.

    Strategy:
      1. Redis cache (TTL configured via FX_RATE_CACHE_TTL_SECONDS).
      2. Cache miss → primary provider (fawazahmed0 jsdelivr CDN, no key).
      3. Primary fail → fallback provider (open.er-api.com).
      4. Both fail → last-good Redis value with stale=true.
      5. No last-good either → 503.
    """
    settings = get_settings()
    markup = await _get_markup_percent(db)
    effective_mult = (Decimal("100") + markup) / Decimal("100")

    # 1) Cache hit
    cached = await redis_client.get(FX_CACHE_KEY)
    if cached:
        try:
            data = _json.loads(cached)
            raw_rate = _quantize_rate(Decimal(str(data["raw_rate"])))
            return {
                "from": "USD",
                "to": "INR",
                "raw_rate": str(raw_rate),
                "markup_percent": str(markup),
                "rate": str(_quantize_rate(raw_rate * effective_mult)),
                "source": data.get("source", "redis-cache"),
                "fetched_at": data.get("fetched_at"),
                "stale": False,
                "cache_ttl_seconds": settings.FX_RATE_CACHE_TTL_SECONDS,
            }
        except Exception:
            logger.exception("Corrupt FX cache value, refetching")

    # 2) Primary, then 3) fallback
    raw_rate = await _fetch_rate_primary(settings.FX_PROVIDER_URL)
    source = "fawazahmed0"
    if raw_rate is None:
        raw_rate = await _fetch_rate_fallback(settings.FX_PROVIDER_FALLBACK_URL)
        source = "open-er-api"

    if raw_rate is not None:
        fetched_at = datetime.now(timezone.utc).isoformat()
        payload = {
            "raw_rate": str(raw_rate),
            "source": source,
            "fetched_at": fetched_at,
        }
        serialized = _json.dumps(payload)
        try:
            await redis_client.set(FX_CACHE_KEY, serialized, ex=settings.FX_RATE_CACHE_TTL_SECONDS)
            # Long-lived "last good" so we have something to serve if both providers later fail.
            await redis_client.set(FX_LAST_GOOD_KEY, serialized, ex=7 * 24 * 3600)
        except Exception:
            logger.exception("Redis SET fx_rate failed (continuing without cache)")
        return {
            "from": "USD",
            "to": "INR",
            "raw_rate": str(raw_rate),
            "markup_percent": str(markup),
            "rate": str(_quantize_rate(raw_rate * effective_mult)),
            "source": source,
            "fetched_at": fetched_at,
            "stale": False,
            "cache_ttl_seconds": settings.FX_RATE_CACHE_TTL_SECONDS,
        }

    # 4) Both providers failed — serve last-good with stale=true
    last_good = await redis_client.get(FX_LAST_GOOD_KEY)
    if last_good:
        try:
            data = _json.loads(last_good)
            raw_rate = _quantize_rate(Decimal(str(data["raw_rate"])))
            return {
                "from": "USD",
                "to": "INR",
                "raw_rate": str(raw_rate),
                "markup_percent": str(markup),
                "rate": str(_quantize_rate(raw_rate * effective_mult)),
                "source": data.get("source", "stale-cache"),
                "fetched_at": data.get("fetched_at"),
                "stale": True,
                "cache_ttl_seconds": settings.FX_RATE_CACHE_TTL_SECONDS,
            }
        except Exception:
            logger.exception("Corrupt last-good FX cache value")

    # 5) No data at all
    raise HTTPException(status_code=503, detail="FX rate unavailable, please retry shortly")


# ─── Deposits ─────────────────────────────────────────────────────────────

async def create_deposit(req, user_id: UUID, db: AsyncSession) -> dict:
    from packages.common.src.settings_store import get_bool_setting
    if await get_bool_setting("maintenance_mode", False):
        raise HTTPException(status_code=503, detail="Platform is under maintenance. Deposits are temporarily disabled.")
    if not await get_bool_setting("allow_deposits", True):
        raise HTTPException(status_code=403, detail="Deposits are currently disabled")
    await _validate_amount_against_limits(req.amount, "deposit")

    if req.account_id is not None:
        acct = await db.execute(
            select(TradingAccount).where(
                TradingAccount.id == req.account_id,
                TradingAccount.user_id == user_id,
            )
        )
        account = acct.scalar_one_or_none()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

    bank = await _get_bank_for_tier(req.amount, db)
    db_method = METHOD_MAP.get(req.method, "bank_transfer")

    # For OxaPay, use 'initiated' status until payment is actually started
    # This prevents showing incomplete payment attempts in history
    settings = get_settings()
    crypto_currency = getattr(req, "crypto_currency", None)
    is_oxapay = db_method == "oxapay" and bool(settings.OXAPAY_MERCHANT_KEY)
    
    deposit = Deposit(
        user_id=user_id,
        account_id=req.account_id if req.account_id else None,
        amount=req.amount,
        method=db_method,
        transaction_id=req.transaction_id,
        screenshot_url=req.screenshot_url,
        crypto_tx_hash=getattr(req, "crypto_tx_hash", None),
        crypto_address=getattr(req, "crypto_address", None),
        bank_account_id=bank.id if bank else None,
        status="initiated" if is_oxapay else "pending",
    )
    db.add(deposit)
    await db.commit()
    await db.refresh(deposit)

    # ── OxaPay automated payment ──────────────────────────────────────
    payment_url: str | None = None
    if is_oxapay:
        try:
            ox = await oxapay_service.create_payment(
                amount=req.amount,
                crypto_currency=crypto_currency,
                order_id=str(deposit.id),
                description=f"Bull4x deposit ${float(req.amount):,.2f}",
            )
            deposit.transaction_id = ox["track_id"]
            payment_url = ox["payment_url"]
            await db.commit()
        except Exception as oxapay_err:
            logger.exception(
                "OxaPay create_payment failed for deposit %s",
                deposit.id,
            )
            # Delete the initiated deposit since payment creation failed
            await db.delete(deposit)
            await db.commit()
            raise HTTPException(
                status_code=502,
                detail=f"OxaPay payment creation failed: {str(oxapay_err)}",
            )

    try:
        await create_notification(
            db, user_id,
            title="Deposit Submitted",
            message=f"${float(req.amount):,.2f} deposit via {req.method} is pending approval",
            notif_type="deposit", action_url="/wallet",
        )
        await db.commit()
    except Exception:
        logger.exception("create_notification failed after deposit (deposit already saved) user_id=%s", user_id)
        try:
            await db.rollback()
        except Exception:
            pass

    result: dict = {"id": str(deposit.id), "status": "pending", "amount": float(deposit.amount)}
    if payment_url:
        result["payment_url"] = payment_url
    return result


async def create_manual_deposit(
    user_id: UUID,
    account_id: UUID | None,
    amount: Decimal,
    transaction_id: str,
    file: UploadFile,
    db: AsyncSession,
) -> dict:
    from packages.common.src.settings_store import get_bool_setting
    if not await get_bool_setting("allow_deposits", True):
        raise HTTPException(status_code=403, detail="Deposits are currently disabled")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
    await _validate_amount_against_limits(amount, "deposit")

    tid = (transaction_id or "").strip()
    if not tid:
        raise HTTPException(status_code=400, detail="Transaction / reference ID is required for manual deposits")

    if account_id is not None:
        acct = await db.execute(
            select(TradingAccount).where(
                TradingAccount.id == account_id,
                TradingAccount.user_id == user_id,
            )
        )
        account = acct.scalar_one_or_none()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Payment screenshot or proof file is required")
    suffix = Path(file.filename).suffix.lower()
    if suffix not in DEPOSIT_PROOF_EXT:
        raise HTTPException(status_code=400, detail="Allowed file types: JPG, PNG, PDF, WEBP")
    content = await file.read()
    if len(content) > MAX_PROOF_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB)")

    bank = await _get_bank_for_tier(amount, db)
    try:
        user_dir = safe_join_under_base(_wallet_upload_root(), "deposits", str(user_id))
    except PathTraversalError:
        raise HTTPException(status_code=400, detail="Invalid upload path")
    user_dir.mkdir(parents=True, exist_ok=True)
    safe = f"deposit_{uuid_lib.uuid4().hex}{suffix}"
    try:
        out_path = safe_join_under_base(user_dir, safe)
    except PathTraversalError:
        raise HTTPException(status_code=400, detail="Invalid file path")
    try:
        out_path.write_bytes(content)
    except OSError as e:
        logger.exception("manual deposit write failed: %s", out_path)
        raise HTTPException(status_code=503, detail="Could not save file") from e

    deposit = Deposit(
        user_id=user_id,
        account_id=account_id if account_id else None,
        amount=amount,
        method="manual",
        transaction_id=tid[:100],
        screenshot_url=str(out_path.resolve()),
        bank_account_id=bank.id if bank else None,
        status="pending",
    )
    db.add(deposit)
    await db.commit()
    await db.refresh(deposit)

    try:
        await create_notification(
            db, user_id,
            title="Deposit Submitted",
            message=f"${float(amount):,.2f} manual deposit pending approval",
            notif_type="deposit", action_url="/wallet",
        )
        await db.commit()
    except Exception:
        logger.exception("create_notification failed after manual deposit (deposit already saved) user_id=%s", user_id)
        try:
            await db.rollback()
        except Exception:
            pass

    return {"id": str(deposit.id), "status": "pending", "amount": float(deposit.amount)}


# ─── OxaPay Webhook ──────────────────────────────────────────────────────

async def handle_oxapay_webhook(
    order_id: str,
    oxapay_status: str,
    track_id: str | None,
    payload: dict,
    db: AsyncSession,
) -> None:
    """Process OxaPay webhook callback. Auto-approve on 'paid', reject on 'expired'/'failed'."""
    from uuid import UUID as UUIDType

    try:
        deposit_uuid = UUIDType(order_id)
    except ValueError:
        logger.warning("OxaPay webhook: invalid order_id=%s", order_id)
        return

    result = await db.execute(select(Deposit).where(Deposit.id == deposit_uuid))
    deposit = result.scalar_one_or_none()
    if not deposit:
        logger.warning("OxaPay webhook: deposit not found order_id=%s", order_id)
        return

    # Idempotent — skip if already processed (but allow 'initiated' to transition)
    if deposit.status not in ("initiated", "pending"):
        logger.info("OxaPay webhook: deposit %s already %s, skipping", order_id, deposit.status)
        return

    if track_id:
        deposit.transaction_id = track_id

    # Only surface the deposit once an actual payment is detected on-chain
    # ('confirming'). 'waiting' just means the invoice was created (the user may
    # have opened it and pressed Back without paying) — keep it 'initiated' so it
    # stays hidden from user + admin history until the payment really starts.
    if oxapay_status == "waiting":
        logger.info("OxaPay webhook: deposit %s waiting (invoice open, not paid) — keep hidden", order_id)
        return
    if oxapay_status == "confirming" and deposit.status == "initiated":
        deposit.status = "pending"
        await db.commit()
        logger.info("OxaPay webhook: deposit %s → pending (payment confirming)", order_id)
        return

    if oxapay_status == "paid":
        deposit.status = "auto_approved"
        deposit.approved_at = datetime.utcnow()

        user_q = await db.execute(select(User).where(User.id == deposit.user_id))
        user_row = user_q.scalar_one_or_none()
        if not user_row:
            logger.error("OxaPay webhook: user not found for deposit %s", order_id)
            return

        user_row.main_wallet_balance = (user_row.main_wallet_balance or Decimal("0")) + deposit.amount

        db.add(Transaction(
            user_id=deposit.user_id,
            account_id=None,
            type="deposit",
            amount=deposit.amount,
            balance_after=user_row.main_wallet_balance,
            reference_id=deposit.id,
            description=f"Deposit to main wallet - oxapay (auto)",
        ))

        # Apply bonus offers (mirrors admin approve_deposit logic)
        bonus_msg = ""
        now = datetime.utcnow()
        offers_q = await db.execute(
            select(BonusOffer).where(
                BonusOffer.is_active == True,
                BonusOffer.bonus_type.in_(["deposit", "welcome"]),
                BonusOffer.min_deposit <= deposit.amount,
            )
        )
        for offer in offers_q.scalars().all():
            if offer.starts_at and offer.starts_at > now:
                continue
            if offer.expires_at and offer.expires_at < now:
                continue
            if offer.percentage and offer.percentage > 0:
                bonus_amount = deposit.amount * offer.percentage / Decimal("100")
            elif offer.fixed_amount and offer.fixed_amount > 0:
                bonus_amount = offer.fixed_amount
            else:
                continue
            if offer.max_bonus and bonus_amount > offer.max_bonus:
                bonus_amount = offer.max_bonus

            user_row.main_wallet_balance = (user_row.main_wallet_balance or Decimal("0")) + bonus_amount
            db.add(Transaction(
                user_id=deposit.user_id,
                account_id=None,
                type="bonus",
                amount=bonus_amount,
                balance_after=user_row.main_wallet_balance,
                description=f"Bonus: {offer.name} ({offer.percentage or 0}%)",
            ))
            bonus_msg = f" + ${float(bonus_amount):.2f} bonus ({offer.name})"

        await create_notification(
            db, deposit.user_id,
            title="Deposit approved",
            message=f"Your deposit of ${float(deposit.amount):,.2f} was approved automatically.{bonus_msg}",
            notif_type="deposit", action_url="/wallet",
        )

        # CPA bonus to direct IB on first deposit — safe failure: must never
        # block the deposit credit.
        try:
            from packages.common.src.cpa_service import maybe_pay_cpa_on_deposit
            await maybe_pay_cpa_on_deposit(db, deposit=deposit)
        except Exception as e:
            logger.warning("CPA payout failed on oxapay auto-approve: %s", e)

    elif oxapay_status in ("expired", "failed"):
        deposit.status = "rejected"
        deposit.rejection_reason = f"OxaPay payment {oxapay_status}"
        await create_notification(
            db, deposit.user_id,
            title="Deposit not completed",
            message=f"Your ${float(deposit.amount):,.2f} crypto deposit {oxapay_status}. Please try again.",
            notif_type="deposit", action_url="/wallet",
        )

    else:
        # "waiting", "confirming" — informational only
        logger.info("OxaPay webhook: deposit %s status=%s (no action)", order_id, oxapay_status)
        return

    await db.commit()
    logger.info("OxaPay webhook: deposit %s → %s", order_id, deposit.status)


# ─── Withdrawals ──────────────────────────────────────────────────────────

async def _pending_withdrawal_total(user_id: UUID, db: AsyncSession) -> Decimal:
    """Sum of withdrawals still awaiting admin action — those funds are
    earmarked even though the balance row hasn't been debited yet."""
    q = await db.execute(
        select(func.coalesce(func.sum(Withdrawal.amount), 0)).where(
            Withdrawal.user_id == user_id,
            Withdrawal.status.in_(["pending", "processing"]),
        )
    )
    return Decimal(str(q.scalar() or 0))


async def create_withdrawal(req, user_id: UUID, db: AsyncSession) -> dict:
    from packages.common.src.settings_store import get_bool_setting
    if await get_bool_setting("maintenance_mode", False):
        raise HTTPException(status_code=503, detail="Platform is under maintenance. Withdrawals are temporarily disabled.")
    if not await get_bool_setting("allow_withdrawals", True):
        raise HTTPException(status_code=403, detail="Withdrawals are currently disabled")
    await _validate_amount_against_limits(req.amount, "withdrawal")

    user_q = await db.execute(select(User).where(User.id == user_id))
    user_row = user_q.scalar_one_or_none()
    if not user_row:
        raise HTTPException(status_code=404, detail="User not found")

    # Earmark any pending withdrawals — the balance row isn't debited until
    # admin approves, so a second submission within the same window would
    # otherwise pass this check and over-commit the user's funds.
    main_bal = user_row.main_wallet_balance or Decimal("0")
    pending = await _pending_withdrawal_total(user_id, db)
    available = main_bal - pending
    if available < req.amount:
        if pending > 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Available for withdrawal: ${float(available):.2f} "
                    f"(${float(main_bal):.2f} balance − ${float(pending):.2f} pending). "
                    "Wait for the pending withdrawal to be processed or cancel it."
                ),
            )
        raise HTTPException(
            status_code=400,
            detail=(
                f"Insufficient main wallet balance. Available: ${float(main_bal):.2f}. "
                "Transfer profit from your trading accounts to your main wallet first (Wallet page)."
            ),
        )

    withdrawal = Withdrawal(
        user_id=user_id,
        account_id=None,
        amount=req.amount,
        method=METHOD_MAP.get(req.method, "bank_transfer"),
        bank_details=getattr(req, "bank_details", None),
        crypto_address=getattr(req, "crypto_address", None),
        status="pending",
    )
    db.add(withdrawal)
    await db.commit()
    await db.refresh(withdrawal)

    await create_notification(
        db, user_id,
        title="Withdrawal Submitted",
        message=f"${float(req.amount):,.2f} withdrawal via {req.method} is pending approval",
        notif_type="withdrawal", action_url="/wallet",
    )
    await db.commit()

    return {"id": str(withdrawal.id), "status": "pending", "amount": float(withdrawal.amount)}


async def create_manual_withdrawal(
    user_id: UUID,
    amount: Decimal,
    upi_id: str,
    bank_name: str,
    file: UploadFile | None,
    db: AsyncSession,
) -> dict:
    from packages.common.src.settings_store import get_bool_setting
    if not await get_bool_setting("allow_withdrawals", True):
        raise HTTPException(status_code=403, detail="Withdrawals are currently disabled")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
    await _validate_amount_against_limits(amount, "withdrawal")

    upi = (upi_id or "").strip()
    bank = (bank_name or "").strip()
    qr_path_str: str | None = None

    if file and file.filename:
        suffix = Path(file.filename).suffix.lower()
        if suffix not in DEPOSIT_PROOF_EXT:
            raise HTTPException(status_code=400, detail="Allowed file types for QR: JPG, PNG, PDF, WEBP")
        content = await file.read()
        if len(content) > MAX_PROOF_BYTES:
            raise HTTPException(status_code=400, detail="File too large (max 10 MB)")
        try:
            user_dir = safe_join_under_base(_wallet_upload_root(), "withdrawals", str(user_id))
        except PathTraversalError:
            raise HTTPException(status_code=400, detail="Invalid upload path")
        user_dir.mkdir(parents=True, exist_ok=True)
        safe = f"payout_qr_{uuid_lib.uuid4().hex}{suffix}"
        try:
            out_path = safe_join_under_base(user_dir, safe)
        except PathTraversalError:
            raise HTTPException(status_code=400, detail="Invalid file path")
        try:
            out_path.write_bytes(content)
        except OSError as e:
            logger.exception("manual withdrawal qr write failed: %s", out_path)
            raise HTTPException(status_code=503, detail="Could not save file") from e
        qr_path_str = str(out_path.resolve())

    if not upi and not qr_path_str:
        raise HTTPException(
            status_code=400,
            detail="Provide a UPI ID and/or upload a QR code image for manual payout.",
        )

    user_q = await db.execute(select(User).where(User.id == user_id))
    user_row = user_q.scalar_one_or_none()
    if not user_row:
        raise HTTPException(status_code=404, detail="User not found")

    main_bal = user_row.main_wallet_balance or Decimal("0")
    pending = await _pending_withdrawal_total(user_id, db)
    available = main_bal - pending
    if available < amount:
        if pending > 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Available for withdrawal: ${float(available):.2f} "
                    f"(${float(main_bal):.2f} balance − ${float(pending):.2f} pending). "
                    "Wait for the pending withdrawal to be processed or cancel it."
                ),
            )
        raise HTTPException(
            status_code=400,
            detail=(
                f"Insufficient main wallet balance. Available: ${float(main_bal):.2f}. "
                "Transfer profit from trading accounts first."
            ),
        )

    bank_details: dict = {
        "manual": True,
        "upi_id": upi or None,
        "bank_name": bank or None,
        "user_payout_qr_path": qr_path_str,
    }

    withdrawal = Withdrawal(
        user_id=user_id,
        account_id=None,
        amount=amount,
        method="manual",
        bank_details=bank_details,
        status="pending",
    )
    db.add(withdrawal)
    await db.commit()
    await db.refresh(withdrawal)

    await create_notification(
        db, user_id,
        title="Withdrawal Submitted",
        message=f"${float(amount):,.2f} manual withdrawal pending approval",
        notif_type="withdrawal", action_url="/wallet",
    )
    await db.commit()

    return {"id": str(withdrawal.id), "status": "pending", "amount": float(withdrawal.amount)}


# ─── Transfers ────────────────────────────────────────────────────────────

# Tolerance for "max transfer" UX: frontend computes Max from a possibly-rounded
# float (e.g. 2833.0299 → display 2833.03). Without this clamp, the rounded
# request would marginally exceed the real Decimal balance and the user would
# be left with a sub-cent dust amount. When the gap is within this tolerance
# we drain the source to exactly zero so "Max" really means "transfer all".
TRANSFER_DRAIN_TOLERANCE = Decimal("0.02")


def _drain_or_reject(amt: Decimal, available: Decimal) -> Decimal:
    """If `amt` is within tolerance of `available`, return `available` (drain).
    Otherwise return `amt` unchanged. Caller still raises if `amt > available`
    after this clamp."""
    if amt > available and (amt - available) <= TRANSFER_DRAIN_TOLERANCE:
        return available
    return amt


async def internal_wallet_transfer(req, user_id: UUID, db: AsyncSession) -> dict:
    if req.from_account_id == req.to_account_id:
        raise HTTPException(status_code=400, detail="Choose two different accounts")

    fq = await db.execute(
        select(TradingAccount).where(
            TradingAccount.id == req.from_account_id,
            TradingAccount.user_id == user_id,
            TradingAccount.is_demo == False,
        )
    )
    from_a = fq.scalar_one_or_none()
    tq = await db.execute(
        select(TradingAccount).where(
            TradingAccount.id == req.to_account_id,
            TradingAccount.user_id == user_id,
            TradingAccount.is_demo == False,
        )
    )
    to_a = tq.scalar_one_or_none()
    if not from_a or not to_a:
        raise HTTPException(status_code=404, detail="Account not found")

    amt = Decimal(str(req.amount))
    free = (from_a.balance or Decimal("0")) - (from_a.margin_used or Decimal("0"))
    amt = _drain_or_reject(amt, free)
    if free < amt:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Insufficient available balance on the source account. "
                f"Available: ${float(free):.2f} (${float(from_a.margin_used or 0):.2f} locked in open trades)."
            ),
        )

    from_cur = (from_a.currency or "USD")
    to_cur = (to_a.currency or "USD")

    from_a.balance = (from_a.balance or Decimal("0")) - amt
    from_a.equity = from_a.balance + (from_a.credit or Decimal("0"))
    from_a.free_margin = from_a.equity - (from_a.margin_used or Decimal("0"))

    # Cross-currency conversion
    credit_amt = amt
    fx_rate_used = None
    if from_cur != to_cur:
        rate_data = await get_usd_inr_rate(db)
        rate = Decimal(str(rate_data["rate"]))
        fx_rate_used = rate
        if from_cur == "USD" and to_cur == "INR":
            credit_amt = (amt * rate).quantize(Decimal("0.01"))
        elif from_cur == "INR" and to_cur == "USD":
            credit_amt = (amt / rate).quantize(Decimal("0.01"))

    to_a.balance = (to_a.balance or Decimal("0")) + credit_amt
    to_a.equity = to_a.balance + (to_a.credit or Decimal("0"))
    to_a.free_margin = to_a.equity - (to_a.margin_used or Decimal("0"))

    from_sym = "₹" if from_cur == "INR" else "$"
    to_sym = "₹" if to_cur == "INR" else "$"
    db.add(Transaction(
        user_id=user_id, account_id=from_a.id, type="transfer",
        amount=-amt, balance_after=from_a.balance,
        currency=from_cur, fx_rate_applied=fx_rate_used, converted_amount=credit_amt if fx_rate_used else None,
        description=f"Transfer to {to_a.account_number}",
    ))
    db.add(Transaction(
        user_id=user_id, account_id=to_a.id, type="transfer",
        amount=credit_amt, balance_after=to_a.balance,
        currency=to_cur, fx_rate_applied=fx_rate_used, converted_amount=amt if fx_rate_used else None,
        description=f"Transfer from {from_a.account_number}",
    ))
    await db.commit()

    msg = "Transfer completed."
    if fx_rate_used:
        msg = f"Transfer completed. {from_sym}{float(amt):.2f} → {to_sym}{float(credit_amt):.2f} @ {float(fx_rate_used):.4f}"
    return {
        "message": msg,
        "from_balance": float(from_a.balance),
        "to_balance": float(to_a.balance),
        "fx_rate": float(fx_rate_used) if fx_rate_used else None,
    }


async def transfer_trading_to_main(req, user_id: UUID, db: AsyncSession) -> dict:
    amt = Decimal(str(req.amount))

    acc_q = await db.execute(
        select(TradingAccount).where(
            TradingAccount.id == req.from_account_id,
            TradingAccount.user_id == user_id,
            TradingAccount.is_demo == False,
        )
    )
    account = acc_q.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Trading account not found")

    free = (account.balance or Decimal("0")) - (account.margin_used or Decimal("0"))
    amt = _drain_or_reject(amt, free)
    if free < amt:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Insufficient available balance on this trading account. "
                f"Available: ${float(free):.2f} (${float(account.margin_used or 0):.2f} locked in open trades)."
            ),
        )

    user_q = await db.execute(select(User).where(User.id == user_id))
    user_row = user_q.scalar_one_or_none()
    if not user_row:
        raise HTTPException(status_code=404, detail="User not found")

    acct_cur = (account.currency or "USD")
    account.balance = (account.balance or Decimal("0")) - amt
    account.equity = account.balance + (account.credit or Decimal("0"))
    account.free_margin = account.equity - (account.margin_used or Decimal("0"))

    # Convert INR → USD for main wallet
    wallet_credit = amt
    fx_rate_used = None
    if acct_cur == "INR":
        rate_data = await get_usd_inr_rate(db)
        rate = Decimal(str(rate_data["rate"]))
        fx_rate_used = rate
        wallet_credit = (amt / rate).quantize(Decimal("0.01"))

    user_row.main_wallet_balance = (user_row.main_wallet_balance or Decimal("0")) + wallet_credit

    acct_sym = "₹" if acct_cur == "INR" else "$"
    db.add(Transaction(
        user_id=user_id, account_id=account.id, type="transfer",
        amount=-amt, balance_after=account.balance,
        currency=acct_cur, fx_rate_applied=fx_rate_used, converted_amount=wallet_credit if fx_rate_used else None,
        description="Transfer to main wallet",
    ))
    db.add(Transaction(
        user_id=user_id, account_id=None, type="transfer",
        amount=wallet_credit, balance_after=user_row.main_wallet_balance,
        currency="USD", fx_rate_applied=fx_rate_used, converted_amount=amt if fx_rate_used else None,
        description=f"From trading account {account.account_number}",
    ))
    await db.commit()

    msg = "Funds moved to main wallet."
    if fx_rate_used:
        msg = f"Funds moved to main wallet. {acct_sym}{float(amt):.2f} → ${float(wallet_credit):.2f} @ {float(fx_rate_used):.4f}"
    return {
        "message": msg,
        "main_wallet_balance": float(user_row.main_wallet_balance),
        "trading_balance": float(account.balance),
        "fx_rate": float(fx_rate_used) if fx_rate_used else None,
    }


async def transfer_main_to_trading(req, user_id: UUID, db: AsyncSession) -> dict:
    amt = Decimal(str(req.amount))

    user_q = await db.execute(select(User).where(User.id == user_id))
    user_row = user_q.scalar_one_or_none()
    if not user_row:
        raise HTTPException(status_code=404, detail="User not found")

    main_bal = user_row.main_wallet_balance or Decimal("0")
    amt = _drain_or_reject(amt, main_bal)
    if main_bal < amt:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient main wallet balance. Available: ${float(main_bal):.2f}",
        )

    acc_q = await db.execute(
        select(TradingAccount).where(
            TradingAccount.id == req.to_account_id,
            TradingAccount.user_id == user_id,
            TradingAccount.is_demo == False,
        )
    )
    account = acc_q.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Trading account not found")

    acct_cur = (account.currency or "USD")

    # Convert USD → INR for INR accounts
    acct_credit = amt
    fx_rate_used = None
    if acct_cur == "INR":
        rate_data = await get_usd_inr_rate(db)
        rate = Decimal(str(rate_data["rate"]))
        fx_rate_used = rate
        acct_credit = (amt * rate).quantize(Decimal("0.01"))

    user_row.main_wallet_balance = main_bal - amt
    account.balance = (account.balance or Decimal("0")) + acct_credit
    account.equity = account.balance + (account.credit or Decimal("0"))
    account.free_margin = account.equity - (account.margin_used or Decimal("0"))

    acct_sym = "₹" if acct_cur == "INR" else "$"
    db.add(Transaction(
        user_id=user_id, account_id=None, type="transfer",
        amount=-amt, balance_after=user_row.main_wallet_balance,
        currency="USD", fx_rate_applied=fx_rate_used, converted_amount=acct_credit if fx_rate_used else None,
        description=f"To trading account {account.account_number}",
    ))
    db.add(Transaction(
        user_id=user_id, account_id=account.id, type="transfer",
        amount=acct_credit, balance_after=account.balance,
        currency=acct_cur, fx_rate_applied=fx_rate_used, converted_amount=amt if fx_rate_used else None,
        description="Transfer from main wallet",
    ))
    await db.commit()

    msg = "Funds moved to trading account."
    if fx_rate_used:
        msg = f"Funds moved to trading account. ${float(amt):.2f} → {acct_sym}{float(acct_credit):.2f} @ {float(fx_rate_used):.4f}"
    return {
        "message": msg,
        "main_wallet_balance": float(user_row.main_wallet_balance),
        "trading_balance": float(account.balance),
        "currency": acct_cur,
        "fx_rate": float(fx_rate_used) if fx_rate_used else None,
    }


# ─── Queries ──────────────────────────────────────────────────────────────

async def list_deposits(user_id: UUID, db: AsyncSession) -> dict:
    # Exclude 'initiated' deposits (OxaPay payments that were never started)
    query = (
        select(Deposit)
        .where(
            Deposit.user_id == user_id,
            Deposit.status != "initiated"
        )
        .order_by(Deposit.created_at.desc())
    )
    result = await db.execute(query)
    deposits = result.scalars().all()
    return {
        "items": [
            {
                "id": str(d.id),
                "created_at": d.created_at.isoformat() if d.created_at else None,
                "type": "deposit",
                "method": d.method or "bank",
                "amount": float(d.amount or 0),
                "status": d.status or "pending",
                "currency": "USD",
            }
            for d in deposits
        ]
    }


async def list_withdrawals(user_id: UUID, db: AsyncSession) -> dict:
    query = (
        select(Withdrawal)
        .where(Withdrawal.user_id == user_id)
        .order_by(Withdrawal.created_at.desc())
    )
    result = await db.execute(query)
    withdrawals = result.scalars().all()
    return {
        "items": [
            {
                "id": str(w.id),
                "created_at": w.created_at.isoformat() if w.created_at else None,
                "type": "withdrawal",
                "method": w.method or "bank",
                "amount": float(w.amount or 0),
                "status": w.status or "pending",
                "currency": "USD",
            }
            for w in withdrawals
        ]
    }


def _ledger_entry_method(txn_type: str | None) -> str:
    t = (txn_type or "").lower()
    if t == "transfer":
        return "Internal transfer"
    if t in ("adjustment", "credit"):
        return "Admin adjustment"
    if t == "profit":
        return "Trading — profit"
    if t == "loss":
        return "Trading — loss"
    return t.replace("_", " ").title() if t else "Ledger"


async def list_transactions(user_id: UUID, account_id: UUID | None, db: AsyncSession) -> dict:
    if account_id:
        # Explicit account scope — user can view any of their own accounts
        # (live or demo). Demo transactions are visible inside the demo
        # account's own ledger, not anywhere else.
        acct = await db.execute(
            select(TradingAccount).where(
                TradingAccount.id == account_id,
                TradingAccount.user_id == user_id,
            )
        )
        if not acct.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Account not found")
        query = select(Transaction).where(Transaction.account_id == account_id)
    else:
        # Aggregated "all accounts" view → demo activity must NOT appear.
        # User sees only live trading + wallet (main-wallet, no account_id)
        # transactions. Demo trades, swaps, and commissions stay siloed.
        live_account_ids_subq = (
            select(TradingAccount.id).where(
                TradingAccount.user_id == user_id,
                TradingAccount.is_demo == False,
            )
        ).subquery()
        query = select(Transaction).where(
            Transaction.user_id == user_id,
            (Transaction.account_id.is_(None))
            | (Transaction.account_id.in_(select(live_account_ids_subq))),
        )

    query = query.order_by(Transaction.created_at.desc()).limit(500)
    result = await db.execute(query)
    txns = result.scalars().all()

    return {
        "items": [
            {
                "id": str(t.id),
                "created_at": t.created_at.isoformat() if t.created_at else None,
                "type": t.type or "adjustment",
                "method": _ledger_entry_method(t.type),
                "amount": float(t.amount or 0),
                "status": "completed",
                # Use the stored per-row currency — transfers/trades on an INR
                # account are recorded in INR; hardcoding USD made the UI show
                # "$" for ₹ amounts.
                "currency": t.currency or "USD",
                "description": (t.description or "").strip(),
                "account_id": str(t.account_id) if t.account_id else None,
            }
            for t in txns
        ]
    }


async def wallet_summary(user_id: UUID, account_id: UUID | None, db: AsyncSession) -> dict:
    user_q = await db.execute(select(User).where(User.id == user_id))
    user_row = user_q.scalar_one_or_none()
    main_wallet_balance = float(user_row.main_wallet_balance or 0) if user_row else 0.0

    # Pending counts let the UI render "Available: $X (− $Y pending)" so users
    # don't try to over-withdraw and don't expect a pending deposit to credit
    # their balance immediately.
    pending_wd_q = await db.execute(
        select(func.coalesce(func.sum(Withdrawal.amount), 0)).where(
            Withdrawal.user_id == user_id,
            Withdrawal.status.in_(["pending", "processing"]),
        )
    )
    pending_withdrawals = float(pending_wd_q.scalar() or 0)

    pending_dep_q = await db.execute(
        select(func.coalesce(func.sum(Deposit.amount), 0)).where(
            Deposit.user_id == user_id,
            Deposit.status.in_(["pending", "initiated"]),
        )
    )
    pending_deposits = float(pending_dep_q.scalar() or 0)
    available_for_withdrawal = max(0.0, main_wallet_balance - pending_withdrawals)

    dep_glob = await db.execute(
        select(func.coalesce(func.sum(Deposit.amount), 0)).where(
            Deposit.user_id == user_id,
            Deposit.status.in_(["approved", "auto_approved"]),
        )
    )
    total_deposited = float(dep_glob.scalar() or 0)

    wd_glob = await db.execute(
        select(func.coalesce(func.sum(Withdrawal.amount), 0)).where(
            Withdrawal.user_id == user_id,
            Withdrawal.status.in_(["approved", "completed"]),
        )
    )
    total_withdrawn = float(wd_glob.scalar() or 0)

    adj_main_in = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.account_id.is_(None),
            Transaction.type.in_(["adjustment", "credit"]),
            Transaction.amount > 0,
        )
    )
    adj_main_out = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.account_id.is_(None),
            Transaction.type.in_(["adjustment", "credit"]),
            Transaction.amount < 0,
        )
    )
    total_deposited += float(adj_main_in.scalar() or 0)
    total_withdrawn += abs(float(adj_main_out.scalar() or 0))

    acct_q = await db.execute(
        select(TradingAccount)
        .where(
            TradingAccount.user_id == user_id,
            TradingAccount.is_demo == False,
            TradingAccount.is_active == True,
        )
        .order_by(TradingAccount.created_at)
    )
    live_list = list(acct_q.scalars().all())

    live_accounts_payload = [
        {
            "id": str(a.id),
            "account_number": a.account_number,
            "balance": float(a.balance or 0),
            "credit": float(a.credit or 0),
            "margin_used": float(a.margin_used or 0),
            "currency": a.currency or "USD",
            "free_margin": float(
                (a.balance or Decimal("0")) + (a.credit or Decimal("0")) - (a.margin_used or Decimal("0"))
            ),
        }
        for a in live_list
    ]
    total_live_balance = sum(float(a.balance or 0) for a in live_list)

    if not live_list:
        return {
            "main_wallet_balance": main_wallet_balance,
            "available_for_withdrawal": available_for_withdrawal,
            "pending_withdrawals": pending_withdrawals,
            "pending_deposits": pending_deposits,
            "balance": 0, "credit": 0, "equity": 0, "margin_used": 0, "free_margin": 0,
            "total_deposited": total_deposited, "total_withdrawn": total_withdrawn,
            "total_live_balance": 0, "live_accounts": [],
        }

    if account_id is not None:
        account = next((a for a in live_list if a.id == account_id), None)
        if not account:
            raise HTTPException(status_code=404, detail="Live account not found")
        accounts_for_metrics = [account]
    else:
        accounts_for_metrics = live_list

    total_credit = Decimal("0")
    total_equity = Decimal("0")
    total_margin = Decimal("0")
    total_free = Decimal("0")

    for acc in accounts_for_metrics:
        total_credit += acc.credit or Decimal("0")
        total_equity += acc.equity or acc.balance or Decimal("0")
        total_margin += acc.margin_used or Decimal("0")
        bal = acc.balance or Decimal("0")
        cr = acc.credit or Decimal("0")
        mu = acc.margin_used or Decimal("0")
        total_free += bal + cr - mu

    primary_balance = float(account.balance or 0) if account_id is not None else total_live_balance

    return {
        "main_wallet_balance": main_wallet_balance,
        "available_for_withdrawal": available_for_withdrawal,
        "pending_withdrawals": pending_withdrawals,
        "pending_deposits": pending_deposits,
        "balance": primary_balance,
        "credit": float(total_credit),
        "equity": float(total_equity),
        "margin_used": float(total_margin),
        "free_margin": float(total_free),
        "total_deposited": total_deposited,
        "total_withdrawn": total_withdrawn,
        "total_live_balance": total_live_balance,
        "live_accounts": live_accounts_payload,
    }


async def get_deposit_bank_details(amount: Decimal | None, db: AsyncSession) -> dict:
    bank = None
    if amount is not None and amount > 0:
        bank = await _get_bank_for_tier(amount, db)
        await db.commit()
    if bank is None:
        result = await db.execute(
            select(BankAccount)
            .where(BankAccount.is_active == True)
            .order_by(BankAccount.rotation_order)
            .limit(1)
        )
        bank = result.scalars().first()
    if not bank:
        return {}

    resp: dict = {}
    if bank.bank_name:
        resp["bank_name"] = bank.bank_name
    if bank.account_name:
        resp["account_holder"] = bank.account_name
    if bank.account_number:
        resp["account_number"] = bank.account_number
    if bank.ifsc_code:
        resp["ifsc_code"] = bank.ifsc_code
    if bank.upi_id:
        resp["upi_id"] = bank.upi_id
    if bank.qr_code_url:
        resp["qr_code_url"] = bank.qr_code_url
    return resp


async def get_bank_info(amount: Decimal, db: AsyncSession) -> dict:
    bank = await _get_bank_for_tier(amount, db)
    if not bank:
        raise HTTPException(status_code=404, detail="No bank account available for this amount")
    await db.commit()
    return {
        "bank_name": bank.bank_name,
        "account_name": bank.account_name,
        "account_number": bank.account_number,
        "ifsc_code": bank.ifsc_code,
        "upi_id": bank.upi_id,
        "qr_code_url": bank.qr_code_url,
    }
