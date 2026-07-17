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
DANGER = "#ff5b5b"
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


def _badge(text: str, color: str) -> str:
    """Status pill. Tinted background is faked with a solid dark cell + coloured
    border/text — rgba() backgrounds are unreliable across mail clients."""
    return (
        f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px 0;">'
        f'<tr><td bgcolor="{CARD_ALT}" style="background:{CARD_ALT};border:1px solid {color};'
        f'border-radius:999px;padding:7px 16px;font-family:{FONT};font-size:12px;font-weight:700;'
        f'letter-spacing:1px;text-transform:uppercase;color:{color};">{text}</td></tr></table>'
    )


def _data_table(rows: list[tuple[str, str]]) -> str:
    """Key/value block for amounts, account numbers, timestamps."""
    body = ""
    for i, (label, value) in enumerate(rows):
        top = "" if i == 0 else f"border-top:1px solid {BORDER};"
        body += (
            f'<tr>'
            f'<td style="{top}padding:12px 0;font-family:{FONT};font-size:13px;color:{TEXT_MUTED};">{label}</td>'
            f'<td align="right" style="{top}padding:12px 0;font-family:{FONT};font-size:14px;'
            f'font-weight:700;color:{TEXT};">{value}</td>'
            f'</tr>'
        )
    return (
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
        f'style="margin:22px 0 8px 0;background:{CARD_ALT};border:1px solid {BORDER};'
        f'border-radius:12px;padding:4px 18px;">{body}</table>'
    )


def _alert(text: str, color: str) -> str:
    """Coloured left-rule callout for warnings (margin call, stop-out)."""
    return (
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0;">'
        f'<tr><td bgcolor="{CARD_ALT}" style="background:{CARD_ALT};border-left:3px solid {color};'
        f'border-radius:6px;padding:14px 16px;font-family:{FONT};font-size:14px;line-height:22px;'
        f'color:#c4ccd8;">{text}</td></tr></table>'
    )


def _cta_or_link(text: str, url: str | None) -> str:
    return _button(text, url) if url else ""


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


# ─────────────────────────── onboarding ───────────────────────────

def welcome(first_name: str | None = None) -> tuple[str, str]:
    who = f", {first_name}" if first_name else ""
    body = (
        _eyebrow("Welcome aboard")
        + _h1(f"Welcome to {BRAND_NAME}{who}")
        + _p("Your account is live. You're a few steps from your first trade:")
        + _p(
            f'<span style="color:{GOLD};font-weight:700;">1.</span> Verify your identity (KYC)<br>'
            f'<span style="color:{GOLD};font-weight:700;">2.</span> Fund your wallet<br>'
            f'<span style="color:{GOLD};font-weight:700;">3.</span> Open your first position on 60+ instruments'
        )
        + _button("Go to dashboard", f"{SITE_URL}/dashboard")
        + _p("New to trading? Try a <strong style=\"color:#c4ccd8;\">free demo account</strong> first — "
             "same live prices, zero risk.", muted=True, size=13)
    )
    html = render_shell(
        title=f"Welcome to {BRAND_NAME}",
        preheader="Your account is live — verify, fund, and place your first trade.",
        body_html=body,
    )
    text = (
        f"Welcome to {BRAND_NAME}{who}\n\n"
        f"Your account is live. Next steps:\n"
        f"1. Verify your identity (KYC)\n2. Fund your wallet\n3. Open your first position\n\n"
        f"Dashboard: {SITE_URL}/dashboard\n"
    )
    return html, text


def login_alert(*, ip: str | None, device: str | None, when: str) -> tuple[str, str]:
    body = (
        _eyebrow("Security")
        + _h1("New sign-in to your account")
        + _p(f"Your {BRAND_NAME} account was just accessed. If this was you, no action is needed.")
        + _data_table([
            ("When", when),
            ("IP address", ip or "Unknown"),
            ("Device", (device or "Unknown")[:70]),
        ])
        + _alert(
            "<strong>Didn't sign in?</strong> Reset your password immediately and contact support.",
            DANGER,
        )
        + _button("Secure my account", f"{SITE_URL}/auth/login")
    )
    html = render_shell(
        title=f"New sign-in to your {BRAND_NAME} account",
        preheader=f"New sign-in {when} from {ip or 'unknown IP'}.",
        body_html=body,
    )
    text = (
        f"New sign-in to your {BRAND_NAME} account\n\n"
        f"When: {when}\nIP: {ip or 'Unknown'}\nDevice: {device or 'Unknown'}\n\n"
        f"If this wasn't you, reset your password immediately: {SITE_URL}/auth/login\n"
    )
    return html, text


# ─────────────────────────── KYC ───────────────────────────

def kyc_submitted() -> tuple[str, str]:
    body = (
        _eyebrow("Verification")
        + _h1("We've received your documents")
        + _badge("Under review", GOLD)
        + _p("Your KYC documents are in review. This usually takes up to 24 hours, and we'll "
             "email you as soon as there's a decision.")
        + _p("You can keep exploring the platform meanwhile — live funding and withdrawals "
             "unlock once you're verified.", muted=True, size=13)
    )
    html = render_shell(
        title=f"{BRAND_NAME} — KYC received",
        preheader="Your documents are under review — usually within 24 hours.",
        body_html=body,
    )
    text = (
        "We've received your KYC documents\n\nStatus: Under review (usually within 24 hours).\n"
        "We'll email you as soon as there's a decision.\n"
    )
    return html, text


def kyc_status(status: str, reason: str | None = None) -> tuple[str, str]:
    approved = status.lower() in ("approved", "verified")
    color = GREEN if approved else DANGER
    if approved:
        body = (
            _eyebrow("Verification")
            + _h1("You're verified")
            + _badge("Approved", GREEN)
            + _p("Your identity has been verified. Your account is now fully unlocked — "
                 "you can fund your wallet and trade live.")
            + _button("Fund your account", f"{SITE_URL}/wallet")
        )
        preheader = "Your KYC is approved — your account is fully unlocked."
        text = ("Your KYC has been approved.\n\nYour account is fully unlocked — "
                f"fund your wallet: {SITE_URL}/wallet\n")
    else:
        body = (
            _eyebrow("Verification")
            + _h1("We couldn't verify your documents")
            + _badge("Rejected", DANGER)
            + _p("Unfortunately your KYC submission was not approved.")
            + (_alert(f"<strong>Reason:</strong> {reason}", DANGER) if reason else "")
            + _p("You can upload new documents any time — make sure images are clear, "
                 "uncropped, and show all four corners.")
            + _button("Re-submit documents", f"{SITE_URL}/kyc")
        )
        preheader = "Your KYC submission needs another look."
        text = (
            "Your KYC submission was not approved.\n"
            + (f"Reason: {reason}\n" if reason else "")
            + f"\nRe-submit here: {SITE_URL}/kyc\n"
        )
    html = render_shell(
        title=f"{BRAND_NAME} — KYC {status.title()}",
        preheader=preheader,
        body_html=body,
    )
    return html, text


# ─────────────────────────── wallet ───────────────────────────

def deposit_status(amount: str, currency: str, status: str, *, reason: str | None = None) -> tuple[str, str]:
    ok = status.lower() in ("approved", "auto_approved", "completed", "credited")
    color = GREEN if ok else DANGER
    label = "Credited" if ok else status.title()
    body = (
        _eyebrow("Wallet")
        + _h1("Deposit " + ("credited" if ok else status.lower()))
        + _badge(label, color)
        + (_p("Your funds are in — your balance has been updated and you're ready to trade.")
           if ok else _p("Your deposit could not be processed."))
        + _data_table([("Amount", f"{amount} {currency}"), ("Status", label)])
        + (_alert(f"<strong>Reason:</strong> {reason}", DANGER) if (reason and not ok) else "")
        + _button("View wallet", f"{SITE_URL}/wallet")
    )
    html = render_shell(
        title=f"{BRAND_NAME} — Deposit {label}",
        preheader=f"Your deposit of {amount} {currency} is {label.lower()}.",
        body_html=body,
    )
    text = (
        f"Deposit {label}\n\nAmount: {amount} {currency}\nStatus: {label}\n"
        + (f"Reason: {reason}\n" if (reason and not ok) else "")
        + f"\nWallet: {SITE_URL}/wallet\n"
    )
    return html, text


def withdrawal_status(amount: str, currency: str, status: str, *, reason: str | None = None) -> tuple[str, str]:
    ok = status.lower() in ("approved", "completed", "paid")
    color = GREEN if ok else (GOLD if status.lower() == "pending" else DANGER)
    label = status.title()
    body = (
        _eyebrow("Wallet")
        + _h1(f"Withdrawal {status.lower()}")
        + _badge(label, color)
        + (_p("Your withdrawal has been processed. Depending on your payment method it can take "
              "a short while to appear on your side.")
           if ok else _p("There's an update on your withdrawal request."))
        + _data_table([("Amount", f"{amount} {currency}"), ("Status", label)])
        + (_alert(f"<strong>Reason:</strong> {reason}", DANGER) if (reason and not ok) else "")
        + _button("View transactions", f"{SITE_URL}/transactions")
    )
    html = render_shell(
        title=f"{BRAND_NAME} — Withdrawal {label}",
        preheader=f"Your withdrawal of {amount} {currency} is {label.lower()}.",
        body_html=body,
    )
    text = (
        f"Withdrawal {label}\n\nAmount: {amount} {currency}\nStatus: {label}\n"
        + (f"Reason: {reason}\n" if (reason and not ok) else "")
        + f"\nTransactions: {SITE_URL}/transactions\n"
    )
    return html, text


# ─────────────────────────── risk ───────────────────────────

def margin_call(account_number: str, margin_level: str) -> tuple[str, str]:
    body = (
        _eyebrow("Risk alert")
        + _h1("Margin call warning")
        + _badge("Action required", GOLD)
        + _p("Your margin level has dropped into the margin-call zone. If it keeps falling, "
             "positions will be closed automatically at the stop-out level.")
        + _data_table([("Account", account_number), ("Margin level", f"{margin_level}%")])
        + _alert("Add funds or close positions to avoid an automatic stop-out.", GOLD)
        + _button("Manage positions", f"{SITE_URL}/trading/terminal")
    )
    html = render_shell(
        title=f"{BRAND_NAME} — Margin call warning",
        preheader=f"Account {account_number} margin level at {margin_level}% — action required.",
        body_html=body,
    )
    text = (
        f"Margin call warning\n\nAccount: {account_number}\nMargin level: {margin_level}%\n\n"
        f"Add funds or close positions to avoid an automatic stop-out.\n{SITE_URL}/trading/terminal\n"
    )
    return html, text


def stop_out(account_number: str, margin_level: str, closed_count: int) -> tuple[str, str]:
    body = (
        _eyebrow("Risk alert")
        + _h1("Stop-out executed")
        + _badge("Positions closed", DANGER)
        + _p("Your margin level fell below the stop-out threshold, so positions were closed "
             "automatically to protect your account from further loss.")
        + _data_table([
            ("Account", account_number),
            ("Margin level", f"{margin_level}%"),
            ("Positions closed", str(closed_count)),
        ])
        + _button("Review account", f"{SITE_URL}/portfolio")
    )
    html = render_shell(
        title=f"{BRAND_NAME} — Stop-out executed",
        preheader=f"{closed_count} position(s) closed on account {account_number}.",
        body_html=body,
    )
    text = (
        f"Stop-out executed\n\nAccount: {account_number}\nMargin level: {margin_level}%\n"
        f"Positions closed: {closed_count}\n\n{SITE_URL}/portfolio\n"
    )
    return html, text


# ─────────────────────────── IB / partners ───────────────────────────

def ib_status(status: str, *, referral_code: str | None = None, reason: str | None = None) -> tuple[str, str]:
    approved = status.lower() == "approved"
    if approved:
        body = (
            _eyebrow("Partners")
            + _h1("You're now a Bull4x IB")
            + _badge("Approved", GREEN)
            + _p("Your Introducing Broker application has been approved. Share your referral link "
                 "and start earning commission on every trade your clients close.")
            + (_data_table([
                ("Referral code", referral_code or "—"),
                ("Referral link", f"{SITE_URL}/auth/register?ref={referral_code}" if referral_code else "—"),
            ]) if referral_code else "")
            + _button("Open partner dashboard", f"{SITE_URL}/business")
        )
        preheader = "Your IB application is approved — start earning commission."
        text = (
            f"You're now a {BRAND_NAME} IB\n\n"
            + (f"Referral code: {referral_code}\nLink: {SITE_URL}/auth/register?ref={referral_code}\n\n"
               if referral_code else "")
            + f"Partner dashboard: {SITE_URL}/business\n"
        )
    else:
        body = (
            _eyebrow("Partners")
            + _h1("IB application update")
            + _badge(status.title(), DANGER)
            + _p("Your Introducing Broker application was not approved at this time.")
            + (_alert(f"<strong>Reason:</strong> {reason}", DANGER) if reason else "")
            + _p("You're welcome to apply again, or reach out to support if you have questions.",
                 muted=True, size=13)
        )
        preheader = "Update on your IB application."
        text = (
            f"IB application {status}\n" + (f"Reason: {reason}\n" if reason else "")
        )
    html = render_shell(
        title=f"{BRAND_NAME} — IB application {status.title()}",
        preheader=preheader,
        body_html=body,
    )
    return html, text


def ib_commission_earned(amount: str, currency: str, *, level: int, symbol: str | None = None) -> tuple[str, str]:
    body = (
        _eyebrow("Partners")
        + _h1("You earned commission")
        + _badge(f"Level {level}", GOLD)
        + _p("A client in your network just closed a trade, and your commission has been credited.")
        + _data_table(
            [("Commission", f"{amount} {currency}"), ("Tier", f"Level {level}")]
            + ([("Instrument", symbol)] if symbol else [])
        )
        + _button("View earnings", f"{SITE_URL}/business")
    )
    html = render_shell(
        title=f"{BRAND_NAME} — Commission earned",
        preheader=f"You earned {amount} {currency} in IB commission.",
        body_html=body,
    )
    text = (
        f"You earned commission\n\nCommission: {amount} {currency}\nTier: Level {level}\n"
        + (f"Instrument: {symbol}\n" if symbol else "")
        + f"\nEarnings: {SITE_URL}/business\n"
    )
    return html, text


# ─────────────────────────── PAMM / MAM ───────────────────────────

def pamm_investment_confirmed(master_name: str, amount: str, currency: str, copy_type: str) -> tuple[str, str]:
    kind = "PAMM" if copy_type.lower() == "pamm" else "MAM"
    body = (
        _eyebrow(f"{kind} investing")
        + _h1("Your allocation is active")
        + _badge("Active", GREEN)
        + _p(f"You're now following <strong style=\"color:{TEXT};\">{master_name}</strong>. "
             f"Trades will mirror to your account automatically.")
        + _data_table([
            ("Manager", master_name),
            ("Allocated", f"{amount} {currency}"),
            ("Type", kind),
        ])
        + _button("View investment", f"{SITE_URL}/pamm")
    )
    html = render_shell(
        title=f"{BRAND_NAME} — {kind} allocation active",
        preheader=f"You allocated {amount} {currency} to {master_name}.",
        body_html=body,
    )
    text = (
        f"Your {kind} allocation is active\n\nManager: {master_name}\n"
        f"Allocated: {amount} {currency}\n\n{SITE_URL}/pamm\n"
    )
    return html, text


def mam_settlement(
    master_name: str, period: str, gross_pnl: str, performance_fee: str, net_pnl: str, currency: str,
) -> tuple[str, str]:
    body = (
        _eyebrow("MAM settlement")
        + _h1("Your period statement")
        + _p(f"The settlement period for <strong style=\"color:{TEXT};\">{master_name}</strong> has closed. "
             f"Here's how it finished.")
        + _data_table([
            ("Period", period),
            ("Gross P&L", f"{gross_pnl} {currency}"),
            ("Performance fee", f"-{performance_fee} {currency}"),
            ("Net to you", f"{net_pnl} {currency}"),
        ])
        + _p("Performance fees are charged only on new profit above your high-water mark — "
             "never on a recovery from an earlier drawdown.", muted=True, size=13)
        + _button("View statement", f"{SITE_URL}/pamm")
    )
    html = render_shell(
        title=f"{BRAND_NAME} — MAM settlement statement",
        preheader=f"{master_name}: net {net_pnl} {currency} for {period}.",
        body_html=body,
    )
    text = (
        f"MAM settlement — {master_name}\n\nPeriod: {period}\nGross P&L: {gross_pnl} {currency}\n"
        f"Performance fee: -{performance_fee} {currency}\nNet to you: {net_pnl} {currency}\n\n"
        f"{SITE_URL}/pamm\n"
    )
    return html, text
