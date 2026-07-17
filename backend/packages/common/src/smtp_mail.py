"""Optional transactional email via SMTP (Gmail, SES, Mailgun SMTP, etc.)."""
from __future__ import annotations

import asyncio
import logging
import smtplib
from email.message import EmailMessage

from .config import get_settings

logger = logging.getLogger(__name__)


def smtp_configured() -> bool:
    s = get_settings()
    return bool(s.SMTP_HOST and str(s.SMTP_HOST).strip())


def _send_plain_sync(to_email: str, subject: str, body_text: str, body_html: str | None = None) -> None:
    s = get_settings()
    msg = EmailMessage()
    msg["Subject"] = subject
    from_addr = (s.SMTP_FROM or s.SMTP_USER or "").strip()
    if not from_addr:
        raise ValueError("SMTP_FROM or SMTP_USER must be set when SMTP_HOST is set")
    msg["From"] = from_addr
    msg["To"] = to_email
    # multipart/alternative: text first, HTML second. Clients pick the last part
    # they can render, so HTML wins where supported and text is the fallback.
    msg.set_content(body_text)
    if body_html:
        msg.add_alternative(body_html, subtype="html")

    host = str(s.SMTP_HOST).strip()
    port = int(s.SMTP_PORT)
    user = (s.SMTP_USER or "").strip()
    pwd = (s.SMTP_PASSWORD or "").strip()

    # Port 465 speaks TLS from the first byte (SMTP_SSL); 587 connects in the
    # clear and upgrades via STARTTLS. Using the wrong one just hangs.
    if port == 465:
        with smtplib.SMTP_SSL(host, port, timeout=30) as server:
            if user:
                server.login(user, pwd)
            server.send_message(msg)
        return

    with smtplib.SMTP(host, port, timeout=30) as server:
        if s.SMTP_USE_TLS:
            server.starttls()
        if user:
            server.login(user, pwd)
        server.send_message(msg)


async def send_password_reset_email(to_email: str, reset_link: str, *, app_name: str = "Bull4x") -> bool:
    """Send reset email. Returns True if sent, False if SMTP not configured or send failed."""
    if not smtp_configured():
        return False
    from . import email_templates

    subject = f"Reset your {app_name} password"
    html, text = email_templates.password_reset(reset_link)
    try:
        await asyncio.to_thread(_send_plain_sync, to_email, subject, text, html)
        return True
    except Exception:
        logger.exception("Failed to send password reset email to %s", to_email)
        return False


async def send_password_reset_otp(to_email: str, otp: str, *, app_name: str = "Bull4x") -> bool:
    """Send a 6-digit password-reset OTP (used by the mobile app). Returns True if sent."""
    if not smtp_configured():
        return False
    from . import email_templates

    subject = f"Your {app_name} verification code"
    html, text = email_templates.password_reset_otp(otp)
    try:
        await asyncio.to_thread(_send_plain_sync, to_email, subject, text, html)
        return True
    except Exception:
        logger.exception("Failed to send password reset OTP to %s", to_email)
        return False
