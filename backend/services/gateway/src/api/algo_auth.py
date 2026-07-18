"""Shared auth for the algo / desktop-terminal API.

Two ways to authenticate every algo endpoint:
  1. Bot style — X-Api-Key + X-Api-Secret (one key = one trading account).
  2. Terminal style — Authorization: Bearer <JWT> + X-Account-Id (a logged-in
     user picks which of THEIR accounts to act on; the account is verified to
     belong to the token's user).

The desktop terminal logs in with email/password (see /terminal/login), stores
the JWT, and switches accounts by changing X-Account-Id.
"""
import hashlib
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select

from packages.common.src.database import AsyncSessionLocal
from packages.common.src.models import AlgoApiKey, TradingAccount
from packages.common.src.auth import decode_token


def hash_secret(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def bearer(authorization: str) -> str:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    return ""


async def _account_for_key(x_api_key: str, x_api_secret: str, db) -> TradingAccount:
    key_q = await db.execute(
        select(AlgoApiKey).where(AlgoApiKey.api_key == x_api_key, AlgoApiKey.is_active == True)
    )
    key_row = key_q.scalar_one_or_none()
    if not key_row or key_row.secret_hash != hash_secret(x_api_secret):
        raise HTTPException(status_code=401, detail="Invalid API credentials")
    account = await db.get(TradingAccount, key_row.account_id)
    if not account or not account.is_active:
        raise HTTPException(status_code=403, detail="Trading account is inactive")
    return account, key_row


async def _account_for_jwt(authorization: str, x_account_id: str, db) -> TradingAccount:
    payload = decode_token(bearer(authorization))     # raises 401 on bad/expired
    uid = str(payload.get("sub"))
    if not x_account_id:
        raise HTTPException(status_code=400, detail="X-Account-Id header required")
    try:
        acc_uuid = UUID(x_account_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid X-Account-Id")
    account = await db.get(TradingAccount, acc_uuid)
    if not account or str(account.user_id) != uid or not account.is_active:
        raise HTTPException(status_code=403, detail="Account not found or not yours")
    return account


async def resolve_account(x_api_key: str, x_api_secret: str,
                          authorization: str, x_account_id: str, db):
    """Return (account, key_row_or_None) for an account-scoped endpoint."""
    if x_api_key and x_api_secret:
        return await _account_for_key(x_api_key, x_api_secret, db)
    if bearer(authorization):
        return await _account_for_jwt(authorization, x_account_id, db), None
    raise HTTPException(status_code=401, detail="Missing X-Api-Key or Authorization")


async def resolve_user(x_api_key: str, x_api_secret: str, authorization: str, db) -> None:
    """Validate for a market-data endpoint (no account needed). Raises on failure."""
    if x_api_key and x_api_secret:
        key_q = await db.execute(
            select(AlgoApiKey).where(AlgoApiKey.api_key == x_api_key, AlgoApiKey.is_active == True)
        )
        key_row = key_q.scalar_one_or_none()
        if not key_row or key_row.secret_hash != hash_secret(x_api_secret):
            raise HTTPException(status_code=401, detail="Invalid API credentials")
        return
    if bearer(authorization):
        decode_token(bearer(authorization))           # raises 401 on bad/expired
        return
    raise HTTPException(status_code=401, detail="Missing X-Api-Key or Authorization")
