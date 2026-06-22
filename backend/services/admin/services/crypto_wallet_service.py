"""Admin Crypto Wallet Service — CRUD for manual-crypto deposit addresses.

The QR shown to users is generated client-side from `address`, so there is no
image upload/storage here — admin only enters coin, network and address.
"""
import uuid

from fastapi import HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from packages.common.src.models import CryptoWallet
from packages.common.src.admin_schemas import CryptoWalletIn
from dependencies import write_audit_log


def _serialize(w: CryptoWallet) -> dict:
    return {
        "id": str(w.id),
        "coin": w.coin,
        "network": w.network,
        "address": w.address,
        "is_active": w.is_active,
        "sort_order": w.sort_order or 0,
        "created_at": w.created_at.isoformat() if w.created_at else None,
    }


async def list_crypto_wallets(db: AsyncSession) -> list:
    result = await db.execute(
        select(CryptoWallet).order_by(CryptoWallet.sort_order, CryptoWallet.created_at)
    )
    return [_serialize(w) for w in result.scalars().all()]


def _clean(body: CryptoWalletIn) -> tuple[str, str, str]:
    coin = (body.coin or "").strip().upper()
    network = (body.network or "").strip()
    address = (body.address or "").strip()
    if not coin or not network or not address:
        raise HTTPException(status_code=400, detail="Coin, network and address are required")
    return coin, network, address


async def create_crypto_wallet(
    body: CryptoWalletIn, admin_id: uuid.UUID, ip_address: str | None, db: AsyncSession,
) -> dict:
    coin, network, address = _clean(body)
    wallet = CryptoWallet(
        coin=coin, network=network, address=address,
        is_active=body.is_active, sort_order=body.sort_order or 0,
    )
    db.add(wallet)
    await db.flush()
    await write_audit_log(
        db, admin_id, "create_crypto_wallet", "crypto_wallet", wallet.id,
        new_values={"coin": coin, "network": network, "address": address},
        ip_address=ip_address,
    )
    await db.commit()
    return {"message": "Crypto wallet created", "id": str(wallet.id)}


async def update_crypto_wallet(
    wallet_id: uuid.UUID, body: CryptoWalletIn, admin_id: uuid.UUID,
    ip_address: str | None, db: AsyncSession,
) -> dict:
    result = await db.execute(select(CryptoWallet).where(CryptoWallet.id == wallet_id))
    wallet = result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(status_code=404, detail="Crypto wallet not found")
    coin, network, address = _clean(body)
    old_values = {"coin": wallet.coin, "network": wallet.network, "address": wallet.address}
    wallet.coin = coin
    wallet.network = network
    wallet.address = address
    wallet.is_active = body.is_active
    wallet.sort_order = body.sort_order or 0
    await write_audit_log(
        db, admin_id, "update_crypto_wallet", "crypto_wallet", wallet_id,
        old_values=old_values,
        new_values={"coin": coin, "network": network, "address": address},
        ip_address=ip_address,
    )
    await db.commit()
    return {"message": "Crypto wallet updated"}


async def delete_crypto_wallet(
    wallet_id: uuid.UUID, admin_id: uuid.UUID, ip_address: str | None, db: AsyncSession,
) -> dict:
    result = await db.execute(select(CryptoWallet).where(CryptoWallet.id == wallet_id))
    wallet = result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(status_code=404, detail="Crypto wallet not found")
    snapshot = {"coin": wallet.coin, "network": wallet.network, "address": wallet.address}
    await db.execute(delete(CryptoWallet).where(CryptoWallet.id == wallet_id))
    await write_audit_log(
        db, admin_id, "delete_crypto_wallet", "crypto_wallet", wallet_id,
        old_values=snapshot, new_values={"deleted": True}, ip_address=ip_address,
    )
    await db.commit()
    return {"message": "Crypto wallet removed"}
