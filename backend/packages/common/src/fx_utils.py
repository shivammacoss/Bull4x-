"""Lightweight FX rate helper for multi-currency account support.

Reads the cached USD/INR rate from Redis (written by gateway wallet_service).
Hot paths (P&L, margin) hit Redis only. If the cache is COLD — e.g. right
after a service restart, before the wallet FX poller has run — it falls back
to a one-off live provider fetch and warms the cache, rather than hard-failing
an order with a 500.
"""
import json as _json
import logging
from decimal import Decimal

from .redis_client import redis_client
from .config import get_settings

# NOTE: httpx is imported lazily inside _fetch_live_usd_inr() — fx_utils is a
# shared package used by services that don't all bundle httpx (risk-engine,
# b-book-engine). A top-level import would crash those services on startup.

logger = logging.getLogger("fx_utils")

FX_CACHE_KEY = "fx:USD:INR"
FX_LAST_GOOD_KEY = "fx:USD:INR:last_good"

SUPPORTED_CURRENCIES = ("USD", "INR")


async def _fetch_live_usd_inr() -> Decimal | None:
    """Cold-cache fallback: pull the USD→INR raw rate straight from the FX
    providers so trading / P&L paths don't hard-fail when Redis hasn't been
    warmed yet. Best-effort — returns None only if BOTH providers fail."""
    try:
        import httpx
    except Exception:
        # Service doesn't bundle httpx (e.g. risk-engine/b-book-engine). The
        # Redis cache (warmed by gateway/market-data) is the normal path here;
        # without httpx we just can't do the cold-start live fetch.
        logger.warning("fx_utils: httpx unavailable — skipping live FX fetch fallback")
        return None
    settings = get_settings()
    # Primary: fawazahmed0 currency-api → { "usd": { "inr": 83.45, ... } }
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(settings.FX_PROVIDER_URL)
            r.raise_for_status()
            usd = (r.json() or {}).get("usd") or {}
            raw = usd.get("inr")
            if raw:
                return Decimal(str(raw))
    except Exception as e:
        logger.warning("fx_utils primary FX fetch failed: %s", e)
    # Fallback: open.er-api → { "rates": { "INR": 83.45, ... } }
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(settings.FX_PROVIDER_FALLBACK_URL)
            r.raise_for_status()
            rates = (r.json() or {}).get("rates") or {}
            raw = rates.get("INR")
            if raw:
                return Decimal(str(raw))
    except Exception as e:
        logger.warning("fx_utils fallback FX fetch failed: %s", e)
    return None


async def get_usd_to_account_rate(account_currency: str) -> Decimal:
    """Return the multiplier to convert USD → account_currency.

    Returns Decimal("1") for USD (and any non-INR) accounts.
    Returns the live raw_rate (no broker markup) for INR accounts.

    Resolution order for INR: Redis cache → last-good → live provider fetch
    (which also re-warms the cache). Raises RuntimeError only if every source
    fails — callers should treat that as "try again shortly", not a crash.
    """
    if (account_currency or "USD").upper() != "INR":
        return Decimal("1")

    cached = await redis_client.get(FX_CACHE_KEY)
    if cached:
        try:
            return Decimal(str(_json.loads(cached)["raw_rate"]))
        except Exception:
            pass

    last_good = await redis_client.get(FX_LAST_GOOD_KEY)
    if last_good:
        try:
            return Decimal(str(_json.loads(last_good)["raw_rate"]))
        except Exception:
            pass

    # Cold cache → fetch live once and warm both keys so subsequent calls
    # (and the position-close path) succeed without hard-failing the order.
    live = await _fetch_live_usd_inr()
    if live and live > 0:
        try:
            settings = get_settings()
            payload = _json.dumps({"raw_rate": str(live)})
            await redis_client.set(FX_CACHE_KEY, payload, ex=settings.FX_RATE_CACHE_TTL_SECONDS)
            await redis_client.set(FX_LAST_GOOD_KEY, payload, ex=7 * 24 * 3600)
        except Exception:
            pass
        return live

    raise RuntimeError("USD/INR FX rate unavailable (Redis cold + provider fetch failed)")
