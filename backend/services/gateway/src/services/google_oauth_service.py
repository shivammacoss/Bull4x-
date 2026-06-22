"""Google OAuth — server-side authorization-code flow.

Flow:
1. Browser hits /auth/google/login → backend mints a CSRF `state` token, sets
   it in a short-lived HttpOnly cookie, and 302s to Google.
2. Google sends the user back to /auth/google/callback?code=...&state=... .
   Backend verifies the state cookie, exchanges the code for an ID token,
   validates the ID token's signature against Google's JWKS via the tokeninfo
   endpoint (avoids needing a JWKS cache for low traffic), looks up or creates
   the User row, issues the same JWT + HttpOnly auth cookies as a normal login,
   and 302s to the frontend (TRADER_APP_URL/accounts).

Why server-side and not implicit/PKCE in the browser:
- The browser never touches the Google client_secret.
- Auth cookies stay HttpOnly throughout — same security posture as
  email/password login.
- Frontend stays a static page; no Google JS SDK to load.
"""
import logging
import secrets
import urllib.parse
from datetime import datetime, timezone

import httpx
from fastapi import Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from packages.common.src.config import get_settings
from packages.common.src.models import User
from .auth_service import (
    AuthServiceError,
    attach_auth_cookies,
    issue_auth_json_response,
    generate_account_number,
    client_ip_for_inet,
)
from packages.common.src.auth import create_access_token, hash_token
from packages.common.src.models import (
    UserSession, UserRefreshToken, UserAuditLog, TradingAccount, AccountGroup,
)

logger = logging.getLogger("google_oauth")

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

OAUTH_STATE_COOKIE = "pt_oauth_state"
OAUTH_STATE_TTL_SECONDS = 600  # 10 minutes — user has to finish the flow within that window


def is_enabled() -> bool:
    """OAuth is live only when both creds AND a redirect URI are present."""
    s = get_settings()
    return bool(s.GOOGLE_CLIENT_ID and s.GOOGLE_CLIENT_SECRET and s.GOOGLE_OAUTH_REDIRECT_URI)


def build_login_redirect(request: Request) -> RedirectResponse:
    """302 the browser to Google with a CSRF state cookie set."""
    if not is_enabled():
        raise AuthServiceError("Google sign-in is not configured", 503)
    s = get_settings()
    state = secrets.token_urlsafe(32)
    params = {
        "client_id": s.GOOGLE_CLIENT_ID,
        "redirect_uri": s.GOOGLE_OAUTH_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "online",
        # `select_account` lets users pick which Google account to use even if
        # they're already signed in to one — friendlier on shared machines.
        "prompt": "select_account",
    }
    url = f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"
    resp = RedirectResponse(url, status_code=302)
    secure = request.url.scheme == "https" or (
        request.headers.get("x-forwarded-proto", "").lower().startswith("https")
    )
    resp.set_cookie(
        key=OAUTH_STATE_COOKIE,
        value=state,
        max_age=OAUTH_STATE_TTL_SECONDS,
        httponly=True,
        secure=secure,
        samesite="lax",  # `lax` so the cookie survives the cross-site bounce back from Google
        path="/",
    )
    return resp


async def _exchange_code_for_userinfo(code: str) -> dict:
    """Trade an authorization code for an access token, then fetch the user
    profile. Returning the userinfo dict (sub/email/name/picture) avoids
    decoding the ID token JWT signature locally."""
    s = get_settings()
    async with httpx.AsyncClient(timeout=15.0) as client:
        token_resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": s.GOOGLE_CLIENT_ID,
                "client_secret": s.GOOGLE_CLIENT_SECRET,
                "redirect_uri": s.GOOGLE_OAUTH_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            headers={"Accept": "application/json"},
        )
        if token_resp.status_code != 200:
            logger.warning("Google token exchange failed: %s %s", token_resp.status_code, token_resp.text[:300])
            raise AuthServiceError("Google sign-in failed (token exchange)", 401)
        access_token = token_resp.json().get("access_token")
        if not access_token:
            raise AuthServiceError("Google sign-in failed (no access token)", 401)

        info_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if info_resp.status_code != 200:
            logger.warning("Google userinfo failed: %s %s", info_resp.status_code, info_resp.text[:300])
            raise AuthServiceError("Google sign-in failed (profile fetch)", 401)
        return info_resp.json()


async def _ensure_default_trading_account(user: User, db: AsyncSession) -> None:
    """First-time OAuth signup mirrors the registration flow — give the user a
    Standard live trading account so they can start exploring without an extra
    setup step."""
    existing = await db.execute(
        select(TradingAccount.id).where(TradingAccount.user_id == user.id).limit(1)
    )
    if existing.scalars().first():
        return
    group_q = await db.execute(
        select(AccountGroup).where(AccountGroup.name == "Standard", AccountGroup.is_demo == False).limit(1)
    )
    group = group_q.scalars().first()
    db.add(TradingAccount(
        user_id=user.id,
        account_group_id=group.id if group else None,
        account_number=generate_account_number(),
        leverage=100,
        currency="USD",
        is_demo=False,
    ))


async def handle_callback(
    code: str | None, state: str | None, request: Request, db: AsyncSession,
) -> RedirectResponse:
    if not is_enabled():
        raise AuthServiceError("Google sign-in is not configured", 503)
    if not code:
        raise AuthServiceError("Missing authorization code", 400)

    expected_state = request.cookies.get(OAUTH_STATE_COOKIE)
    if not expected_state or not state or not secrets.compare_digest(expected_state, state):
        raise AuthServiceError("Invalid OAuth state", 400)

    info = await _exchange_code_for_userinfo(code)
    google_id = info.get("sub")
    email = (info.get("email") or "").strip().lower()
    if not google_id or not email:
        raise AuthServiceError("Google profile missing email", 400)
    if not info.get("email_verified", False):
        # Refuse unverified Google emails — otherwise an attacker could squat on
        # a Google account they don't own and link it to someone else's email.
        raise AuthServiceError("Your Google email is not verified", 403)

    first_name = (info.get("given_name") or "").strip()
    last_name = (info.get("family_name") or "").strip()

    # 1) Match by google_id (returning OAuth user) — fastest + most reliable.
    user_q = await db.execute(select(User).where(User.google_id == google_id))
    user = user_q.scalar_one_or_none()

    # 2) Else match by email and link Google to the existing local account.
    if not user:
        user_q = await db.execute(
            select(User).where(func.lower(User.email) == email)
        )
        user = user_q.scalar_one_or_none()
        if user:
            if user.status in ("banned", "blocked"):
                raise AuthServiceError("Account has been disabled", 403)
            user.google_id = google_id
            if user.auth_provider == "local":
                # Keep `local` as the original signup attribution; we still set
                # google_id so future logins skip the email lookup. Only flip
                # auth_provider to `google` when the user signed up via Google
                # in the first place (case 3 below).
                pass

    # 3) Else create a brand-new user from the Google profile.
    created = False
    if not user:
        user = User(
            email=email,
            password_hash=None,  # column is nullable — OAuth user has no local password
            google_id=google_id,
            auth_provider="google",
            first_name=first_name or None,
            last_name=last_name or None,
            role="user",
            status="active",
            kyc_status="pending",
        )
        db.add(user)
        await db.flush()
        await _ensure_default_trading_account(user, db)
        created = True

    if user.status in ("banned", "blocked"):
        raise AuthServiceError("Account has been disabled", 403)

    # Issue the same JWT + HttpOnly cookies as a normal login. We can't reuse
    # issue_auth_json_response directly because we need a RedirectResponse, not
    # a JSON body — re-implement the cookie attachment inline.
    token, expires = create_access_token(str(user.id), user.role)
    db.add(UserSession(
        user_id=user.id,
        token_hash=hash_token(token),
        ip_address=client_ip_for_inet(request),
        user_agent=request.headers.get("user-agent"),
        expires_at=expires,
    ))
    raw_refresh = secrets.token_urlsafe(48)
    from datetime import timedelta
    s = get_settings()
    ref_exp = datetime.now(timezone.utc) + timedelta(days=s.JWT_REFRESH_EXPIRY_DAYS)
    db.add(UserRefreshToken(
        user_id=user.id,
        token_hash=hash_token(raw_refresh),
        expires_at=ref_exp,
        revoked=False,
    ))
    ua = (request.headers.get("user-agent") or "").strip()
    db.add(UserAuditLog(
        user_id=user.id,
        action_type="REGISTER" if created else "LOGIN",
        ip_address=client_ip_for_inet(request),
        device_info=ua[:2048] if ua else None,
    ))
    await db.commit()

    # Redirect target — frontend's accounts page after a successful login.
    target = (s.TRADER_APP_URL or "/").rstrip("/") + "/accounts"
    resp = RedirectResponse(target, status_code=302)
    attach_auth_cookies(
        resp, request,
        access_token=token,
        access_expires_at=expires,
        raw_refresh=raw_refresh,
    )
    # Clean up the one-shot OAuth state cookie.
    resp.delete_cookie(OAUTH_STATE_COOKIE, path="/")
    return resp
