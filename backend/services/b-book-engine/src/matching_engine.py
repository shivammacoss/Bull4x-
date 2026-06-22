"""B-Book Matching Engine — All orders execute against the house book.

This is the core execution engine. In a B-Book model:
- Market orders fill immediately at current bid/ask
- Pending orders (limit, stop, stop-limit) are monitored and triggered when price conditions are met
- No external liquidity — the admin/house is the counterparty to every trade
- Executable bid/ask in Redis already include platform spread (market-data service)
"""
import asyncio
import json
import logging
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from packages.common.src.database import AsyncSessionLocal
from packages.common.src.models import (
    Order, OrderType, OrderSide, OrderStatus,
    Position, PositionStatus, TradingAccount, Instrument,
    Transaction, TradeHistory, User,
)
from packages.common.src.redis_client import redis_client, PriceChannel
from packages.common.src.kafka_client import produce_event, KafkaTopics
from packages.common.src.instrument_pricing import resolve_commission, compute_spread_revenue
from packages.common.src import corecen_trade_client

logger = logging.getLogger("b-book-engine")


class MatchingEngine:
    def __init__(self):
        self._running = False

    async def start(self):
        self._running = True
        logger.info("B-Book Matching Engine started")

        await asyncio.gather(
            self._monitor_pending_orders(),
            self._monitor_sl_tp(),
        )

    async def stop(self):
        self._running = False

    async def _get_price(self, symbol: str) -> Optional[tuple[Decimal, Decimal]]:
        tick_data = await redis_client.get(PriceChannel.tick_key(symbol))
        if not tick_data:
            return None
        tick = json.loads(tick_data)
        return Decimal(str(tick["bid"])), Decimal(str(tick["ask"]))


    async def _monitor_pending_orders(self):
        """Monitor and trigger pending orders when price conditions are met.

        Each candidate order is now processed in its own session/transaction so
        a single problematic row (instrument disabled, commission lookup blow-up,
        DB constraint) can't roll back every other order's fill in the same tick.
        Triggered orders are SELECTed FOR UPDATE so a manual cancel arriving
        between read and execute can't race us into a double-fill state.
        """
        logger.info("Pending order monitor started")
        while self._running:
            order_ids: list = []
            try:
                async with AsyncSessionLocal() as db:
                    result = await db.execute(
                        select(Order.id).where(Order.status == OrderStatus.PENDING)
                    )
                    order_ids = [row[0] for row in result.all()]
            except Exception as e:
                logger.error("Pending order monitor: list query failed: %s", e)
                await asyncio.sleep(0.1)
                continue

            for oid in order_ids:
                try:
                    async with AsyncSessionLocal() as db:
                        # Row-lock the order so a concurrent cancel/admin edit can't
                        # tamper with it mid-fill. Skip the row if it's already gone
                        # to a terminal status between the list query and this read.
                        order = (await db.execute(
                            select(Order).where(Order.id == oid).with_for_update()
                        )).scalar_one_or_none()
                        if order is None or order.status != OrderStatus.PENDING:
                            continue

                        if order.expires_at and datetime.now(timezone.utc) > order.expires_at:
                            order.status = OrderStatus.EXPIRED
                            await db.commit()
                            logger.info("Pending order %s expired", oid)
                            continue

                        if not order.instrument or not order.instrument.is_active:
                            order.status = OrderStatus.REJECTED
                            await db.commit()
                            logger.warning(
                                "Pending order %s rejected — instrument inactive or missing", oid,
                            )
                            await self._notify_user_safe(
                                order, "Order rejected: instrument is currently disabled.",
                            )
                            continue

                        price_data = await self._get_price(order.instrument.symbol)
                        if not price_data:
                            # Price feed silent (weekend, instrument paused, etc.) —
                            # not a failure, just try again next tick.
                            continue
                        bid, ask = price_data

                        triggered = False
                        if order.order_type == OrderType.LIMIT:
                            if order.side == OrderSide.BUY and ask <= order.price:
                                triggered = True
                            elif order.side == OrderSide.SELL and bid >= order.price:
                                triggered = True
                        elif order.order_type == OrderType.STOP:
                            if order.side == OrderSide.BUY and ask >= order.price:
                                triggered = True
                            elif order.side == OrderSide.SELL and bid <= order.price:
                                triggered = True
                        elif order.order_type == OrderType.STOP_LIMIT:
                            # BUY: price rallies to stop, then fill up to limit (limit > stop).
                            # SELL: price falls to stop, then fill down to limit (limit < stop).
                            if order.side == OrderSide.BUY and ask >= order.price:
                                if order.stop_limit_price and ask <= order.stop_limit_price:
                                    triggered = True
                            elif order.side == OrderSide.SELL and bid <= order.price:
                                if order.stop_limit_price and bid >= order.stop_limit_price:
                                    triggered = True

                        if not triggered:
                            continue

                        rejection = await self._execute_pending_order(order, bid, ask, db)
                        await db.commit()
                        if rejection:
                            logger.warning(
                                "Pending order %s rejected on trigger: %s", oid, rejection,
                            )
                            await self._notify_user_safe(order, f"Order rejected: {rejection}")
                except Exception as e:
                    logger.error("Pending order %s processing failed: %s", oid, e)

            await asyncio.sleep(0.1)

    async def _notify_user_safe(self, order, message: str) -> None:
        """Best-effort notification on rejection — never let it block the engine."""
        try:
            account = None
            async with AsyncSessionLocal() as bg_db:
                account = await bg_db.get(TradingAccount, order.account_id)
                if not account or not account.user_id:
                    return
                try:
                    from packages.common.src.notify import create_notification
                    await create_notification(
                        bg_db, account.user_id,
                        title="Pending order rejected",
                        message=message,
                        notif_type="trade",
                        action_url="/trading",
                    )
                    await bg_db.commit()
                except Exception:
                    pass
        except Exception:
            pass

    async def _execute_pending_order(
        self, order: Order, bid: Decimal, ask: Decimal, db: AsyncSession,
    ) -> Optional[str]:
        """Fill a triggered pending order. Returns None on success, or a
        human-readable rejection reason string when the order is marked
        REJECTED. The monitor loop forwards that reason to the trader via
        notification so silent margin/account failures are visible.
        """
        from packages.common.src.trading_service import recompute_account_margin

        # Lock account row to prevent race conditions with concurrent fills
        account = (await db.execute(
            select(TradingAccount).where(TradingAccount.id == order.account_id).with_for_update()
        )).scalar_one_or_none()
        if not account:
            order.status = OrderStatus.REJECTED
            return "trading account no longer exists"
        if not account.is_active:
            order.status = OrderStatus.REJECTED
            return "trading account is suspended"

        instrument = await db.get(Instrument, order.instrument_id)
        if not instrument or not instrument.is_active:
            order.status = OrderStatus.REJECTED
            return "instrument is currently disabled"

        # Redis quotes already include platform spread (symmetric).
        fill_price = ask if order.side == OrderSide.BUY else bid
        contract_size = instrument.contract_size or Decimal("100000")
        margin = (order.lots * contract_size * fill_price) / Decimal(str(account.leverage))

        # Available margin must count admin credit as usable (balance + credit − used),
        # not the possibly-stale stored free_margin column.
        available_margin = (
            (account.balance or Decimal("0"))
            + (account.credit or Decimal("0"))
            - (account.margin_used or Decimal("0"))
        )
        if margin > available_margin:
            order.status = OrderStatus.REJECTED
            return (
                f"insufficient free margin to fill — needs ${float(margin):,.2f}, "
                f"available ${float(available_margin):,.2f}"
            )

        # Use the shared resolve_commission (same logic as gateway market orders)
        try:
            commission = await resolve_commission(
                db, instrument, order.lots, fill_price, user_id=account.user_id,
            )
        except Exception as e:
            logger.error("Commission lookup failed for order %s: %s", order.id, e)
            order.status = OrderStatus.REJECTED
            return "commission lookup failed"

        # Compute broker's spread revenue (frozen at fill time)
        try:
            spread_rev = await compute_spread_revenue(
                db, instrument, order.lots, fill_price, user_id=account.user_id,
            )
        except Exception:
            spread_rev = Decimal("0")

        order.status = OrderStatus.FILLED
        order.filled_price = fill_price
        order.filled_at = datetime.now(timezone.utc)
        order.commission = commission

        position = Position(
            account_id=account.id,
            instrument_id=instrument.id,
            order_id=order.id,
            side=order.side,
            lots=order.lots,
            open_price=fill_price,
            stop_loss=order.stop_loss,
            take_profit=order.take_profit,
            status=PositionStatus.OPEN,
            commission=commission,
            spread_revenue=spread_rev,
        )
        db.add(position)

        account.margin_used = (account.margin_used or Decimal("0")) + margin
        account.balance = (account.balance or Decimal("0")) - commission
        await db.flush()
        await recompute_account_margin(db, account)

        logger.info(
            "Pending order %s executed: %s %s @ %s (comm=%s, spread_rev=%s)",
            order.id, instrument.symbol, order.side.value, fill_price, commission, spread_rev,
        )

        await redis_client.publish(f"account:{account.id}", json.dumps({
            "type": "order_filled",
            "order_id": str(order.id),
            "symbol": instrument.symbol,
            "side": order.side.value,
            "price": str(fill_price),
            "lots": str(order.lots),
            "commission": str(commission),
        }))
        return None

    async def _monitor_sl_tp(self):
        """Monitor open positions for SL/TP hits.

        Each candidate position is processed in its own session/transaction
        with a SELECT … FOR UPDATE row lock and eager-loaded instrument so:
          - A single bad position can't roll back every other close in the
            same tick (previously: one exception in _close_position rolled
            back the whole loop's commits, leaving filled-then-reverted
            positions and TP rows that "didn't fire" in the UI).
          - Lazy-loading pos.instrument inside the loop after the parent
            session is half-flushed used to silently raise and skip every
            position — eager-load eliminates that path.
          - The row lock keeps the gateway's own SL/TP engine (which runs
            the same checks in parallel) from racing us into a double-close.
        """
        logger.info("SL/TP monitor started")
        while self._running:
            position_ids: list = []
            try:
                async with AsyncSessionLocal() as db:
                    result = await db.execute(
                        select(Position.id).where(
                            Position.status == PositionStatus.OPEN,
                            (Position.stop_loss.isnot(None)) | (Position.take_profit.isnot(None)),
                        )
                    )
                    position_ids = [row[0] for row in result.all()]
            except Exception as e:
                logger.error("SL/TP monitor list query failed: %s", e)
                await asyncio.sleep(0.1)
                continue

            for pid in position_ids:
                try:
                    async with AsyncSessionLocal() as db:
                        pos = (await db.execute(
                            select(Position)
                            .options(selectinload(Position.instrument))
                            .where(Position.id == pid)
                            .with_for_update()
                        )).scalar_one_or_none()
                        if pos is None or pos.status != PositionStatus.OPEN:
                            # Either gone or already closed by the gateway's
                            # parallel sltp_engine — nothing to do.
                            continue
                        if not pos.instrument:
                            logger.warning(
                                "SL/TP monitor: position %s has no instrument loaded; skipping",
                                pid,
                            )
                            continue

                        price_data = await self._get_price(pos.instrument.symbol)
                        if not price_data:
                            continue
                        bid, ask = price_data
                        close_price = bid if pos.side == OrderSide.BUY else ask

                        sl_hit = False
                        tp_hit = False
                        if pos.stop_loss:
                            if pos.side == OrderSide.BUY and close_price <= pos.stop_loss:
                                sl_hit = True
                            elif pos.side == OrderSide.SELL and close_price >= pos.stop_loss:
                                sl_hit = True
                        if pos.take_profit:
                            if pos.side == OrderSide.BUY and close_price >= pos.take_profit:
                                tp_hit = True
                            elif pos.side == OrderSide.SELL and close_price <= pos.take_profit:
                                tp_hit = True

                        if not (sl_hit or tp_hit):
                            continue

                        reason = "sl" if sl_hit else "tp"
                        await self._close_position(pos, close_price, reason, db)
                        await db.commit()
                        logger.info(
                            "SL/TP fired: position=%s symbol=%s side=%s reason=%s close=%s",
                            pid, pos.instrument.symbol, pos.side.value, reason, close_price,
                        )
                except Exception as e:
                    logger.error("SL/TP monitor: position %s close failed: %s", pid, e)

            await asyncio.sleep(0.1)

    async def _close_position(self, pos: Position, close_price: Decimal, reason: str, db: AsyncSession):
        from packages.common.src.trading_service import quote_to_account_pnl
        from packages.common.src.fx_utils import get_usd_to_account_rate

        account = await db.get(TradingAccount, pos.account_id)
        acct_currency = (account.currency if account else "USD") or "USD"
        fx_rate = await get_usd_to_account_rate(acct_currency)

        instrument = pos.instrument
        if pos.side == OrderSide.BUY:
            profit = (close_price - pos.open_price) * pos.lots * instrument.contract_size
        else:
            profit = (pos.open_price - close_price) * pos.lots * instrument.contract_size
        profit = quote_to_account_pnl(
            profit,
            getattr(instrument, "base_currency", None),
            getattr(instrument, "quote_currency", None),
            close_price,
            symbol=getattr(instrument, "symbol", None),
            account_currency=acct_currency,
            usd_inr_rate=fx_rate,
        )

        pos.status = PositionStatus.CLOSED
        pos.close_price = close_price
        pos.profit = profit
        pos.closed_at = datetime.now(timezone.utc)

        if account:
            account.balance += profit
            # Recompute margin_used as SUM of all remaining open positions on
            # the account (the just-closed pos has status='closed' above).
            # Replaces subtractive math that stranded margin over time.
            from packages.common.src.trading_service import recompute_account_margin
            await db.flush()
            await recompute_account_margin(db, account)

        # Write the canonical history row so this close appears in the trader's
        # "Closed Positions" tab. Without this insert, SL/TP-triggered closes
        # (the engine's only close path) silently disappear from the user's
        # history — only manual closes via the gateway populated TradeHistory.
        db.add(TradeHistory(
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
            profit=profit,
            close_reason=reason,
            opened_at=pos.created_at,
            closed_at=pos.closed_at,
        ))

        logger.info(
            f"Position {pos.id} closed by {reason}: {instrument.symbol} "
            f"{pos.side.value} @ {close_price}, profit: {profit}"
        )

        await redis_client.publish(f"account:{pos.account_id}", json.dumps({
            "type": f"position_closed_{reason}",
            "position_id": str(pos.id),
            "symbol": instrument.symbol,
            "close_price": str(close_price),
            "profit": str(profit),
        }))

        await produce_event(KafkaTopics.TRADES, str(pos.id), {
            "event": f"position_closed_{reason}",
            "position_id": str(pos.id),
            "account_id": str(pos.account_id),
            "symbol": instrument.symbol,
            "profit": str(profit),
        })

        # ── A-Book: forward SL/TP close to Corecen LP ────────────────────
        _pos_id = str(pos.id)
        _cp = float(close_price)
        _pnl = float(profit)
        _reason_upper = reason.upper()
        _user_id = account.user_id if account else None
        _is_demo = bool(account.is_demo) if account else True

        async def _forward_sltp_close():
            try:
                # Demo accounts never route to LP, regardless of user's book_type.
                if not _user_id or _is_demo:
                    return
                async with AsyncSessionLocal() as bg_db:
                    u = (await bg_db.execute(
                        select(User).where(User.id == _user_id)
                    )).scalar_one_or_none()
                    if u and (u.book_type or "B") == "A":
                        await corecen_trade_client.forward_trade_close(
                            position_id=_pos_id,
                            close_price=_cp,
                            pnl=_pnl,
                            closed_by=_reason_upper,
                        )
            except Exception as exc:
                logger.error("[A-BOOK] B-book engine SL/TP close forward failed: %s", exc)

        # LP routing disabled — internal b-book is the only fill venue.
        # asyncio.create_task(_forward_sltp_close())
