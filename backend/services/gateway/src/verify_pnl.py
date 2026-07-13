"""One-off verifier: check floating P&L (open positions) and realized P&L
(closed trades) against the canonical calc on REAL production data.

Run inside the gateway container:
    docker compose -f docker-compose.yml -f docker-compose.prod.yml \
        exec gateway python services/gateway/src/verify_pnl.py

- Floating P&L: recomputes each open position's live P&L from the current Redis
  tick using the same calc_position_pnl the web/mobile/admin use. Shows the
  number so you can eyeball sign + magnitude.
- Realized P&L: recomputes each closed trade's P&L from its stored open/close
  prices and compares to the stored profit → MATCH / DIFF.
"""
import asyncio
import json
from decimal import Decimal

from sqlalchemy import select

from packages.common.src.database import AsyncSessionLocal
from packages.common.src.models import (
    Position, PositionStatus, TradingAccount, Instrument, TradeHistory,
)
from packages.common.src.redis_client import redis_client, PriceChannel
from packages.common.src.trading_service import calc_position_pnl
from packages.common.src.fx_utils import get_usd_to_account_rate


async def _fx(ccy: str):
    if (ccy or "USD").upper() != "INR":
        return None
    try:
        return await get_usd_to_account_rate("INR")
    except Exception:
        return None


async def verify_open(db):
    rows = (await db.execute(
        select(Position, Instrument, TradingAccount)
        .join(Instrument, Position.instrument_id == Instrument.id)
        .join(TradingAccount, Position.account_id == TradingAccount.id)
        .where(Position.status == PositionStatus.OPEN.value)
        .order_by(Position.created_at.desc())
        .limit(20)
    )).all()

    print("\n===== FLOATING P&L (open positions, live Redis price) =====")
    if not rows:
        print("  (no open positions)")
        return
    print(f"{'SYMBOL':10} {'SIDE':4} {'LOTS':>7} {'CCY':>4} {'OPEN':>11} {'CURRENT':>11} {'FLOATING P&L':>14}")
    for pos, inst, acc in rows:
        tick_raw = await redis_client.get(PriceChannel.tick_key(inst.symbol))
        if not tick_raw:
            print(f"{inst.symbol:10} {pos.side.value:4}  -- no live tick --")
            continue
        tick = json.loads(tick_raw)
        cur = Decimal(str(tick["bid"])) if pos.side.value == "buy" else Decimal(str(tick["ask"]))
        ccy = acc.currency or "USD"
        pnl = calc_position_pnl(
            pos.side, pos.open_price, cur, pos.lots,
            inst.contract_size or Decimal("100000"),
            instrument=inst, account_currency=ccy, usd_inr_rate=await _fx(ccy),
        )
        print(f"{inst.symbol:10} {pos.side.value:4} {float(pos.lots):7.2f} {ccy:>4} "
              f"{float(pos.open_price):11.5f} {float(cur):11.5f} {float(pnl):14.2f}")


async def verify_closed(db):
    rows = (await db.execute(
        select(TradeHistory, Instrument, TradingAccount)
        .join(Instrument, TradeHistory.instrument_id == Instrument.id)
        .join(TradingAccount, TradeHistory.account_id == TradingAccount.id)
        .order_by(TradeHistory.closed_at.desc())
        .limit(20)
    )).all()

    print("\n===== REALIZED P&L (closed trades, stored vs recomputed) =====")
    if not rows:
        print("  (no closed trades)")
        return
    print(f"{'SYMBOL':10} {'SIDE':4} {'LOTS':>7} {'CCY':>4} {'STORED':>12} {'RECOMPUTED':>12}  RESULT")
    ok = diff = 0
    for th, inst, acc in rows:
        ccy = acc.currency or "USD"
        recomputed = calc_position_pnl(
            th.side, th.open_price, th.close_price, th.lots,
            inst.contract_size or Decimal("100000"),
            instrument=inst, account_currency=ccy, usd_inr_rate=await _fx(ccy),
        )
        stored = float(th.profit or 0)
        rc = float(recomputed)
        # 2% or 1-cent tolerance (fees/rounding are not part of gross P&L math)
        tol = max(0.01, abs(rc) * 0.02)
        match = abs(rc - stored) <= tol
        ok, diff = (ok + 1, diff) if match else (ok, diff + 1)
        print(f"{inst.symbol:10} {th.side.value:4} {float(th.lots):7.2f} {ccy:>4} "
              f"{stored:12.2f} {rc:12.2f}  {'MATCH' if match else 'DIFF'}")
    print(f"\n  → {ok} match, {diff} diff (of {ok + diff})")


async def main():
    async with AsyncSessionLocal() as db:
        await verify_open(db)
        await verify_closed(db)
    await redis_client.close()


if __name__ == "__main__":
    asyncio.run(main())
