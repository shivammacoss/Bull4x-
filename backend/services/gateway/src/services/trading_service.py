"""Trading Service — Order placement, position management, margin calculations."""
import asyncio
import json
import logging
import time as _time
from decimal import Decimal
from uuid import UUID
from datetime import datetime

from fastapi import HTTPException, Request
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from packages.common.src.models import (
    Order, OrderType, OrderSide, OrderStatus, Position, PositionStatus,
    TradingAccount, Instrument, InstrumentConfig,
    TradeHistory, Transaction, CopyTrade, UserAuditLog, User, MasterAccount,
)
from packages.common.src.instrument_pricing import resolve_commission, compute_spread_revenue
from packages.common.src.database import AsyncSessionLocal
from packages.common.src.redis_client import redis_client, PriceChannel
from packages.common.src.kafka_client import produce_event, KafkaTopics
from packages.common.src.notify import create_notification
from packages.common.src.market_hours import is_market_open
from packages.common.src import corecen_trade_client
from packages.common.src.config import get_settings

logger = logging.getLogger("trading_service")

# ─── LP connectivity guard ────────────────────────────────────────────────
# Same Redis key and freshness window used by admin book_service.get_lp_status().
LP_HEARTBEAT_KEY = "lp:last_batch_at"
LP_FRESH_WINDOW_MS = 10_000  # 10 seconds


async def apply_position_pnl(
    db: AsyncSession,
    account: "TradingAccount",
    user_id: UUID,
    profit: Decimal,
) -> Decimal:
    """Route closed-position P&L to the correct destination.

    MAM / signal-provider master pool accounts route POSITIVE P&L to the
    master's main_wallet_balance (withdrawable); losses always reduce the
    trading account so drawdown is absorbed where the trading happens.
    PAMM pools are excluded — the trading account holds investors' pooled
    capital, so profits there belong to the pool and must stay on the
    trading account for the eventual investor distribution.
    Regular (non-master) accounts: unchanged.

    Returns the balance_after value (wallet or trading account, whichever
    was updated) for Transaction logging.
    """
    master_q = await db.execute(
        select(MasterAccount).where(
            MasterAccount.account_id == account.id,
            MasterAccount.status == "approved",
            MasterAccount.master_type.in_(["mamm", "signal_provider"]),
        )
    )
    is_master_pool = master_q.scalar_one_or_none() is not None

    if is_master_pool and profit > 0:
        user = await db.get(User, user_id)
        if user is not None:
            user.main_wallet_balance = (
                user.main_wallet_balance or Decimal("0")
            ) + profit
            return user.main_wallet_balance

    account.balance = (account.balance or Decimal("0")) + profit
    return account.balance


async def _is_lp_connected() -> bool:
    """Return True if Corecen LP is actively pushing price data."""
    settings = get_settings()
    if not getattr(settings, "CORECEN_LP_ENABLED", False):
        return False
    try:
        raw = await redis_client.get(LP_HEARTBEAT_KEY)
        if raw is None:
            return False
        age_ms = int(_time.time() * 1000) - int(raw)
        return age_ms <= LP_FRESH_WINDOW_MS
    except Exception:
        return False


async def _require_lp_for_abook(user_id: UUID, account: "TradingAccount", db: AsyncSession):
    """No-op. LP routing is disabled — all trades execute on the internal
    b-book engine regardless of users.book_type. The book_type column is
    kept only for admin classification / reporting UI; it has no effect on
    order placement, modification, or close. Re-enable by restoring the
    original LP-connected check + raising 503 on disconnect.
    """
    return


# ─── Shared helpers ───────────────────────────────────────────────────────

async def get_current_price(symbol: str) -> tuple[Decimal, Decimal]:
    tick_data = await redis_client.get(PriceChannel.tick_key(symbol))
    if not tick_data:
        raise HTTPException(status_code=400, detail=f"No price available for {symbol}")
    tick = json.loads(tick_data)
    return Decimal(str(tick["bid"])), Decimal(str(tick["ask"]))


async def validate_account(account_id: UUID, user_id: UUID, db: AsyncSession, allow_inactive: bool = False) -> TradingAccount:
    result = await db.execute(
        select(TradingAccount)
        .options(selectinload(TradingAccount.account_group))
        .where(
            TradingAccount.id == account_id,
            TradingAccount.user_id == user_id,
        )
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    # Inactive (suspended) accounts can still close positions — emergency
    # exits during margin calls or admin holds must always be allowed.
    # Only OPENING new orders blocks on is_active=false.
    if not account.is_active and not allow_inactive:
        raise HTTPException(status_code=403, detail="Account is not active")
    return account


async def get_instrument(symbol: str, db: AsyncSession) -> Instrument:
    result = await db.execute(
        select(Instrument).where(Instrument.symbol == symbol.upper(), Instrument.is_active == True)
    )
    instrument = result.scalar_one_or_none()
    if not instrument:
        raise HTTPException(status_code=404, detail=f"Instrument {symbol} not found")
    return instrument


def calc_margin(lots: Decimal, price: Decimal, contract_size: Decimal, leverage: int) -> Decimal:
    return (lots * contract_size * price) / Decimal(str(leverage))


def side_val(side) -> str:
    return side.value if hasattr(side, 'value') else str(side)


# Re-export the shared recompute helper so existing imports
# `from ..services.trading_service import recompute_account_margin` keep working.
from packages.common.src.trading_service import recompute_account_margin  # noqa: F401


from packages.common.src.trading_service import quote_to_account_pnl


def calc_pnl(
    side,
    open_price: Decimal,
    close_price: Decimal,
    lots: Decimal,
    contract_size: Decimal,
    instrument=None,
    account_currency: str = "USD",
    usd_inr_rate: Decimal | None = None,
) -> Decimal:
    sv = side_val(side)
    if sv == "buy":
        raw = (close_price - open_price) * lots * contract_size
    else:
        raw = (open_price - close_price) * lots * contract_size
    if instrument is None:
        return raw
    return quote_to_account_pnl(
        raw,
        getattr(instrument, "base_currency", None),
        getattr(instrument, "quote_currency", None),
        close_price,
        account_currency,
        symbol=getattr(instrument, "symbol", None),
        usd_inr_rate=usd_inr_rate,
    )


async def fire_event(topic, key, data):
    try:
        await asyncio.wait_for(produce_event(topic, key, data), timeout=1.0)
    except Exception:
        pass


# ─── Orders ───────────────────────────────────────────────────────────────

async def place_order(
    req,
    request: Request,
    user_id: UUID,
    ip_address: str | None,
    db: AsyncSession,
) -> dict:
    from packages.common.src.settings_store import get_bool_setting, get_int_setting, get_float_setting

    # --- Parallel: settings from Redis (no DB session needed) ---
    # Global platform caps sit on top of per-instrument limits (InstrumentConfig).
    maintenance, max_trades, max_pending, global_max_lot, global_min_lot = await asyncio.gather(
        get_bool_setting("maintenance_mode", False),
        get_int_setting("max_open_trades", 200),
        get_int_setting("max_pending_orders", 100),
        get_float_setting("max_lot_size", 100.0),
        get_float_setting("min_lot_size", 0.01),
    )
    if maintenance:
        raise HTTPException(status_code=503, detail="Platform is under maintenance. Trading is temporarily disabled.")

    # --- Sequential DB queries (AsyncSession doesn't support concurrent queries) ---
    account = await validate_account(req.account_id, user_id, db)

    if not account.is_demo and account.account_group:
        min_bal = account.account_group.minimum_deposit or Decimal("0")
        # Admin-granted credit counts as tradable funds toward the minimum.
        tradable = (account.balance or Decimal("0")) + (account.credit or Decimal("0"))
        if min_bal > 0 and tradable < min_bal:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Account funds must be at least ${float(min_bal):.2f} for this account type "
                    "before you can trade. Please deposit funds."
                ),
            )

    # ── A-Book safety: block trade when LP is disconnected ──────────────
    await _require_lp_for_abook(user_id, account, db)

    instrument = await get_instrument(req.symbol, db)

    open_count_q = await db.execute(
        select(func.count(Position.id)).where(
            Position.account_id == account.id,
            Position.status == "open",
        )
    )
    if (open_count_q.scalar() or 0) >= max_trades:
        raise HTTPException(status_code=400, detail=f"Maximum open trades ({max_trades}) reached")

    # Global pending-order cap (in addition to open-trade cap above).
    if req.order_type != "market":
        pending_count_q = await db.execute(
            select(func.count(Order.id)).where(
                Order.account_id == account.id,
                Order.status == "pending",
            )
        )
        if (pending_count_q.scalar() or 0) >= max_pending:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum pending orders ({max_pending}) reached",
            )

    # Global lot-size caps (platform-wide floor/ceiling on top of per-instrument limits).
    lots_f = float(req.lots)
    if lots_f > global_max_lot:
        raise HTTPException(
            status_code=400,
            detail=f"Lot size exceeds platform maximum ({global_max_lot})",
        )
    if lots_f < global_min_lot:
        raise HTTPException(
            status_code=400,
            detail=f"Lot size below platform minimum ({global_min_lot})",
        )

    if req.order_type == "market":
        segment_name = instrument.segment.name if instrument.segment else ""
        market_open, closed_reason = is_market_open(
            instrument.symbol, segment_name, instrument.trading_hours
        )
        if not market_open:
            raise HTTPException(
                status_code=400,
                detail=closed_reason or f"Market is closed for {instrument.symbol}. "
                       "You can still place pending (limit/stop) orders.",
            )

    ic_row = await db.execute(
        select(InstrumentConfig).where(InstrumentConfig.instrument_id == instrument.id)
    )
    ic = ic_row.scalar_one_or_none()
    min_lot = ic.min_lot_size if ic and ic.min_lot_size is not None else instrument.min_lot
    max_lot = ic.max_lot_size if ic and ic.max_lot_size is not None else instrument.max_lot
    if ic and ic.is_enabled is False:
        raise HTTPException(status_code=400, detail=f"Trading disabled for {instrument.symbol}")

    if req.lots < min_lot or req.lots > max_lot:
        raise HTTPException(status_code=400, detail=f"Lot size must be between {min_lot} and {max_lot}")

    bid, ask = await get_current_price(instrument.symbol)

    order = Order(
        account_id=account.id,
        instrument_id=instrument.id,
        order_type=req.order_type,
        side=req.side,
        lots=req.lots,
        price=req.price,
        stop_loss=req.stop_loss,
        take_profit=req.take_profit,
        stop_limit_price=getattr(req, 'stop_limit_price', None),
        comment=req.comment,
        magic_number=getattr(req, 'magic_number', None),
    )

    if req.order_type == "market":
        fill_price = ask if req.side == "buy" else bid

        if req.stop_loss:
            if req.side == "buy" and req.stop_loss >= fill_price:
                raise HTTPException(status_code=400, detail="BUY SL must be below entry price")
            if req.side == "sell" and req.stop_loss <= fill_price:
                raise HTTPException(status_code=400, detail="SELL SL must be above entry price")
        if req.take_profit:
            if req.side == "buy" and req.take_profit <= fill_price:
                raise HTTPException(status_code=400, detail="BUY TP must be above entry price")
            if req.side == "sell" and req.take_profit >= fill_price:
                raise HTTPException(status_code=400, detail="SELL TP must be below entry price")

        # Account-currency FX rate (1 for USD, live USD→INR for INR accounts).
        # Used to charge commission + margin in the account's own currency so an
        # INR account's INR balance isn't debited a raw USD figure.
        from packages.common.src.fx_utils import get_usd_to_account_rate
        acct_currency = (account.currency or "USD")
        fx_rate = await get_usd_to_account_rate(acct_currency)

        commission = await resolve_commission(db, instrument, req.lots, fill_price, user_id=user_id)
        # resolve_commission returns the admin-set charge in USD. For an INR
        # account convert it to INR so it's deducted from (and stored against)
        # the INR balance correctly — like P&L, commission is held in account
        # currency. IB distribution converts it back to USD at close time.
        if acct_currency == "INR":
            commission = (commission * fx_rate).quantize(Decimal("0.01"))
        # Capture the broker's spread pickup at the fill price — frozen here
        # so TradeHistory carries a stable number even if admin changes the
        # spread config later. Lookup is non-fatal; defaults to 0.
        spread_rev = await compute_spread_revenue(
            db, instrument, req.lots, fill_price, user_id=user_id,
        )

        contract_size = instrument.contract_size or Decimal("100000")
        # Base (USD) margin via the stable 4-arg signature, then convert to the
        # account currency here. Doing the INR multiply inline avoids coupling
        # to calc_margin's optional currency params (not present in every
        # deployed build → TypeError on order placement).
        required_margin = calc_margin(req.lots, fill_price, contract_size, account.leverage)
        if acct_currency == "INR":
            required_margin = required_margin * fx_rate

        unrealized_pnl = Decimal("0")
        open_pos_result = await db.execute(
            select(Position).where(
                Position.account_id == account.id,
                Position.status == "open",
            )
        )
        open_positions = open_pos_result.scalars().all()

        # Batch-load all prices in one Redis mget call (instead of N+1 calls)
        if open_positions:
            pos_symbols = list({
                pos.instrument.symbol for pos in open_positions
                if pos.instrument
            })
            tick_keys = [PriceChannel.tick_key(s) for s in pos_symbols]
            tick_values = await redis_client.mget(tick_keys) if tick_keys else []
            price_map: dict[str, tuple[Decimal, Decimal]] = {}
            for sym, val in zip(pos_symbols, tick_values):
                if val:
                    try:
                        d = json.loads(val)
                        price_map[sym] = (Decimal(str(d["bid"])), Decimal(str(d["ask"])))
                    except (json.JSONDecodeError, KeyError):
                        pass

            for pos in open_positions:
                sym = pos.instrument.symbol if pos.instrument else None
                if not sym or sym not in price_map:
                    continue
                p_bid, p_ask = price_map[sym]
                pos_side = pos.side.value if hasattr(pos.side, 'value') else str(pos.side)
                cp = p_bid if pos_side == "buy" else p_ask
                cs = pos.instrument.contract_size if pos.instrument else Decimal("100000")
                if pos_side == "buy":
                    unrealized_pnl += (cp - pos.open_price) * pos.lots * cs
                else:
                    unrealized_pnl += (pos.open_price - cp) * pos.lots * cs
        real_equity = (account.balance or Decimal("0")) + (account.credit or Decimal("0")) + unrealized_pnl
        real_free_margin = real_equity - (account.margin_used or Decimal("0"))

        account.equity = real_equity
        account.free_margin = real_free_margin

        if required_margin > real_free_margin:
            raise HTTPException(status_code=400, detail="Insufficient margin")

        order.status = "filled"
        order.filled_price = fill_price
        order.filled_at = datetime.utcnow()
        order.commission = commission

        position = Position(
            account_id=account.id,
            instrument_id=instrument.id,
            order_id=order.id,
            side=req.side,
            lots=req.lots,
            open_price=fill_price,
            stop_loss=req.stop_loss,
            take_profit=req.take_profit,
            status="open",
            commission=commission,
            spread_revenue=spread_rev,
        )
        db.add(position)

        account.margin_used = (account.margin_used or Decimal("0")) + required_margin
        account.balance -= commission
        account.equity = (account.balance or Decimal("0")) + (account.credit or Decimal("0")) + unrealized_pnl
        account.free_margin = account.equity - account.margin_used

    else:
        if not req.price:
            raise HTTPException(status_code=400, detail="Price required for pending orders")
        px = Decimal(str(req.price))
        side_s = str(req.side).lower()

        if req.order_type == "limit":
            if side_s == "buy" and px >= ask:
                raise HTTPException(
                    status_code=400,
                    detail=f"Buy limit must be below the current ask ({ask}). To buy at market, use a market order.",
                )
            if side_s == "sell" and px <= bid:
                raise HTTPException(
                    status_code=400,
                    detail=f"Sell limit must be above the current bid ({bid}). To sell at market, use a market order.",
                )
        elif req.order_type == "stop":
            if side_s == "buy" and px <= ask:
                raise HTTPException(
                    status_code=400,
                    detail=f"Buy stop must be above the current ask ({ask}).",
                )
            if side_s == "sell" and px >= bid:
                raise HTTPException(
                    status_code=400,
                    detail=f"Sell stop must be below the current bid ({bid}).",
                )
        elif req.order_type == "stop_limit":
            if not req.stop_limit_price:
                raise HTTPException(status_code=400, detail="stop_limit_price required for stop-limit orders")
            slp = Decimal(str(req.stop_limit_price))
            # Industry convention + engine trigger logic require:
            #   BUY  stop-limit: stop < limit  (price rallies to stop, fill up to limit)
            #   SELL stop-limit: stop > limit  (price falls to stop, fill down to limit)
            # The old validation forced the opposite, which made the engine's
            # combined trigger (ask >= stop AND ask <= limit) mathematically
            # impossible to satisfy — stop-limits never filled.
            if side_s == "buy":
                if px <= ask:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Buy stop price must be above the current ask ({ask}).",
                    )
                if slp <= px:
                    raise HTTPException(
                        status_code=400,
                        detail="Buy stop-limit: limit price must be above the stop price.",
                    )
            else:
                if px >= bid:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Sell stop price must be below the current bid ({bid}).",
                    )
                if slp >= px:
                    raise HTTPException(
                        status_code=400,
                        detail="Sell stop-limit: limit price must be below the stop price.",
                    )

        order.status = "pending"

    db.add(order)
    ua_hdr = (request.headers.get("user-agent") or "").strip()
    db.add(
        UserAuditLog(
            user_id=user_id,
            action_type="ORDER_PLACED",
            ip_address=ip_address,
            device_info=ua_hdr[:2048] if ua_hdr else None,
        )
    )
    await db.commit()

    # Fire-and-forget: notification + IB commission run in background (don't block response)
    if req.order_type == "market":
        # ── A-Book: forward trade to Corecen LP ──────────────────────────
        _pos_id_for_lp = str(position.id)
        _user_id_str = str(user_id)
        _symbol = instrument.symbol
        _side = req.side
        _lots = float(req.lots)
        _fill_price = float(fill_price)
        _sl = float(req.stop_loss) if req.stop_loss else None
        _tp = float(req.take_profit) if req.take_profit else None
        _leverage = account.leverage
        _contract_size = float(instrument.contract_size or 100000)
        _acct_id_str = str(account.id)
        _is_demo = bool(account.is_demo)

        async def _maybe_forward_to_corecen():
            # Demo account trades are always B-book — never forward to LP,
            # regardless of the user's A/B book_type flag.
            if _is_demo:
                return
            try:
                async with AsyncSessionLocal() as bg_db:
                    u = (await bg_db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
                    if u and (u.book_type or "B") == "A":
                        user_name = " ".join(filter(None, [u.first_name, u.last_name])) or ""
                        await corecen_trade_client.forward_trade_open(
                            position_id=_pos_id_for_lp,
                            user_id=_user_id_str,
                            user_email=u.email,
                            user_name=user_name,
                            symbol=_symbol,
                            side=_side,
                            volume=_lots,
                            open_price=_fill_price,
                            sl=_sl,
                            tp=_tp,
                            leverage=_leverage,
                            contract_size=_contract_size,
                            trading_account_id=_acct_id_str,
                        )
            except Exception as e:
                logger.error("[A-BOOK] Failed to forward trade open to Corecen: %s", e)

        # LP routing disabled — all fills stay on internal b-book engine.
        # asyncio.create_task(_maybe_forward_to_corecen())

        async def _post_order_tasks():
            async with AsyncSessionLocal() as bg_db:
                try:
                    await create_notification(
                        bg_db, user_id,
                        title=f"Order Filled — {instrument.symbol}",
                        message=f"{req.side.upper()} {req.lots} lots @ {order.filled_price}",
                        notif_type="trade", action_url="/trading",
                    )
                except Exception as e:
                    logger.warning("Post-order notification error: %s", e)
                # NOTE: IB commission is intentionally NOT paid on order open.
                # It is paid when the position CLOSES (see close_position +
                # sltp_engine + copy_engine close paths). Paying on open
                # creates an open-then-immediately-close mint exploit.
                await bg_db.commit()
        asyncio.create_task(_post_order_tasks())

    asyncio.create_task(fire_event(KafkaTopics.ORDERS, str(order.id), {
        "event": "order_placed",
        "order_id": str(order.id),
        "symbol": instrument.symbol,
        "side": req.side,
        "lots": str(req.lots),
        "status": str(order.status),
    }))

    try:
        await redis_client.publish(f"account:{account.id}", json.dumps({
            "type": "order_update",
            "order_id": str(order.id),
            "status": str(order.status),
        }))
    except Exception:
        pass

    sv = order.side.value if hasattr(order.side, 'value') else str(order.side)
    otype_val = order.order_type.value if hasattr(order.order_type, 'value') else str(order.order_type)
    status_val = order.status.value if hasattr(order.status, 'value') else str(order.status)

    return {
        "id": str(order.id),
        "account_id": str(order.account_id),
        "symbol": instrument.symbol,
        "order_type": otype_val,
        "side": sv,
        "status": status_val,
        "lots": float(order.lots),
        "price": float(order.price) if order.price else None,
        "stop_loss": float(order.stop_loss) if order.stop_loss else None,
        "take_profit": float(order.take_profit) if order.take_profit else None,
        "filled_price": float(order.filled_price) if order.filled_price else None,
        "commission": float(order.commission or 0),
        "swap": float(order.swap or 0),
        "comment": order.comment,
        "created_at": order.created_at.isoformat() if order.created_at else None,
    }


async def list_orders(account_id: UUID, user_id: UUID, status: str | None, db: AsyncSession) -> list[dict]:
    await validate_account(account_id, user_id, db)

    query = select(Order).where(Order.account_id == account_id)
    if status:
        query = query.where(Order.status == status)
    query = query.order_by(Order.created_at.desc()).limit(100)

    result = await db.execute(query)
    orders = result.scalars().all()

    items = []
    for o in orders:
        sv = o.side.value if hasattr(o.side, 'value') else str(o.side)
        otype_val = o.order_type.value if hasattr(o.order_type, 'value') else str(o.order_type)
        status_val = o.status.value if hasattr(o.status, 'value') else str(o.status)
        items.append({
            "id": str(o.id),
            "account_id": str(o.account_id),
            "symbol": o.instrument.symbol if o.instrument else "",
            "order_type": otype_val,
            "side": sv,
            "status": status_val,
            "lots": float(o.lots),
            "price": float(o.price) if o.price else None,
            "stop_loss": float(o.stop_loss) if o.stop_loss else None,
            "take_profit": float(o.take_profit) if o.take_profit else None,
            "filled_price": float(o.filled_price) if o.filled_price else None,
            "commission": float(o.commission or 0),
            "swap": float(o.swap or 0),
            "comment": o.comment,
            "created_at": o.created_at.isoformat() if o.created_at else None,
        })
    return items


async def _reject_if_maintenance():
    from packages.common.src.settings_store import get_bool_setting
    if await get_bool_setting("maintenance_mode", False):
        raise HTTPException(
            status_code=503,
            detail="Platform is under maintenance. Trading is temporarily disabled.",
        )


async def modify_order(order_id: UUID, req, user_id: UUID, db: AsyncSession) -> dict:
    await _reject_if_maintenance()
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await validate_account(order.account_id, user_id, db)

    status_val = order.status.value if hasattr(order.status, 'value') else str(order.status)
    if status_val != "pending":
        raise HTTPException(status_code=400, detail="Can only modify pending orders")

    if req.stop_loss is not None:
        order.stop_loss = req.stop_loss
    if req.take_profit is not None:
        order.take_profit = req.take_profit
    if req.price is not None:
        order.price = req.price
    if req.lots is not None:
        order.lots = req.lots

    await db.commit()
    return {"message": "Order modified"}


async def cancel_order(order_id: UUID, user_id: UUID, db: AsyncSession) -> dict:
    await _reject_if_maintenance()
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await validate_account(order.account_id, user_id, db)

    status_val = order.status.value if hasattr(order.status, 'value') else str(order.status)
    if status_val != "pending":
        raise HTTPException(status_code=400, detail="Can only cancel pending orders")

    order.status = "cancelled"
    await db.commit()

    return {"message": "Order cancelled"}


# ─── Positions ────────────────────────────────────────────────────────────

async def list_positions(account_id: UUID, user_id: UUID, status: str, db: AsyncSession) -> list[dict]:
    result = await db.execute(
        select(TradingAccount).where(
            TradingAccount.id == account_id,
            TradingAccount.user_id == user_id,
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Account not found")

    query = select(Position).where(Position.account_id == account_id)
    if status == "open":
        query = query.where(Position.status == "open")
    elif status == "closed":
        query = query.where(Position.status == "closed")

    result = await db.execute(query.order_by(Position.created_at.desc()))
    positions = result.scalars().all()

    # Batch Redis tick lookups — one MGET instead of N sequential GETs. With
    # 50 open positions this drops list_positions latency from ~250ms to ~10ms.
    unique_symbols = list({pos.instrument.symbol for pos in positions if pos.instrument})
    tick_map: dict[str, dict] = {}
    if unique_symbols:
        tick_keys = [PriceChannel.tick_key(s) for s in unique_symbols]
        tick_values = await redis_client.mget(tick_keys)
        for sym, raw in zip(unique_symbols, tick_values):
            if raw:
                try:
                    tick_map[sym] = json.loads(raw)
                except (ValueError, TypeError):
                    pass

    # Batch copy-trade lookup — one IN query instead of N per-position queries.
    pos_ids = [pos.id for pos in positions]
    copy_trade_ids: set = set()
    if pos_ids:
        copy_q = await db.execute(
            select(CopyTrade.investor_position_id).where(CopyTrade.investor_position_id.in_(pos_ids))
        )
        copy_trade_ids = {row[0] for row in copy_q.all()}

    response = []
    for pos in positions:
        current_price = None
        profit = float(pos.profit or 0)
        sv = side_val(pos.side)
        contract_size = pos.instrument.contract_size if pos.instrument else Decimal("100000")

        symbol = pos.instrument.symbol if pos.instrument else None
        tick = tick_map.get(symbol) if symbol else None
        pos_status = pos.status.value if hasattr(pos.status, 'value') else str(pos.status)

        if tick and pos_status == "open":
            current_price = float(tick["bid"]) if sv == "buy" else float(tick["ask"])
            profit = float(calc_pnl(pos.side, pos.open_price, Decimal(str(current_price)), pos.lots, contract_size, instrument=pos.instrument))

        copy_trade = pos.id in copy_trade_ids
        if copy_trade:
            trade_type = "copy_trade"
        elif pos.comment and str(pos.comment).startswith("Algo ["):
            # Algo connector tags every position it opens with this prefix
            # (see api/algo_connector.py). Lets the UI render an Algo badge so
            # the master can tell bot trades apart from manual ones at a glance.
            trade_type = "algo_trade"
        else:
            trade_type = "self_trade"

        pos_status_val = pos.status.value if hasattr(pos.status, 'value') else str(pos.status)
        response.append({
            "id": str(pos.id),
            "account_id": str(pos.account_id),
            "symbol": pos.instrument.symbol if pos.instrument else "",
            "side": sv,
            "lots": float(pos.lots),
            "open_price": float(pos.open_price),
            "current_price": current_price,
            "stop_loss": float(pos.stop_loss) if pos.stop_loss else None,
            "take_profit": float(pos.take_profit) if pos.take_profit else None,
            "swap": float(pos.swap or 0),
            "commission": float(pos.commission or 0),
            "profit": profit,
            "status": pos_status_val,
            "contract_size": float(contract_size),
            "trade_type": trade_type,
            "created_at": pos.created_at.isoformat() if pos.created_at else None,
            "closed_at": pos.closed_at.isoformat() if getattr(pos, 'closed_at', None) else None,
        })

    return response


async def modify_position(position_id: UUID, req, user_id: UUID, db: AsyncSession) -> dict:
    # Eager-load the instrument — we need its symbol for the current-price
    # lookup that drives SL/TP placement validation below.
    result = await db.execute(
        select(Position).options(selectinload(Position.instrument)).where(Position.id == position_id)
    )
    pos = result.scalar_one_or_none()
    if not pos:
        raise HTTPException(status_code=404, detail="Position not found")

    acct_result = await db.execute(
        select(TradingAccount).where(
            TradingAccount.id == pos.account_id,
            TradingAccount.user_id == user_id,
        )
    )
    acct_row = acct_result.scalar_one_or_none()
    if not acct_row:
        raise HTTPException(status_code=403, detail="Not your position")

    pos_status = pos.status.value if hasattr(pos.status, 'value') else str(pos.status)
    if pos_status != "open":
        raise HTTPException(status_code=400, detail="Position is not open")

    # ── A-Book safety: block modify when LP is disconnected ───────────
    await _require_lp_for_abook(user_id, acct_row, db)

    # MAM follower lock: mirrored positions inherit SL/TP from master; followers
    # cannot modify them independently.
    copy_q = await db.execute(
        select(CopyTrade).where(CopyTrade.investor_position_id == pos.id)
    )
    if copy_q.scalar_one_or_none():
        raise HTTPException(
            status_code=403,
            detail="This is a MAM mirrored trade. SL/TP is controlled by the master.",
        )

    sv = side_val(pos.side)
    updated = False

    # SL/TP placement is constrained by the CURRENT market price, not the
    # open price — traders move SL into profit (trailing / move-to-breakeven)
    # and TP closer once the trade runs, both of which the open-price check
    # used to wrongly reject. The real rule is "must not trigger instantly".
    # BUY exits at bid, SELL exits at ask, so compare against the right side
    # of the spread. Falls back to open_price if the price cache is cold so
    # we don't 400 on a working API just because a tick hasn't arrived yet.
    ref_price = pos.open_price
    if req.stop_loss is not None or req.take_profit is not None:
        try:
            bid, ask = await get_current_price(pos.instrument.symbol)
            ref_price = bid if sv == "buy" else ask
        except HTTPException:
            pass  # keep open_price fallback

    if req.stop_loss is not None:
        if req.stop_loss <= 0:
            raise HTTPException(status_code=400, detail="SL must be greater than 0")
        if sv == "buy" and req.stop_loss >= ref_price:
            raise HTTPException(status_code=400, detail=f"BUY SL must be below current price ({ref_price})")
        if sv == "sell" and req.stop_loss <= ref_price:
            raise HTTPException(status_code=400, detail=f"SELL SL must be above current price ({ref_price})")
        pos.stop_loss = req.stop_loss
        updated = True

    if req.take_profit is not None:
        if req.take_profit <= 0:
            raise HTTPException(status_code=400, detail="TP must be greater than 0")
        if sv == "buy" and req.take_profit <= ref_price:
            raise HTTPException(status_code=400, detail=f"BUY TP must be above current price ({ref_price})")
        if sv == "sell" and req.take_profit >= ref_price:
            raise HTTPException(status_code=400, detail=f"SELL TP must be below current price ({ref_price})")
        pos.take_profit = req.take_profit
        updated = True

    if updated:
        await db.commit()

        # ── A-Book: forward SL/TP update to Corecen LP ──────────────────
        _pos_id_str = str(position_id)
        _new_sl = float(pos.stop_loss) if pos.stop_loss else None
        _new_tp = float(pos.take_profit) if pos.take_profit else None
        _is_demo = bool(acct_row.is_demo)

        async def _maybe_forward_update_to_corecen():
            if _is_demo:
                return
            try:
                async with AsyncSessionLocal() as bg_db:
                    u = (await bg_db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
                    if u and (u.book_type or "B") == "A":
                        await corecen_trade_client.forward_trade_update(
                            position_id=_pos_id_str,
                            sl=_new_sl,
                            tp=_new_tp,
                        )
            except Exception as e:
                logger.error("[A-BOOK] Failed to forward SL/TP update to Corecen: %s", e)

        # LP routing disabled — SL/TP updates stay on internal b-book engine.
        # asyncio.create_task(_maybe_forward_update_to_corecen())

    return {
        "message": "Position modified",
        "stop_loss": float(pos.stop_loss) if pos.stop_loss else None,
        "take_profit": float(pos.take_profit) if pos.take_profit else None,
    }


async def close_position(position_id: UUID, req, user_id: UUID, db: AsyncSession) -> dict:
    result = await db.execute(select(Position).where(Position.id == position_id))
    pos = result.scalar_one_or_none()
    if not pos:
        raise HTTPException(status_code=404, detail="Position not found")

    acct_result = await db.execute(
        select(TradingAccount).where(
            TradingAccount.id == pos.account_id,
            TradingAccount.user_id == user_id,
        )
    )
    account = acct_result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=403, detail="Not your position")

    pos_status = pos.status.value if hasattr(pos.status, 'value') else str(pos.status)
    if pos_status != "open":
        raise HTTPException(status_code=400, detail="Position is not open")

    # ── A-Book safety: block close when LP is disconnected ────────────
    await _require_lp_for_abook(user_id, account, db)

    # MAM follower lock: mirrored positions can only be closed by the master
    # (via the copy engine when the master closes their original position).
    copy_q = await db.execute(
        select(CopyTrade).where(CopyTrade.investor_position_id == pos.id)
    )
    if copy_q.scalar_one_or_none():
        raise HTTPException(
            status_code=403,
            detail="This is a MAM mirrored trade. Only the master can close it.",
        )

    # Retry tick fetch up to 3x — a single empty read is usually a cache miss
    # between the market-data tick write and our read, not a real outage. The
    # user shouldn't see "No price available" for a transient blip.
    tick_data = None
    for _attempt in range(3):
        tick_data = await redis_client.get(PriceChannel.tick_key(pos.instrument.symbol))
        if tick_data:
            break
        await asyncio.sleep(0.1)
    if not tick_data:
        raise HTTPException(
            status_code=503,
            detail=f"Price feed for {pos.instrument.symbol} is temporarily unavailable. Please try again in a moment.",
        )

    tick = json.loads(tick_data)
    sv = side_val(pos.side)
    close_price = Decimal(str(tick["bid"])) if sv == "buy" else Decimal(str(tick["ask"]))
    contract_size = pos.instrument.contract_size if pos.instrument else Decimal("100000")

    close_lots = Decimal(str(req.lots)) if req.lots and Decimal(str(req.lots)) < pos.lots else pos.lots
    is_partial = close_lots < pos.lots

    from packages.common.src.fx_utils import get_usd_to_account_rate
    acct_currency = (account.currency or "USD")
    fx_rate = await get_usd_to_account_rate(acct_currency)
    full_profit = calc_pnl(pos.side, pos.open_price, close_price, pos.lots, contract_size, instrument=pos.instrument, account_currency=acct_currency, usd_inr_rate=fx_rate)

    # If the market price has already crossed the position's SL/TP level, label
    # this close as SL/TP in trade history instead of "manual" — covers the case
    # where the SL/TP engine was racing and the user's close request landed first.
    detected_reason = "manual"
    if pos.stop_loss:
        sl = Decimal(str(pos.stop_loss))
        if sv == "buy" and close_price <= sl:
            detected_reason = "sl"
        elif sv == "sell" and close_price >= sl:
            detected_reason = "sl"
    if detected_reason == "manual" and pos.take_profit:
        tp = Decimal(str(pos.take_profit))
        if sv == "buy" and close_price >= tp:
            detected_reason = "tp"
        elif sv == "sell" and close_price <= tp:
            detected_reason = "tp"

    if is_partial:
        ratio = close_lots / pos.lots
        partial_profit = full_profit * ratio
        partial_commission = (pos.commission or Decimal("0")) * ratio
        partial_swap = (pos.swap or Decimal("0")) * ratio
        # Prorate the frozen spread pickup by the same ratio so the remaining
        # position keeps the right share — the close path elsewhere does the
        # same for swap and commission, this matches that convention.
        partial_spread = (pos.spread_revenue or Decimal("0")) * ratio

        pos.lots -= close_lots
        pos.spread_revenue = (pos.spread_revenue or Decimal("0")) - partial_spread

        history = TradeHistory(
            position_id=pos.id,
            account_id=pos.account_id,
            instrument_id=pos.instrument_id,
            side=pos.side,
            lots=close_lots,
            open_price=pos.open_price,
            close_price=close_price,
            swap=partial_swap,
            commission=partial_commission,
            spread_revenue=partial_spread,
            profit=partial_profit,
            close_reason=detected_reason,
            opened_at=pos.created_at,
            closed_at=datetime.utcnow(),
        )
        db.add(history)
        await db.flush()  # populate history.id for IB commission idempotency key

        balance_after = await apply_position_pnl(db, account, user_id, partial_profit)
        # Recompute margin_used from the sum of OPEN positions — eliminates
        # subtractive-drift bug where MARGIN USED stays > 0 even with no
        # open positions on the account.
        await recompute_account_margin(db, account)

        result_msg = f"Partial close: {close_lots} lots"
        result_profit = partial_profit
        _ib_history_id = history.id
        _ib_lots = close_lots
        _ib_trader_commission = partial_commission
    else:
        pos.status = "closed"
        pos.close_price = close_price
        pos.profit = full_profit
        pos.closed_at = datetime.utcnow()

        history = TradeHistory(
            position_id=pos.id,
            account_id=pos.account_id,
            instrument_id=pos.instrument_id,
            side=pos.side,
            lots=pos.lots,
            open_price=pos.open_price,
            close_price=close_price,
            swap=pos.swap or Decimal("0"),
            commission=pos.commission or Decimal("0"),
            spread_revenue=pos.spread_revenue or Decimal("0"),
            profit=full_profit,
            close_reason=detected_reason,
            opened_at=pos.created_at,
            closed_at=datetime.utcnow(),
        )
        db.add(history)
        await db.flush()  # populate history.id for IB commission idempotency key

        balance_after = await apply_position_pnl(db, account, user_id, full_profit)
        # Recompute margin_used from open positions (this one is now closed).
        await recompute_account_margin(db, account)

        result_msg = "Position closed"
        result_profit = full_profit
        _ib_history_id = history.id
        _ib_lots = pos.lots
        _ib_trader_commission = (pos.commission or Decimal("0"))

    account.equity = account.balance + (account.credit or Decimal("0"))
    account.free_margin = account.equity - (account.margin_used or Decimal("0"))

    tx = Transaction(
        user_id=user_id,
        account_id=account.id,
        type="profit" if result_profit >= 0 else "loss",
        amount=result_profit,
        balance_after=balance_after,
        reference_id=pos.id,
        # Profit is in the account currency (INR for INR accounts); stamp it so
        # the Transactions UI renders the right symbol (₹ vs $) per row.
        currency=acct_currency,
        description=f"{'Partial ' if is_partial else ''}Close {pos.instrument.symbol} {sv} {close_lots} lots @ {close_price}",
    )
    db.add(tx)

    await db.commit()

    # Fire-and-forget: notification, Kafka event, Redis publish — don't block response
    _pos_symbol = pos.instrument.symbol if pos.instrument else ""
    _pos_id = str(pos.id)
    _acct_id = str(account.id)
    _profit_str = str(result_profit)
    _is_demo_for_ib = bool(account.is_demo)
    pnl_str = f"+${float(result_profit):.2f}" if result_profit >= 0 else f"-${abs(float(result_profit)):.2f}"

    async def _post_close_tasks():
        async with AsyncSessionLocal() as bg_db:
            try:
                await create_notification(
                    bg_db, user_id,
                    title=f"{'Partial Close' if is_partial else 'Position Closed'} — {_pos_symbol}",
                    message=f"{sv.upper()} {close_lots} lots @ {close_price} | P&L: {pnl_str}",
                    notif_type="trade", action_url="/trading",
                )
            except Exception:
                pass

            # IB commission distribution — runs on CLOSE (not open) so an
            # open/close exploit cannot mint commission. Demo is skipped
            # inside the engine.
            try:
                from ..engines.ib_engine import distribute_ib_commission
                # Commission is stored in the account currency (INR for INR
                # accounts); IB economics are USD-based (spread-share proxy +
                # USD IB account credit), so convert back to USD before passing.
                _ib_commission_usd = (
                    (_ib_trader_commission / fx_rate)
                    if (acct_currency == "INR" and fx_rate and fx_rate > 0)
                    else _ib_trader_commission
                )
                await distribute_ib_commission(
                    bg_db,
                    trader_user_id=user_id,
                    source_trade_id=_ib_history_id,
                    lots=_ib_lots,
                    instrument_symbol=_pos_symbol,
                    is_demo=_is_demo_for_ib,
                    trader_commission_charged=_ib_commission_usd,
                )
                await bg_db.commit()
            except Exception as e:
                logger.error("IB commission distribute failed on close: %s", e)
                await bg_db.rollback()
        try:
            await redis_client.publish(f"account:{_acct_id}", json.dumps({
                "type": "position_closed",
                "position_id": _pos_id,
                "profit": _profit_str,
            }))
        except Exception:
            pass

    asyncio.create_task(_post_close_tasks())
    asyncio.create_task(fire_event(KafkaTopics.TRADES, _pos_id, {
        "event": "position_closed",
        "position_id": _pos_id,
        "symbol": _pos_symbol,
        "profit": _profit_str,
        "partial": is_partial,
    }))

    # ── A-Book: forward close to Corecen LP ──────────────────────────
    _close_price_f = float(close_price)
    _result_profit_f = float(result_profit)
    _close_reason = detected_reason.upper() if detected_reason != "manual" else "USER"
    _is_demo = bool(account.is_demo)

    async def _maybe_forward_close_to_corecen():
        if _is_demo:
            return
        try:
            async with AsyncSessionLocal() as bg_db:
                u = (await bg_db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
                if u and (u.book_type or "B") == "A":
                    await corecen_trade_client.forward_trade_close(
                        position_id=_pos_id,
                        close_price=_close_price_f,
                        pnl=_result_profit_f,
                        closed_by=_close_reason,
                    )
        except Exception as e:
            logger.error("[A-BOOK] Failed to forward trade close to Corecen: %s", e)

    # LP routing disabled — closes stay on internal b-book engine.
    # asyncio.create_task(_maybe_forward_close_to_corecen())

    return {
        "message": result_msg,
        "close_price": float(close_price),
        "profit": float(result_profit),
        "lots_closed": float(close_lots),
        "remaining_lots": float(pos.lots) if is_partial else 0,
        "balance": float(account.balance),
    }
