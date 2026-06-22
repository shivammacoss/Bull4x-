import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from packages.common.src.database import get_db
from dependencies import require_permission
from packages.common.src.models import User
from packages.common.src.admin_schemas import CryptoWalletIn
from services import crypto_wallet_service

router = APIRouter(prefix="/crypto-wallets", tags=["Crypto Wallets"])


@router.get("")
async def list_crypto_wallets(
    admin: User = Depends(require_permission("banks.view")),
    db: AsyncSession = Depends(get_db),
):
    return await crypto_wallet_service.list_crypto_wallets(db=db)


@router.post("")
async def create_crypto_wallet(
    body: CryptoWalletIn,
    request: Request,
    admin: User = Depends(require_permission("banks.create")),
    db: AsyncSession = Depends(get_db),
):
    return await crypto_wallet_service.create_crypto_wallet(
        body=body, admin_id=admin.id,
        ip_address=request.client.host if request.client else None, db=db,
    )


@router.put("/{wallet_id}")
async def update_crypto_wallet(
    wallet_id: uuid.UUID,
    body: CryptoWalletIn,
    request: Request,
    admin: User = Depends(require_permission("banks.update")),
    db: AsyncSession = Depends(get_db),
):
    return await crypto_wallet_service.update_crypto_wallet(
        wallet_id=wallet_id, body=body, admin_id=admin.id,
        ip_address=request.client.host if request.client else None, db=db,
    )


@router.delete("/{wallet_id}")
async def delete_crypto_wallet(
    wallet_id: uuid.UUID,
    request: Request,
    admin: User = Depends(require_permission("banks.update")),
    db: AsyncSession = Depends(get_db),
):
    return await crypto_wallet_service.delete_crypto_wallet(
        wallet_id=wallet_id, admin_id=admin.id,
        ip_address=request.client.host if request.client else None, db=db,
    )
