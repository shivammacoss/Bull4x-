"""Wallet API — Deposits, Withdrawals, Transactions."""
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Body, Depends, File, Form, Query, UploadFile
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from packages.common.src.database import get_db
from packages.common.src.schemas import (
    DepositRequest,
    InternalWalletTransferRequest,
    TransferMainToTradingRequest,
    TransferTradingToMainRequest,
    WithdrawalRequest,
)
from packages.common.src.auth import get_current_user
from ..services import wallet_service

router = APIRouter()


@router.post("/deposit", status_code=201)
async def create_deposit(
    req: DepositRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await wallet_service.create_deposit(
        req=req, user_id=current_user["user_id"], db=db,
    )


@router.post("/deposit/manual", status_code=201)
async def create_manual_deposit(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    account_id: Optional[UUID] = Form(default=None),
    amount: Decimal = Form(...),
    transaction_id: str = Form(...),
    file: UploadFile = File(...),
    crypto_wallet_id: Optional[UUID] = Form(default=None),
):
    """Manual deposit (uploads proof + reference). If crypto_wallet_id is set the
    user paid into an admin crypto wallet; otherwise it's a bank/UPI deposit."""
    return await wallet_service.create_manual_deposit(
        user_id=current_user["user_id"],
        account_id=account_id, amount=amount,
        transaction_id=transaction_id, file=file, db=db,
        crypto_wallet_id=crypto_wallet_id,
    )


@router.get("/crypto-wallets")
async def list_crypto_wallets(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Active admin crypto deposit wallets (coin/network/address) for the user to pay into."""
    return await wallet_service.list_crypto_wallets(db=db)


@router.post("/withdraw", status_code=201)
async def create_withdrawal(
    req: WithdrawalRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await wallet_service.create_withdrawal(
        req=req, user_id=current_user["user_id"], db=db,
    )


@router.post("/withdraw/manual", status_code=201)
async def create_manual_withdrawal(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    amount: Decimal = Form(...),
    upi_id: str = Form(default=""),
    bank_name: str = Form(default=""),
    crypto_address: str = Form(default=""),
    crypto_network: str = Form(default=""),
    file: UploadFile | None = File(default=None),
):
    """Manual payout. Crypto: user provides their wallet address + network + QR image.
    Bank/UPI: user provides UPI ID + bank name (and/or a QR image). Finance processes (main wallet)."""
    return await wallet_service.create_manual_withdrawal(
        user_id=current_user["user_id"],
        amount=amount, upi_id=upi_id, bank_name=bank_name,
        crypto_address=crypto_address, crypto_network=crypto_network,
        file=file, db=db,
    )


@router.post("/transfer-internal", status_code=200)
async def internal_wallet_transfer(
    req: InternalWalletTransferRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Move funds between the user's own live trading accounts (available balance only)."""
    return await wallet_service.internal_wallet_transfer(
        req=req, user_id=current_user["user_id"], db=db,
    )


@router.post("/transfer-trading-to-main", status_code=200)
async def transfer_trading_to_main(
    req: TransferTradingToMainRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Move available balance from a live trading account into the user's main wallet."""
    return await wallet_service.transfer_trading_to_main(
        req=req, user_id=current_user["user_id"], db=db,
    )


@router.post("/transfer-main-to-trading", status_code=200)
async def transfer_main_to_trading(
    req: TransferMainToTradingRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fund a live trading account from the main wallet."""
    return await wallet_service.transfer_main_to_trading(
        req=req, user_id=current_user["user_id"], db=db,
    )


@router.get("/fx-rate")
async def get_fx_rate(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Live USD→INR rate (cached) for UPI deposit/withdraw conversion display.

    Hardcoded to USD→INR for now — the UPI tab is India-only. Generalize to
    arbitrary pairs (?from=&to=) in a later phase if EUR/GBP fiat methods land.
    """
    return await wallet_service.get_usd_inr_rate(db=db)


@router.get("/payment-limits")
async def get_payment_limits(
    current_user: dict = Depends(get_current_user),
):
    """Per-side min/max amounts the admin has configured.

    Returned as floats; a value of 0 means "no limit on that side", same
    convention the gateway validator uses. Frontend renders hints below
    the amount inputs and pre-validates before the user hits Submit, so
    they never have to discover the bounds by getting rejected.
    """
    from packages.common.src.settings_store import get_float_setting
    return {
        "deposit_min": await get_float_setting("deposit_min", 0.0),
        "deposit_max": await get_float_setting("deposit_max", 0.0),
        "withdrawal_min": await get_float_setting("withdrawal_min", 0.0),
        "withdrawal_max": await get_float_setting("withdrawal_max", 0.0),
    }


@router.get("/deposits")
async def list_deposits(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await wallet_service.list_deposits(
        user_id=current_user["user_id"], db=db,
    )


@router.get("/withdrawals")
async def list_withdrawals(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await wallet_service.list_withdrawals(
        user_id=current_user["user_id"], db=db,
    )


@router.get("/transactions")
async def list_transactions(
    account_id: UUID | None = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await wallet_service.list_transactions(
        user_id=current_user["user_id"], account_id=account_id, db=db,
    )


@router.get("/summary")
async def wallet_summary(
    account_id: UUID | None = Query(
        None,
        description="Scope trading balance/equity to one live account. Main wallet + deposit/withdraw totals are always user-wide.",
    ),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Main wallet holds funds for external deposit/withdraw; live trading accounts hold trading balance."""
    return await wallet_service.wallet_summary(
        user_id=current_user["user_id"], account_id=account_id, db=db,
    )


class DepositBankDetailsRequest(BaseModel):
    """Optional amount picks a bank account tier (min/max)."""

    amount: Decimal | None = None


@router.post("/deposit/bank-details")
async def get_deposit_bank_details(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    body: DepositBankDetailsRequest | None = Body(default=None),
):
    """Return an active bank account for manual deposits (details + QR URL from admin)."""
    return await wallet_service.get_deposit_bank_details(
        amount=body.amount if body else None, db=db,
    )


@router.get("/bank-info")
async def get_bank_info(
    amount: Decimal = Query(..., gt=0),
    db: AsyncSession = Depends(get_db),
):
    return await wallet_service.get_bank_info(amount=amount, db=db)
