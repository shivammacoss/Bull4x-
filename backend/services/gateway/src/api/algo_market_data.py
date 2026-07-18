"""Algo Market Data — Public endpoints for external algo bots to consume LP prices.

REST:
  GET /api/algo/symbols                          — list active instruments
  GET /api/algo/price?symbol=X                   — single-symbol snapshot
  GET /api/algo/prices?symbols=A,B               — multi-symbol snapshot
  GET /api/algo/bars?symbol=X&timeframe=1m&limit — historical OHLC bars

WebSocket (registered in main.py):
  /ws/algo/prices                                — live tick fanout

Auth: same X-Api-Key + X-Api-Secret used by /api/algo/trade.

Data sources (all shared with the internal frontend — friend's bot sees exact same prices):
  - Live snapshot:  Redis STRING  `tick:SYMBOL`              (written by publish_price)
  - Live stream:    Redis PUB/SUB `prices`                   (broadcast channel)
  - Historical:     Redis LIST    `bars:SYMBOL:TIMEFRAME`    (up to 1000 bars per key)
"""
import asyncio
import hashlib
import json
import logging
import time as _time
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Header, Query, WebSocket
from sqlalchemy import select

from packages.common.src.database import AsyncSessionLocal
from packages.common.src.models import AlgoApiKey, TradingAccount, Instrument, InstrumentSegment
from packages.common.src.redis_client import redis_client, PriceChannel

logger = logging.getLogger("algo_market_data")
router = APIRouter()

SUPPORTED_TIMEFRAMES = ("1m", "5m", "15m", "30m", "1h", "4h", "1d")

# WS close codes — 4xxx range is application-defined
WS_CLOSE_AUTH_TIMEOUT = 4001
WS_CLOSE_BAD_AUTH_MSG = 4002
WS_CLOSE_INVALID_CREDS = 4003
WS_CLOSE_ACCOUNT_INACTIVE = 4004

AUTH_TIMEOUT_SECONDS = 5
WS_HEARTBEAT_INTERVAL = 30


def _hash_secret(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


async def validate_api_credentials(api_key: str, api_secret: str,
                                   authorization: str = "") -> tuple[str, str]:
    """Validate market-data access — X-Api-Key/Secret OR Bearer JWT (desktop
    terminal login). Returns (key_id_or_empty, account_number_or_empty).
    Raises HTTPException(401/403) on failure.

    Shared by the REST handlers below and the WS handler in algo_prices_ws().
    """
    from .algo_auth import resolve_user, bearer

    if api_key and api_secret:
        secret_hash = _hash_secret(api_secret)
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(AlgoApiKey).where(
                    AlgoApiKey.api_key == api_key,
                    AlgoApiKey.is_active == True,
                )
            )
            key_row = result.scalar_one_or_none()
            if not key_row or key_row.secret_hash != secret_hash:
                raise HTTPException(status_code=401, detail="Invalid API credentials")
            account = await db.get(TradingAccount, key_row.account_id)
            if not account or not account.is_active:
                raise HTTPException(status_code=403, detail="Trading account is inactive")
            key_row.last_used_at = datetime.now(timezone.utc)
            account_number = account.account_number
            key_id = str(key_row.id)
            await db.commit()
            return key_id, account_number

    if bearer(authorization):
        async with AsyncSessionLocal() as db:
            await resolve_user("", "", authorization, db)   # raises on bad/expired JWT
        return "", ""

    raise HTTPException(status_code=401, detail="Missing X-Api-Key or Authorization")


# ---------------------------------------------------------------------------
# REST endpoints
# ---------------------------------------------------------------------------


@router.get("/symbols")
async def algo_symbols(
    x_api_key: str = Header(default="", alias="X-Api-Key"),
    x_api_secret: str = Header(default="", alias="X-Api-Secret"),
    authorization: str = Header(default="", alias="Authorization"),
):
    """List every active instrument with its trading spec.

    Intended to be called once at bot startup and cached. The response is
    authoritative — symbols missing from this list are not tradable and
    won't appear on /price, /prices, /bars, or the WS stream.
    """
    await validate_api_credentials(x_api_key, x_api_secret, authorization)

    async with AsyncSessionLocal() as db:
        q = await db.execute(
            select(Instrument, InstrumentSegment)
            .join(InstrumentSegment, Instrument.segment_id == InstrumentSegment.id, isouter=True)
            .where(Instrument.is_active == True)
            .order_by(Instrument.symbol)
        )
        rows = q.all()

    return {
        "symbols": [
            {
                "symbol": inst.symbol,
                "display_name": inst.display_name or inst.symbol,
                "category": (seg.name if seg else "other"),
                "digits": int(inst.digits or 5),
                "min_lot": float(inst.min_lot or 0.01),
                "max_lot": float(inst.max_lot or 100),
                "lot_step": float(inst.lot_step or 0.01),
                "contract_size": float(inst.contract_size or 100000),
            }
            for inst, seg in rows
        ],
        "count": len(rows),
    }


@router.get("/price")
async def algo_price(
    symbol: str = Query(..., description="Instrument symbol, e.g. XAUUSD"),
    x_api_key: str = Header(default="", alias="X-Api-Key"),
    x_api_secret: str = Header(default="", alias="X-Api-Secret"),
    authorization: str = Header(default="", alias="Authorization"),
):
    """Return the current bid/ask snapshot for one symbol."""
    await validate_api_credentials(x_api_key, x_api_secret, authorization)

    symbol_upper = symbol.upper()

    async with AsyncSessionLocal() as db:
        inst_q = await db.execute(
            select(Instrument).where(
                Instrument.symbol == symbol_upper,
                Instrument.is_active == True,
            )
        )
        if inst_q.scalar_one_or_none() is None:
            raise HTTPException(status_code=404, detail=f"Instrument {symbol_upper} not found")

    raw = await redis_client.get(PriceChannel.tick_key(symbol_upper))
    if not raw:
        raise HTTPException(status_code=503, detail=f"No price data for {symbol_upper}")

    tick = json.loads(raw)
    bid = float(tick["bid"])
    ask = float(tick["ask"])
    return {
        "symbol": symbol_upper,
        "bid": bid,
        "ask": ask,
        "spread": float(tick.get("spread", round(ask - bid, 8))),
        "timestamp": tick.get("timestamp"),
    }


@router.get("/prices")
async def algo_prices(
    symbols: Optional[str] = Query(
        default=None,
        description="Comma-separated list, e.g. 'XAUUSD,EURUSD,BTCUSD'. Omit to fetch all active instruments.",
    ),
    x_api_key: str = Header(default="", alias="X-Api-Key"),
    x_api_secret: str = Header(default="", alias="X-Api-Secret"),
    authorization: str = Header(default="", alias="Authorization"),
):
    """Return snapshots for multiple symbols in one call. Symbols with no current
    tick are omitted from the response (not an error)."""
    await validate_api_credentials(x_api_key, x_api_secret, authorization)

    async with AsyncSessionLocal() as db:
        if symbols:
            requested = [s.strip().upper() for s in symbols.split(",") if s.strip()]
            if not requested:
                raise HTTPException(status_code=400, detail="symbols must be a non-empty list")
            if len(requested) > 50:
                raise HTTPException(status_code=400, detail="symbols list cannot exceed 50 items")
            q = await db.execute(
                select(Instrument.symbol).where(
                    Instrument.symbol.in_(requested),
                    Instrument.is_active == True,
                )
            )
            known = {r[0] for r in q.all()}
            unknown = [s for s in requested if s not in known]
            if unknown:
                raise HTTPException(
                    status_code=404,
                    detail=f"Unknown instrument(s): {','.join(unknown)}",
                )
            target_symbols = [s for s in requested if s in known]
        else:
            q = await db.execute(
                select(Instrument.symbol)
                .where(Instrument.is_active == True)
                .order_by(Instrument.symbol)
            )
            target_symbols = [r[0] for r in q.all()]

    if not target_symbols:
        return {"prices": [], "count": 0}

    keys = [PriceChannel.tick_key(s) for s in target_symbols]
    raws = await redis_client.mget(keys)

    prices = []
    for sym, raw in zip(target_symbols, raws):
        if not raw:
            continue
        try:
            tick = json.loads(raw)
            bid = float(tick["bid"])
            ask = float(tick["ask"])
        except (json.JSONDecodeError, KeyError, ValueError, TypeError):
            continue
        prices.append({
            "symbol": sym,
            "bid": bid,
            "ask": ask,
            "spread": float(tick.get("spread", round(ask - bid, 8))),
            "timestamp": tick.get("timestamp"),
        })

    return {"prices": prices, "count": len(prices)}


@router.get("/bars")
async def algo_bars(
    symbol: str = Query(..., description="Instrument symbol, e.g. XAUUSD"),
    timeframe: str = Query(..., description=f"One of: {', '.join(SUPPORTED_TIMEFRAMES)}"),
    limit: int = Query(default=100, ge=1, le=1000, description="Number of bars to return (max 1000)"),
    x_api_key: str = Header(default="", alias="X-Api-Key"),
    x_api_secret: str = Header(default="", alias="X-Api-Secret"),
    authorization: str = Header(default="", alias="Authorization"),
):
    """Return historical OHLCV bars (newest first). Max 1000 bars per request.

    Bars are sourced from the same aggregator that feeds the charting frontend —
    identical OHLCV values.
    """
    await validate_api_credentials(x_api_key, x_api_secret, authorization)

    tf = timeframe.lower()
    if tf not in SUPPORTED_TIMEFRAMES:
        raise HTTPException(
            status_code=400,
            detail=f"timeframe must be one of: {', '.join(SUPPORTED_TIMEFRAMES)}",
        )

    symbol_upper = symbol.upper()
    async with AsyncSessionLocal() as db:
        inst_q = await db.execute(
            select(Instrument).where(
                Instrument.symbol == symbol_upper,
                Instrument.is_active == True,
            )
        )
        if inst_q.scalar_one_or_none() is None:
            raise HTTPException(status_code=404, detail=f"Instrument {symbol_upper} not found")

    list_key = f"bars:{symbol_upper}:{tf}"
    raws = await redis_client.lrange(list_key, 0, limit - 1)

    bars = []
    for raw in raws:
        try:
            b = json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            continue
        time_val = b.get("time")
        if isinstance(time_val, (int, float)):
            time_iso = datetime.fromtimestamp(int(time_val), tz=timezone.utc).strftime(
                "%Y-%m-%dT%H:%M:%SZ"
            )
        else:
            time_iso = str(time_val) if time_val else None
        try:
            bars.append({
                "time": time_iso,
                "open": float(b["open"]),
                "high": float(b["high"]),
                "low": float(b["low"]),
                "close": float(b["close"]),
                "volume": float(b.get("volume", 0)),
            })
        except (KeyError, ValueError, TypeError):
            continue

    # Append the current in-progress bar so the last candle stays live — mirrors
    # the web charting endpoint (instruments.py), which reads the same `bars:`
    # list plus `bar:current:`. `bars` here is newest-first.
    tf_seconds = {"1m": 60, "5m": 300, "15m": 900, "30m": 1800,
                  "1h": 3600, "4h": 14400, "1d": 86400}.get(tf, 300)
    now_epoch = int(_time.time())
    bar_start = (now_epoch // tf_seconds) * tf_seconds
    cur_iso = datetime.fromtimestamp(bar_start, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    current_raw = await redis_client.get(f"bar:current:{symbol_upper}:{tf}")
    if current_raw:
        try:
            b = json.loads(current_raw)
            bars = [x for x in bars if x.get("time") != cur_iso]
            bars.insert(0, {
                "time": cur_iso,
                "open": float(b["open"]), "high": float(b["high"]),
                "low": float(b["low"]), "close": float(b["close"]),
                "volume": float(b.get("volume", 0.0)),
            })
        except (json.JSONDecodeError, KeyError, ValueError, TypeError):
            pass

    return {
        "symbol": symbol_upper,
        "timeframe": tf,
        "bars": bars,
        "count": len(bars),
    }


@router.get("/klines")
async def algo_klines(
    symbol: str = Query(..., description="Instrument symbol, e.g. BTCUSD"),
    interval: str = Query("5m", description=f"One of: {', '.join(SUPPORTED_TIMEFRAMES)}"),
    limit: int = Query(default=500, ge=1, le=1000, description="Number of candles (max 1000)"),
    x_api_key: str = Header(default="", alias="X-Api-Key"),
    x_api_secret: str = Header(default="", alias="X-Api-Secret"),
    authorization: str = Header(default="", alias="Authorization"),
):
    """OHLCV candles in **Binance-klines format** — array of arrays.

    Authenticated variant of /klines for algo bot integrations. Same data
    source as the public /api/v1/instruments/{symbol}/klines endpoint, but
    requires `X-Api-Key` + `X-Api-Secret` headers like the rest of /api/algo/*.

    Each candle is `[open_time_ms, open, high, low, close, volume]`:

        [
          [1715432100000, 64000.5, 64100.0, 63950.0, 64050.2, 12.5],
          [1715432400000, 64050.2, 64200.0, 64000.0, 64150.8, 15.2]
        ]
    """
    await validate_api_credentials(x_api_key, x_api_secret, authorization)

    tf = interval.lower()
    if tf not in SUPPORTED_TIMEFRAMES:
        raise HTTPException(
            status_code=400,
            detail=f"interval must be one of: {', '.join(SUPPORTED_TIMEFRAMES)}",
        )

    symbol_upper = symbol.upper()
    async with AsyncSessionLocal() as db:
        inst_q = await db.execute(
            select(Instrument).where(
                Instrument.symbol == symbol_upper,
                Instrument.is_active == True,
            )
        )
        if inst_q.scalar_one_or_none() is None:
            raise HTTPException(status_code=404, detail=f"Instrument {symbol_upper} not found")

    list_key = f"bars:{symbol_upper}:{tf}"
    # lrange returns newest-first; reverse to oldest-first then take last `limit`
    raws = await redis_client.lrange(list_key, 0, limit - 1)

    out: list[list] = []
    for raw in raws:
        try:
            b = json.loads(raw)
            t = int(b.get("time", 0))
            out.append([
                t * 1000,                              # open_time_ms
                float(b["open"]),
                float(b["high"]),
                float(b["low"]),
                float(b["close"]),
                float(b.get("volume", 0.0)),
            ])
        except (json.JSONDecodeError, KeyError, ValueError, TypeError):
            continue

    # Append the current in-progress bar so the latest candle stays live
    current_raw = await redis_client.get(f"bar:current:{symbol_upper}:{tf}")
    if current_raw:
        try:
            b = json.loads(current_raw)
            # bar time bucket — start of current period
            import time as _t
            _TF_SEC = {"1m": 60, "5m": 300, "15m": 900, "30m": 1800,
                       "1h": 3600, "4h": 14400, "1d": 86400}
            sec = _TF_SEC.get(tf, 300)
            bar_start = (int(_t.time()) // sec) * sec
            bar_start_ms = bar_start * 1000
            out = [r for r in out if r[0] != bar_start_ms]
            out.append([
                bar_start_ms,
                float(b["open"]),
                float(b["high"]),
                float(b["low"]),
                float(b["close"]),
                float(b.get("volume", 0.0)),
            ])
        except Exception:
            pass

    # Sort ascending by time (Binance convention)
    out.sort(key=lambda r: r[0])
    return out


# ---------------------------------------------------------------------------
# WebSocket live stream (registered in main.py at /ws/algo/prices)
# ---------------------------------------------------------------------------


async def algo_prices_ws(websocket: WebSocket) -> None:
    """Live tick stream for algo bots — first-message auth, then broadcasts every
    tick from the Redis `prices` pub/sub channel to the client.

    Handshake:
        1. Client connects (no auth in URL/headers — avoids secret leakage to logs).
        2. Server accepts and starts a 5-second auth timer.
        3. Client sends:
               {"action": "auth", "api_key": "ak_...", "api_secret": "sk_..."}
        4. On success server replies:
               {"status": "authenticated", "account": "100245"}
           and then streams ticks:
               {"type": "tick", "symbol": "XAUUSD", "bid": ..., "ask": ..., "timestamp": "..."}

    Heartbeat: server sends `{"type": "ping"}` every 30s.

    Close codes (4xxx = application):
        4001  auth_timeout          — no first message within 5s
        4002  bad_auth_message      — malformed / missing fields
        4003  invalid_credentials   — key+secret don't match
        4004  account_inactive      — key valid but trading account disabled
    """
    await websocket.accept()

    try:
        raw = await asyncio.wait_for(websocket.receive_text(), timeout=AUTH_TIMEOUT_SECONDS)
    except (asyncio.TimeoutError, Exception):
        try:
            await websocket.close(code=WS_CLOSE_AUTH_TIMEOUT, reason="auth_timeout")
        except Exception:
            pass
        return

    try:
        msg = json.loads(raw)
        if msg.get("action") != "auth":
            raise ValueError("action must be 'auth'")
        api_key = msg.get("api_key", "") or ""
        api_secret = msg.get("api_secret", "") or ""
        token = msg.get("token", "") or ""        # desktop-terminal JWT
        if not ((api_key and api_secret) or token):
            raise ValueError("provide api_key+api_secret or token")
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        try:
            await websocket.send_json({
                "status": "error",
                "detail": "First message must be JSON: "
                          "{\"action\":\"auth\",\"api_key\":\"...\",\"api_secret\":\"...\"}",
            })
        except Exception:
            pass
        try:
            await websocket.close(code=WS_CLOSE_BAD_AUTH_MSG, reason="bad_auth_message")
        except Exception:
            pass
        return

    try:
        authz = f"Bearer {token}" if token else ""
        _, account_number = await validate_api_credentials(api_key, api_secret, authz)
    except HTTPException as exc:
        try:
            await websocket.send_json({"status": "error", "detail": exc.detail})
        except Exception:
            pass
        code = WS_CLOSE_ACCOUNT_INACTIVE if exc.status_code == 403 else WS_CLOSE_INVALID_CREDS
        try:
            await websocket.close(code=code, reason="auth_failed")
        except Exception:
            pass
        return

    await websocket.send_json({"status": "authenticated", "account": account_number})

    pubsub = redis_client.pubsub()
    await pubsub.subscribe(PriceChannel.PRICE_CHANNEL)

    try:
        last_ping = asyncio.get_event_loop().time()
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=0.1)
            if message and message.get("type") == "message":
                try:
                    tick = json.loads(message["data"])
                    tick["type"] = "tick"
                    await websocket.send_json(tick)
                except (json.JSONDecodeError, TypeError):
                    continue

            now = asyncio.get_event_loop().time()
            if now - last_ping >= WS_HEARTBEAT_INTERVAL:
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    break
                last_ping = now

            await asyncio.sleep(0.01)
    except Exception as exc:
        logger.debug("algo_prices_ws stream ended: %s", exc)
    finally:
        try:
            await pubsub.unsubscribe(PriceChannel.PRICE_CHANNEL)
            await pubsub.close()
        except Exception:
            pass
