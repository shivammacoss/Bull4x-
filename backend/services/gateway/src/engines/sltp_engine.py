"""SL/TP Monitoring Engine — Auto-closes positions when Stop Loss or Take Profit is hit.

Subscribes to the Redis price channel and checks all open positions with SL/TP
against every incoming tick. Closes positions at the SL/TP price (not market price)
to match MT5 behavior.

CRITICAL DESIGN NOTE — why DB writes and side-effects are split:
A previous version did the position update, history insert, transaction insert,
notification create, redis publish, and A-book forward all inside one
transaction. If ANY side-effect failed (e.g. create_notification raised on a
stale user FK, or redis was momentarily unreachable in a way that didn't get
caught), the whole transaction rolled back — including the TradeHistory row.
That's why production saw positions auto-close with no history record at all.

The split now is:
  1. _persist_close — only DB writes that MUST go atomically together.
     Returns a payload describing what was closed.
  2. _check_positions — commits the persistence transaction, THEN fires
     fire-and-forget tasks for side effects (notification, redis publish,
     A-book forward). Side-effect failures only get logged; they can never
     roll back a committed close.
"""
import asyncio
import json
import logging
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from packages.common.src.database import AsyncSessionLocal
from packages.common.src.redis_client import redis_client, PriceChannel
from packages.common.src.models import (
    Position, PositionStatus, TradingAccount, Transaction, TradeHistory,
    Instrument, User,
)
from packages.common.src.notify import create_notification
from packages.common.src import corecen_trade_client

logger = logging.getLogger("gateway.sltp")

CHECK_INTERVAL = 1.0


def _side_val(side) -> str:
    return side.value if hasattr(side, 'value') else str(side)


class SLTPEngine:
    def __init__(self):
        self._running = False
        self._task = None
        self._prices: dict[str, dict] = {}

    async def start(self):
        self._running = True
        self._task = asyncio.create_task(self._run())
        logger.info("SL/TP engine started")

    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("SL/TP engine stopped")

    async def _run(self):
        while self._running:
            try:
                await self._load_prices()
                await self._check_positions()
                await asyncio.sleep(CHECK_INTERVAL)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error("SL/TP engine error: %s", e, exc_info=True)
                await asyncio.sleep(3)

    async def _load_prices(self):
        """Load latest prices directly from Redis keys instead of pubsub."""
        try:
            # Use the live-symbol index set (maintained by publish_price) instead
            # of the blocking `KEYS tick:*` command. KEYS scans the entire Redis
            # keyspace and BLOCKS Redis for every other service — running it on
            # this 1s loop stalled the whole platform.
            members = await redis_client.smembers("prices:symbols")
            if not members:
                return
            symbols = [m.decode() if isinstance(m, (bytes, bytearray)) else m for m in members]
            keys = [PriceChannel.tick_key(s) for s in symbols]
            values = await redis_client.mget(keys)
            for val in values:
                if val:
                    try:
                        data = json.loads(val)
                        self._prices[data["symbol"]] = data
                    except (json.JSONDecodeError, KeyError):
                        pass
        except Exception as e:
            logger.warning("Failed to load prices: %s", e)

    async def _check_positions(self):
        if not self._prices:
            return

        async with AsyncSessionLocal() as db:
            # Eager-load the instrument so the for-loop below doesn't trigger
            # a lazy-load against a possibly-stale async session, which used
            # to silently skip every position with "Failed to load instrument".
            result = await db.execute(
                select(Position)
                .options(selectinload(Position.instrument))
                .where(Position.status == PositionStatus.OPEN.value)
                .where(
                    (Position.stop_loss.isnot(None)) | (Position.take_profit.isnot(None))
                )
            )
            positions = result.scalars().all()

            if positions:
                logger.debug("Checking %d positions with SL/TP", len(positions))

            for pos in positions:
                symbol = pos.instrument.symbol if pos.instrument else None
                if not symbol or symbol not in self._prices:
                    continue

                tick = self._prices[symbol]
                try:
                    bid = Decimal(str(tick["bid"]))
                    ask = Decimal(str(tick["ask"]))
                except (KeyError, ValueError) as e:
                    logger.warning("Bad tick for %s: %s", symbol, e)
                    continue
                side = _side_val(pos.side)

                triggered = None

                # Trigger purely on the exit-side quote crossing the level. The
                # old "SL must be below open price for BUY" check broke trailing
                # stops moved into profit (move-to-breakeven) — the engine would
                # see the trail above open and silently never fire. The modify
                # endpoint already rejects an SL/TP that would trigger on the
                # spot, so we don't need a second open-vs-level guard here.
                if pos.stop_loss:
                    sl = Decimal(str(pos.stop_loss))
                    if side == "buy" and bid <= sl:
                        triggered = "sl"
                    elif side == "sell" and ask >= sl:
                        triggered = "sl"

                if not triggered and pos.take_profit:
                    tp = Decimal(str(pos.take_profit))
                    if side == "buy" and bid >= tp:
                        triggered = "tp"
                    elif side == "sell" and ask <= tp:
                        triggered = "tp"

                if not triggered:
                    continue

                # Close at the SL/TP price itself (not market price) — MT5 behavior
                close_price = Decimal(str(pos.stop_loss)) if triggered == "sl" else Decimal(str(pos.take_profit))

                logger.info(
                    "SL/TP trigger detected: position=%s symbol=%s side=%s reason=%s close_price=%s",
                    pos.id, symbol, side, triggered, close_price,
                )

                # Step 1 — DB writes only. Build side-effect payload.
                side_effects: dict[str, Any] | None = None
                try:
                    side_effects = await self._persist_close(db, pos, close_price, triggered)
                    await db.commit()
                    logger.info(
                        "SL/TP persisted: position=%s reason=%s profit=%s",
                        pos.id, triggered, side_effects["profit"],
                    )
                except Exception as e:
                    logger.error(
                        "SL/TP persist failed for position=%s reason=%s: %s",
                        pos.id, triggered, e, exc_info=True,
                    )
                    try:
                        await db.rollback()
                    except Exception:
                        pass
                    continue  # next position; commit failed so nothing to side-effect

                # Step 2 — fire-and-forget side effects. Failures here cannot
                # roll back the already-committed close.
                if side_effects is not None:
                    asyncio.create_task(self._post_close_side_effects(side_effects))

    async def _persist_close(
        self, db: AsyncSession, pos: Position, close_price: Decimal, reason: str,
    ) -> dict[str, Any]:
        """Atomically update position + insert history + insert transaction.

        Caller commits. Returns a serializable dict describing the close, used
        afterwards by `_post_close_side_effects` to do redis publish,
        notification, and A-book forward — all without holding an open
        transaction.
        """
        side = _side_val(pos.side)
        contract_size = pos.instrument.contract_size if pos.instrument else Decimal("100000")
        symbol = pos.instrument.symbol if pos.instrument else None

        # Load account first to get currency for P&L conversion
        acct_result = await db.execute(
            select(TradingAccount).where(TradingAccount.id == pos.account_id)
        )
        account = acct_result.scalar_one_or_none()

        from ..services.trading_service import quote_to_account_pnl
        from packages.common.src.fx_utils import get_usd_to_account_rate
        acct_currency = (account.currency if account else "USD") or "USD"
        fx_rate = await get_usd_to_account_rate(acct_currency)

        if side == "buy":
            profit = (close_price - pos.open_price) * pos.lots * contract_size
        else:
            profit = (pos.open_price - close_price) * pos.lots * contract_size
        profit = quote_to_account_pnl(
            profit,
            getattr(pos.instrument, "base_currency", None),
            getattr(pos.instrument, "quote_currency", None),
            close_price,
            symbol=symbol,
            account_currency=acct_currency,
            usd_inr_rate=fx_rate,
        )

        now = datetime.now(timezone.utc)

        pos.status = PositionStatus.CLOSED.value
        pos.close_price = close_price
        pos.profit = profit
        pos.closed_at = now
        pos.comment = f"Auto-closed by {reason.upper()}"
        balance_after_for_tx: Decimal | None = None
        is_demo = True
        user_id = None
        if account:
            user_id = account.user_id
            is_demo = bool(account.is_demo)
            from ..services.trading_service import apply_position_pnl, recompute_account_margin
            try:
                balance_after_for_tx = await apply_position_pnl(db, account, account.user_id, profit)
            except Exception as e:
                logger.error(
                    "apply_position_pnl failed for position=%s; falling back to direct credit: %s",
                    pos.id, e,
                )
                account.balance = (account.balance or Decimal("0")) + profit
                balance_after_for_tx = account.balance
            # Flush so the just-closed position is visible to the recompute query,
            # then rebuild margin_used as the SUM of remaining open positions —
            # eliminates subtractive-drift bug.
            await db.flush()
            await recompute_account_margin(db, account)

        # History — defensive defaults so missing fields can't NULL-violate
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
            profit=profit,
            close_reason=reason,
            opened_at=pos.created_at or now,
            closed_at=now,
        )
        db.add(history)
        await db.flush()  # populate history.id for IB idempotency key in side-effects

        db.add(Transaction(
            user_id=user_id if user_id else pos.account_id,
            account_id=pos.account_id,
            type="profit" if profit >= 0 else "loss",
            amount=profit,
            balance_after=balance_after_for_tx,
            reference_id=pos.id,
            description=(
                f"{reason.upper()} hit: {symbol or ''} {side} {pos.lots} lots @ {close_price}"
            ),
        ))

        return {
            "position_id": str(pos.id),
            "account_id": str(pos.account_id),
            "user_id": user_id,
            "is_demo": is_demo,
            "symbol": symbol or "?",
            "side": side,
            "lots": float(pos.lots),
            "close_price": float(close_price),
            "profit": float(profit),
            "reason": reason,
            "trade_history_id": str(history.id),
            "trader_commission": float(pos.commission or Decimal("0")),
        }

    async def _post_close_side_effects(self, payload: dict[str, Any]):
        """Fire-and-forget post-commit work: redis publish, notification, A-book.

        Each side effect is wrapped so one failure can't cascade. The DB write
        for the close has already committed by the time this runs, so nothing
        we do here can lose the TradeHistory row.
        """
        # 1. Redis publish — UI live update
        try:
            await redis_client.publish(
                f"account:{payload['account_id']}",
                json.dumps({
                    # Suffix the reason (…_tp / …_sl) so the client's reason/sound
                    # logic recognises it — it matches on "position_closed_<reason>".
                    # Matches the b-book engine's event format too.
                    "type": f"position_closed_{payload['reason']}",
                    "position_id": payload["position_id"],
                    "reason": payload["reason"],
                    "profit": str(payload["profit"]),
                    "close_price": str(payload["close_price"]),
                }),
            )
        except Exception as exc:
            logger.warning("SL/TP redis publish failed: %s", exc)

        # 2. Notification — uses its own session so a DB hiccup here cannot
        #    affect the already-committed close.
        if payload["user_id"]:
            try:
                async with AsyncSessionLocal() as bg_db:
                    profit = payload["profit"]
                    pnl_str = f"+${profit:.2f}" if profit >= 0 else f"-${abs(profit):.2f}"
                    reason_label = "Stop Loss" if payload["reason"] == "sl" else "Take Profit"
                    await create_notification(
                        bg_db, payload["user_id"],
                        title=f"{reason_label} Hit — {payload['symbol']}",
                        message=(
                            f"{payload['side'].upper()} {payload['lots']} lots closed @ "
                            f"{payload['close_price']} | P&L: {pnl_str}"
                        ),
                        notif_type="trade",
                        action_url="/trading",
                    )
                    await bg_db.commit()
            except Exception as exc:
                logger.warning("SL/TP notification failed: %s", exc)

        # 3. A-Book LP forwarding disabled — every SL/TP fill is settled on
        # the internal b-book engine using the platform's own ticks (Infoway
        # feed). The book_type column survives only for admin reporting.

        # 4. IB commission distribution — only on close (open path doesn't pay).
        # Demo + missing user_id are filtered inside the engine.
        if payload.get("trade_history_id") and payload["user_id"]:
            try:
                from uuid import UUID as _UUID
                from .ib_engine import distribute_ib_commission
                async with AsyncSessionLocal() as bg_db:
                    await distribute_ib_commission(
                        bg_db,
                        trader_user_id=payload["user_id"],
                        source_trade_id=_UUID(payload["trade_history_id"]),
                        lots=Decimal(str(payload["lots"])),
                        instrument_symbol=payload["symbol"],
                        is_demo=bool(payload["is_demo"]),
                        trader_commission_charged=Decimal(str(payload.get("trader_commission", 0))),
                    )
                    await bg_db.commit()
            except Exception as exc:
                logger.error("IB commission distribute failed on SL/TP close: %s", exc)

        logger.info(
            "SL/TP closed: %s %s %s lots @ %s reason=%s profit=%s",
            payload["symbol"], payload["side"], payload["lots"],
            payload["close_price"], payload["reason"], payload["profit"],
        )


sltp_engine = SLTPEngine()
