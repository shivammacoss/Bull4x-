"""Branded HTML email templates for Bull4x.

Palette mirrors the "Cyber-Samurai" landing (src/landing-b4x): dark navy shell
with the #D9A136 gold accent, so mail looks like the product rather than a
generic transactional notice.

Email clients are not browsers: <style> blocks get stripped, flexbox/grid don't
render, and Outlook needs table layouts. So everything here is table-based with
inline styles, capped at 600px — the widest that renders reliably everywhere.

Every builder returns (html, text). The plain-text part is what shows in clients
with HTML/images disabled, so it must stand on its own.
"""
from __future__ import annotations

BRAND_NAME = "Bull4x"
SITE_URL = "https://bull4x.com"
LOGO_URL = f"{SITE_URL}/bull4x-logo.png"
SUPPORT_EMAIL = "support@bull4x.com"

# ── Bull4x landing palette ──
OUTER_BG = "#080b11"
NAVY = "#0d1117"
CARD = "#111820"
CARD_ALT = "#151d27"
GOLD = "#D9A136"
GOLD_LIGHT = "#F0C96F"
GOLD_DARK = "#b8892a"
GREEN = "#00d4aa"
TEXT = "#e8ecf1"
TEXT_MUTED = "#8b96a5"
BORDER = "#1f2935"

FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"


def _button(text: str, url: str) -> str:
    """Bulletproof CTA — bgcolor on the <td> is what makes it render in Outlook,
    which ignores background-color on the anchor. Dark label on gold: white on
    #D9A136 is only ~2:1 contrast and reads poorly on phones."""
    return f"""
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0 10px 0;">
          <tr>
            <td align="center" bgcolor="{GOLD}" style="border-radius:10px;">
              <a href="{url}" target="_blank"
                 style="display:inline-block;padding:15px 40px;font-family:{FONT};
                        font-size:15px;font-weight:700;line-height:1;color:{NAVY};
                        text-decoration:none;border-radius:10px;letter-spacing:.6px;
                        text-transform:uppercase;">
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
    """Branded frame: navy header + logo, gold gradient rule, dark card, footer.

    `preheader` is the grey preview line inboxes show beside the subject — it's
    hidden in the body; without it clients scrape whatever markup comes first.
    """
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background:{OUTER_BG};">
  <div style="display:none;font-size:1px;color:{OUTER_BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    {preheader}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{OUTER_BG};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
               style="width:600px;max-width:100%;border-radius:16px;overflow:hidden;
                      border:1px solid {BORDER};">

          <!-- header -->
          <tr>
            <td align="center" bgcolor="{NAVY}" style="background:{NAVY};padding:32px 24px 26px 24px;">
              <img src="{LOGO_URL}" width="132" alt="{BRAND_NAME}"
                   style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:132px;">
            </td>
          </tr>
          <!-- gold gradient rule -->
          <tr>
            <td style="height:3px;line-height:3px;font-size:0;
                       background:{GOLD};
                       background-image:linear-gradient(90deg,{GOLD_DARK} 0%,{GOLD} 50%,{GOLD_LIGHT} 100%);">&nbsp;</td>
          </tr>

          <!-- content -->
          <tr>
            <td bgcolor="{CARD}" style="background:{CARD};padding:40px 40px 34px 40px;font-family:{FONT};">
              {body_html}
            </td>
          </tr>

          <!-- divider -->
          <tr>
            <td bgcolor="{CARD}" style="background:{CARD};padding:0 40px;">
              <div style="height:1px;background:{BORDER};font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>
          <!-- footer -->
          <tr>
            <td bgcolor="{CARD}" style="background:{CARD};padding:22px 40px 34px 40px;font-family:{FONT};">
              <p style="margin:0 0 10px 0;font-size:13px;line-height:20px;color:{TEXT_MUTED};">
                {footer_note or f'Need help? Reach us at <a href="mailto:{SUPPORT_EMAIL}" style="color:{GOLD};text-decoration:none;">{SUPPORT_EMAIL}</a>.'}
              </p>
              <p style="margin:0;font-size:11px;line-height:18px;color:#5c6675;">
                &copy; {BRAND_NAME} &middot; <a href="{SITE_URL}" style="color:#5c6675;text-decoration:underline;">{SITE_URL.replace('https://','')}</a><br>
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
        f'<h1 style="margin:0 0 14px 0;font-size:25px;line-height:33px;'
        f'font-weight:700;color:{TEXT};letter-spacing:-.2px;">{text}</h1>'
    )


def _p(text: str, *, muted: bool = False, size: int = 15) -> str:
    color = TEXT_MUTED if muted else "#c4ccd8"
    return (
        f'<p style="margin:0 0 14px 0;font-size:{size}px;line-height:24px;'
        f'color:{color};">{text}</p>'
    )


def _eyebrow(text: str) -> str:
    """Small gold label above the title — the landing's section-tag look."""
    return (
        f'<p style="margin:0 0 10px 0;font-size:11px;line-height:16px;font-weight:700;'
        f'letter-spacing:2px;text-transform:uppercase;color:{GOLD};">{text}</p>'
    )


# ─────────────────────────── templates ───────────────────────────

def password_reset(reset_link: str, *, minutes: int = 15) -> tuple[str, str]:
    body = (
        _eyebrow("Account security")
        + _h1("Reset your password")
        + _p(f"We received a request to reset the password for your {BRAND_NAME} account. "
             f"Tap the button below to choose a new one.")
        + _button("Reset password", reset_link)
        + _p(f"This link expires in <strong style=\"color:{TEXT};\">{minutes} minutes</strong> "
             f"and can only be used once.", muted=True, size=13)
        + _p("If the button doesn't work, copy this link into your browser:", muted=True, size=13)
        + f'<p style="margin:0;font-size:12px;line-height:20px;word-break:break-all;">'
          f'<a href="{reset_link}" style="color:{GOLD};">{reset_link}</a></p>'
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
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 12px 0;">
          <tr>
            <td align="center" bgcolor="{CARD_ALT}"
                style="background:{CARD_ALT};border:1px solid {GOLD_DARK};border-radius:12px;padding:20px 36px;">
              <div style="font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:34px;
                          font-weight:700;letter-spacing:10px;color:{GOLD_LIGHT};line-height:1;">{otp}</div>
            </td>
          </tr>
        </table>"""
    body = (
        _eyebrow("Verification code")
        + _h1("Your reset code")
        + _p(f"Use the code below to reset your {BRAND_NAME} password.")
        + code_block
        + _p(f"This code expires in <strong style=\"color:{TEXT};\">{minutes} minutes</strong>. "
             f"Never share it with anyone — {BRAND_NAME} staff will never ask for it.",
             muted=True, size=13)
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
