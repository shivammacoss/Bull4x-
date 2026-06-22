"""Trading Service — Reusable business logic extracted from route handlers.

Keeps route files thin by centralising price fetching, account validation,
margin calculations, and position P&L computation.
"""
import json
import logging
from decimal import Decimal, ROUND_HALF_UP
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import (
    Instrument, InstrumentConfig, Order, OrderSide, OrderStatus,
    Position, PositionStatus, TradingAccount,
)
from .redis_client import redis_client, PriceChannel

logger = logging.getLogger("trading_service")


class TradingServiceError(Exception):
    """Raised when a trading operation cannot proceed."""

    def __init__(self, detail: str, status_code: int = 400):
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


# ─── Price ────────────────────────────────────────────────────────────────

async def get_current_price(symbol: str) -> tuple[Decimal, Decimal]:
    """Fetch the latest bid/ask from Redis. Raises TradingServiceError if unavailable."""
    tick_data = await redis_client.get(PriceChannel.tick_key(symbol))
    if not tick_data:
        raise TradingServiceError(f"No price available for {symbol}")
    tick = json.loads(tick_data)
    return Decimal(str(tick["bid"])), Decimal(str(tick["ask"]))


# ─── Account ──────────────────────────────────────────────────────────────

async def validate_account(
    account_id: UUID,
    user_id: UUID,
    db: AsyncSession,
    *,
    load_group: bool = True,
) -> TradingAccount:
    """Load and validate a trading account belongs to the user and is active."""
    query = select(TradingAccount).where(
        TradingAccount.id == account_id,
        TradingAccount.user_id == user_id,
    )
    if load_group:
        query = query.options(selectinload(TradingAccount.account_group))

    result = await db.execute(query)
    account = result.scalar_one_or_none()
    if not account:
        raise TradingServiceError("Account not found", 404)
    if not account.is_active:
        raise TradingServiceError("Account is not active", 403)
    return account


# ─── Instrument ───────────────────────────────────────────────────────────

async def get_instrument(symbol: str, db: AsyncSession) -> Instrument:
    """Load an active instrument by symbol."""
    result = await db.execute(
        select(Instrument).where(
            Instrument.symbol == symbol.upper(),
            Instrument.is_active == True,
        )
    )
    instrument = result.scalar_one_or_none()
    if not instrument:
        raise TradingServiceError(f"Instrument {symbol} not found", 404)
    return instrument


async def get_instrument_config(instrument_id: UUID, db: AsyncSession) -> InstrumentConfig | None:
    """Load instrument-specific config (spread, commission, etc.)."""
    result = await db.execute(
        select(InstrumentConfig).where(InstrumentConfig.instrument_id == instrument_id)
    )
    return result.scalar_one_or_none()


# ─── Margin ───────────────────────────────────────────────────────────────

def calc_margin(
    lots: Decimal,
    price: Decimal,
    contract_size: Decimal,
    leverage: int,
    account_currency: str = "USD",
    usd_inr_rate: Decimal = Decimal("1"),
) -> Decimal:
    """Calculate required margin for a position, converted to account currency."""
    base = (lots * contract_size * price) / Decimal(str(leverage))
    if account_currency == "INR":
        return base * usd_inr_rate
    return base


def calc_free_margin(account: TradingAccount) -> Decimal:
    """Return the free margin available for new trades."""
    equity = account.balance + account.credit
    return equity - account.margin_used


async def recompute_account_margin(db: AsyncSession, account: TradingAccount) -> Decimal:
    """Authoritatively rebuild `account.margin_used` from the sum of margin for
    all currently-open positions on the account, then refresh equity + free_margin.

    Returns the new margin_used. Caller must commit.
    """
    from .fx_utils import get_usd_to_account_rate

    acct_currency = getattr(account, "currency", "USD") or "USD"
    fx_rate = await get_usd_to_account_rate(acct_currency)
    leverage = Decimal(str(account.leverage or 1)) or Decimal("1")

    rows = (await db.execute(
        select(Position, Instrument.contract_size)
        .join(Instrument, Instrument.id == Position.instrument_id, isouter=True)
        .where(
            Position.account_id == account.id,
            Position.status == "open",
        )
    )).all()

    total = Decimal("0")
    for pos, contract_size in rows:
        if pos.lots is None or pos.open_price is None:
            continue
        cs = contract_size if contract_size is not None else Decimal("100000")
        total += calc_margin(
            Decimal(pos.lots), Decimal(pos.open_price), Decimal(cs),
            int(leverage), acct_currency, fx_rate,
        )

    total = total.quantize(Decimal("0.00000001"), rounding=ROUND_HALF_UP)
    account.margin_used = total
    account.equity = (account.balance or Decimal("0")) + (account.credit or Decimal("0"))
    account.free_margin = account.equity - account.margin_used
    return total


# ─── P&L ──────────────────────────────────────────────────────────────────

def _derive_currencies(symbol: str | None) -> tuple[str | None, str | None]:
    """Derive base/quote currencies from a standard symbol like USDJPY, XAUUSD.

    Standard forex (6-char) and metals/crypto follow BASE(3)+QUOTE(3) convention.
    Returns (None, None) for indices or non-standard symbols.
    """
    if not symbol or len(symbol) < 6:
        return None, None
    return symbol[:3].upper(), symbol[3:6].upper()


def quote_to_account_pnl(
    quote_pnl: Decimal,
    base_currency: str | None,
    quote_currency: str | None,
    ref_price: Decimal,
    account_currency: str = "USD",
    symbol: str | None = None,
    usd_inr_rate: Decimal | None = None,
) -> Decimal:
    """Convert a P&L value expressed in the instrument's quote currency to
    the account currency (default USD).

    For INR accounts: first converts to USD (existing logic), then USD → INR
    using the supplied usd_inr_rate.
    """
    if quote_pnl == 0:
        return quote_pnl
    base = (base_currency or "").upper()
    quote = (quote_currency or "").upper()
    if not base or not quote:
        fb_base, fb_quote = _derive_currencies(symbol)
        base = base or (fb_base or "")
        quote = quote or (fb_quote or "")

    # Step 1: convert quote-currency P&L → USD
    usd_pnl = quote_pnl
    if quote == "USD" or not quote:
        usd_pnl = quote_pnl
    elif base == "USD":
        if ref_price and ref_price != 0:
            usd_pnl = quote_pnl / ref_price
    # Cross pair: no cross rate, use raw quote pnl as USD approximation

    # Step 2: if account is INR, convert USD → INR
    acct = (account_currency or "USD").upper()
    if acct == "INR" and usd_inr_rate:
        return usd_pnl * usd_inr_rate

    return usd_pnl


def calc_position_pnl(
    side: OrderSide,
    open_price: Decimal,
    current_price: Decimal,
    lots: Decimal,
    contract_size: Decimal,
    instrument=None,
    account_currency: str = "USD",
    usd_inr_rate: Decimal | None = None,
) -> Decimal:
    """Calculate unrealised P&L for a single position, converted to account currency."""
    if side == OrderSide.BUY:
        raw = (current_price - open_price) * lots * contract_size
    else:
        raw = (open_price - current_price) * lots * contract_size
    if instrument is None:
        return raw
    return quote_to_account_pnl(
        raw,
        getattr(instrument, "base_currency", None),
        getattr(instrument, "quote_currency", None),
        current_price,
        account_currency,
        symbol=getattr(instrument, "symbol", None),
        usd_inr_rate=usd_inr_rate,
    )


async def calc_account_equity(
    account: TradingAccount,
    db: AsyncSession,
) -> tuple[Decimal, Decimal]:
    """Return (equity, unrealised_pnl) for an account based on live prices."""
    from .fx_utils import get_usd_to_account_rate

    acct_currency = getattr(account, "currency", "USD") or "USD"
    fx_rate = await get_usd_to_account_rate(acct_currency)

    result = await db.execute(
        select(Position)
        .options(selectinload(Position.instrument))
        .where(
            Position.account_id == account.id,
            Position.status == PositionStatus.OPEN,
        )
    )
    positions = result.scalars().all()

    unrealised = Decimal("0")
    for pos in positions:
        try:
            bid, ask = await get_current_price(pos.instrument.symbol)
            price = bid if pos.side == OrderSide.BUY else ask
            unrealised += calc_position_pnl(
                pos.side, pos.open_price, price,
                pos.lots, pos.instrument.contract_size,
                instrument=pos.instrument,
                account_currency=acct_currency,
                usd_inr_rate=fx_rate,
            )
        except TradingServiceError:
            continue

    equity = account.balance + account.credit + unrealised
    return equity, unrealised
