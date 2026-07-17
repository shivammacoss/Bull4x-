"""Branded HTML email templates for Bull4x.

Email clients are not browsers: <style> blocks get stripped, flexbox/grid don't
render, and Outlook needs table layouts. So everything here is table-based with
inline styles, capped at 600px — the widest that renders reliably everywhere.

Every template goes through `render_shell()` so branding stays consistent, and
every builder returns (html, text) — the plain-text part is what shows in
clients with images/HTML disabled, so it must stand on its own.
"""
from __future__ import annotations

BRAND_NAME = "Bull4x"
SITE_URL = "https://bull4x.com"
LOGO_URL = f"{SITE_URL}/bull4x-logo.png"
SUPPORT_EMAIL = "support@bull4x.com"

# Mirrors the app's tailwind `brand` palette so mail matches the product.
NAVY = "#0b1020"
NAVY_SOFT = "#131a2e"
BLUE = "#0199c6"
BLUE_DARK = "#0158c6"
GREEN = "#81ce65"
GREEN_DARK = "#4dbe51"
TEXT = "#1a2233"
TEXT_MUTED = "#6b7688"
BORDER = "#e6e9f0"
BG = "#f4f6fa"

FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"


def _button(text: str, url: str) -> str:
    """Bulletproof CTA button — bgcolor on the <td> is what makes it show up in
    Outlook, which ignores background-color on the anchor."""
    return f"""
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0 8px 0;">
          <tr>
            <td align="center" bgcolor="{BLUE_DARK}" style="border-radius:10px;">
              <a href="{url}" target="_blank"
                 style="display:inline-block;padding:15px 38px;font-family:{FONT};
                        font-size:16px;font-weight:700;line-height:1;color:#ffffff;
                        text-decoration:none;border-radius:10px;letter-spacing:.2px;">
                {text}
              </a>
            </td>
          </tr>
        </table>"""


def render_shell(
    *,
    title: str,
    preheader: str,
    body_html: str,
    footer_note: str = "",
) -> str:
    """Wrap content in the branded frame: dark header, gradient rule, white card, footer.

    `preheader` is the grey preview line inboxes show next to the subject — it's
    hidden in the body itself, and skipping it makes clients scrape random markup.
    """
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background:{BG};">
  <div style="display:none;font-size:1px;color:{BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    {preheader}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{BG};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
               style="width:600px;max-width:100%;border-radius:16px;overflow:hidden;
                      box-shadow:0 6px 28px rgba(13,17,35,.10);">

          <!-- header -->
          <tr>
            <td align="center" bgcolor="{NAVY}" style="background:{NAVY};padding:30px 24px 24px 24px;">
              <img src="{LOGO_URL}" width="140" alt="{BRAND_NAME}"
                   style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:140px;">
            </td>
          </tr>
          <!-- gradient rule -->
          <tr>
            <td style="height:4px;line-height:4px;font-size:0;
                       background:{BLUE_DARK};
                       background-image:linear-gradient(90deg,{BLUE_DARK} 0%,{BLUE} 50%,{GREEN} 100%);">&nbsp;</td>
          </tr>

          <!-- content -->
          <tr>
            <td bgcolor="#ffffff" style="background:#ffffff;padding:38px 40px 34px 40px;font-family:{FONT};">
              {body_html}
            </td>
          </tr>

          <!-- footer -->
          <tr>
            <td bgcolor="#ffffff" style="background:#ffffff;padding:0 40px;">
              <div style="height:1px;background:{BORDER};font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td bgcolor="#ffffff" style="background:#ffffff;padding:22px 40px 34px 40px;font-family:{FONT};">
              <p style="margin:0 0 10px 0;font-size:13px;line-height:20px;color:{TEXT_MUTED};">
                {footer_note or f'Need help? Reach us at <a href="mailto:{SUPPORT_EMAIL}" style="color:{BLUE_DARK};text-decoration:none;">{SUPPORT_EMAIL}</a>.'}
              </p>
              <p style="margin:0;font-size:11px;line-height:18px;color:#9aa3b2;">
                &copy; {BRAND_NAME} &middot; <a href="{SITE_URL}" style="color:#9aa3b2;text-decoration:underline;">{SITE_URL.replace('https://','')}</a><br>
                Trading CFDs carries a high level of risk and can result in the loss of your capital.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _h1(text: str) -> str:
    return (
        f'<h1 style="margin:0 0 14px 0;font-size:24px;line-height:32px;'
        f'font-weight:700;color:{TEXT};">{text}</h1>'
    )


def _p(text: str, *, muted: bool = False, size: int = 15) -> str:
    color = TEXT_MUTED if muted else TEXT
    return (
        f'<p style="margin:0 0 14px 0;font-size:{size}px;line-height:24px;'
        f'color:{color};">{text}</p>'
    )


# ─────────────────────────── templates ───────────────────────────

def password_reset(reset_link: str, *, minutes: int = 15) -> tuple[str, str]:
    body = (
        _h1("Reset your password")
        + _p(f"We received a request to reset the password for your {BRAND_NAME} account. "
             f"Tap the button below to choose a new one.")
        + _button("Reset password", reset_link)
        + _p(f"This link expires in <strong>{minutes} minutes</strong> and can only be used once.",
             muted=True, size=13)
        + _p("If the button doesn't work, copy this link into your browser:", muted=True, size=13)
        + f'<p style="margin:0;font-size:12px;line-height:20px;word-break:break-all;">'
          f'<a href="{reset_link}" style="color:{BLUE_DARK};">{reset_link}</a></p>'
    )
    html = render_shell(
        title=f"Reset your {BRAND_NAME} password",
        preheader=f"Reset your {BRAND_NAME} password — link expires in {minutes} minutes.",
        body_html=body,
        footer_note="Didn't request this? You can safely ignore this email — your password won't change.",
    )
    text = (
        f"Reset your {BRAND_NAME} password\n\n"
        f"We received a request to reset your password. Open this link to choose a new one "
        f"(expires in {minutes} minutes):\n\n{reset_link}\n\n"
        f"If you didn't request this, ignore this email — your password won't change.\n"
    )
    return html, text


def password_reset_otp(otp: str, *, minutes: int = 15) -> tuple[str, str]:
    code_block = f"""
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 10px 0;">
          <tr>
            <td align="center" bgcolor="{BG}"
                style="background:{BG};border:1px solid {BORDER};border-radius:12px;padding:18px 34px;">
              <div style="font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:34px;
                          font-weight:700;letter-spacing:9px;color:{NAVY};line-height:1;">{otp}</div>
            </td>
          </tr>
        </table>"""
    body = (
        _h1("Your verification code")
        + _p(f"Use the code below to reset your {BRAND_NAME} password.")
        + code_block
        + _p(f"This code expires in <strong>{minutes} minutes</strong>. Never share it with anyone — "
             f"{BRAND_NAME} staff will never ask for it.", muted=True, size=13)
    )
    html = render_shell(
        title=f"Your {BRAND_NAME} verification code",
        preheader=f"Your code is {otp} — expires in {minutes} minutes.",
        body_html=body,
        footer_note="Didn't request this? You can safely ignore this email — your password won't change.",
    )
    text = (
        f"Your {BRAND_NAME} verification code\n\n"
        f"Code: {otp}\n\n"
        f"It expires in {minutes} minutes. Never share it with anyone.\n"
        f"If you didn't request this, ignore this email.\n"
    )
    return html, text
