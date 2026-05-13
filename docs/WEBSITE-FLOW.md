# BULL4X — Complete Website Flow

> **Iska purpose:** Project owner ke liye ek practical reference. Pura platform kaise kaam karta hai, har page kya karta hai, business logic kaise flow karti hai — sab ek jagah.
>
> **Tone:** Hinglish + English mix. Code references aur API endpoints English me.
>
> **Last updated:** 2026-05-13

---

## 1. Platform kya hai?

**BULL4X** (internal code-name **Unicap**) ek full-stack multi-asset trading platform hai jo provide karta hai:

- **Trading** — Forex, Crypto, Indices, Commodities, Stocks (60+ instruments)
- **Copy Trading** — Followers master traders ko mirror karte hain
- **Prop Firm Challenges** — Funded account program (1-step / 2-step challenges)
- **IB / Affiliate Program** — Multi-level referral commissions (up to 20 levels)
- **White-Label Branding** — Partner brands `/:slug/login` style URLs use karte hain

### Stack quick view

| Layer | Stack |
|---|---|
| **Backend** | Node.js + Express (ESM), MongoDB/Mongoose, Socket.IO, `ws` (Infoway price feed), `node-cron`, JWT, Nodemailer, Multer |
| **Frontend** | React 18 + Vite, React Router v6, Tailwind CSS, framer-motion, Recharts, i18next, Socket.IO client |
| **Infra** | Backend port 5000, MongoDB local/cloud, file uploads under `backend/uploads/` served at `/uploads`, Infoway WS for live prices |

> See [Bull4x-/CLAUDE.md](../CLAUDE.md) for stack run commands.

---

## 2. Tinno mein platform — 3 sides

```
┌─────────────────────────┐  ┌──────────────────────────┐  ┌───────────────────────┐
│   PUBLIC LANDING SITE   │  │   USER DASHBOARD (auth)  │  │   ADMIN PANEL (auth)  │
│                         │  │                          │  │                       │
│  bull4xLanding/         │  │  pages/Dashboard.jsx     │  │  pages/Admin*.jsx     │
│  Marketing pages        │  │  Trading, Wallet, IB,    │  │  AdminLayout sidebar  │
│  About, Pricing, etc.   │  │  Copy Trade, Prop, KYC   │  │  ~25 admin pages      │
└─────────────────────────┘  └──────────────────────────┘  └───────────────────────┘
```

Sab same backend hit karte hain (`backend/server.js` → `/api/*` routes).

---

## 3. User Journey — End to End

### 3.1 New User ka complete path

```
1. Marketing site dekhi (bull4xLanding/Home.jsx)
        ↓
2. "Open Account" pe click → /user/signup
        ↓
3. Email + OTP verify (optional, EmailSettings.otpVerificationEnabled se control)
        ↓
4. Auto-login → /dashboard (ya /mobile if width < 768px)
        ↓
5. /profile pe KYC submit karta hai (ID front/back + selfie via Multer upload)
        ↓
6. Admin /admin/kyc se approve karta hai
        ↓
7. /wallet pe Deposit (Bank/UPI screenshot ya Crypto via Oxapay)
        ↓
8. Admin /admin/funds se deposit approve karta hai
        ↓
9. /account pe naya trading account create karta hai (Standard/ECN/Pro etc.)
        ↓
10. Wallet → trading account transfer karta hai
        ↓
11. /trade/:accountId pe order place karta hai
        ↓
12. /orders pe positions track karta hai
        ↓
13. Profit lock karke /wallet → Withdraw karta hai (OTP verify, then admin approve)
```

### 3.2 Common user flows (reference)

| Flow | Path | Steps |
|---|---|---|
| Signup → first trade | `/signup` → `/dashboard` → `/profile` (KYC) → `/wallet` (deposit) → `/account` (create acc) → `/trade/:id` | 7 steps |
| Deposit funds | `/wallet` → Deposit modal → Bank/Crypto → Upload proof → Admin approves | 4 steps |
| Buy prop challenge | `/buy-challenge` → Select fund size → Apply coupon → Pay from wallet → Challenge account auto-created → `/challenge-dashboard` | 5 steps |
| Copy trade follow | `/copytrade` → Discover masters → Follow → Select account → Set FIXED_LOT or PERCENTAGE mode | 4 steps |
| IB commission withdraw | `/ib` → View earnings → Withdraw Commission → Select bank → OTP → Receives in wallet | 5 steps |
| Trade execution | `/trade/:id` → Search instrument → Set qty/leverage → Market/Limit/Pending → Set SL/TP → Execute | 6 steps |

---

## 4. User-Facing Pages — Complete Reference

> Saare paths `frontend/src/App.jsx` router se mounted hain.

### 4.1 Authentication

| Page | Route | Kya karta hai |
|---|---|---|
| `Login.jsx` | `/user/login` | Email + password, mobile detection se `/mobile` redirect. Endpoint: `POST /auth/login` |
| `Register.jsx` (Signup) | `/user/signup` | Country + email + phone + password. Optional OTP step. Referral code via `?ref=`. Endpoints: `/auth/otp-settings`, `/auth/send-otp`, `/auth/verify-otp`, `/auth/signup` |
| `ForgotPassword.jsx` | `/user/forgot-password` | Email OTP → naya password set |
| **Branded** | `/:slug/login`, `/:slug/signup` | Same auth, partner brand context se URL slug |

### 4.2 Main Pages (post-login)

#### **Dashboard** — `/dashboard`
Main hub. Wallet balance, trading accounts summary, news feed, economic calendar, P&L metrics. Sidebar nav, theme toggle, language selector. TradingView embeds.

**Key APIs:** Wallet balance, user accounts, news, economic events, metrics
**Sub-flows:** Wallet dropdown → quick Transfer/Withdraw modals

#### **Account** — `/account`
Trading accounts management. Tabs: **Real**, **Demo**, **Challenge** (if enabled), **Archived**.

**Per account actions:** Trade, Deposit, Withdraw, Transfer between accounts, Account Info, Archive, Reset Demo, Change PIN
**Create flow:** Modal opens → select account type (Standard/ECN/Pro/Demo) → leverage → create
**PIN security:** 4-digit PIN for sensitive operations (toggle via localStorage)

#### **WalletPage** — `/wallet`
User ka cash reserve. Pure deposit/withdraw/transfer hub.

**Deposit:**
- Bank Transfer (UPI/IFSC) → screenshot upload → Pending → Admin approves
- Crypto (USDT/USDC/BTC) → Oxapay payment created → Auto-confirm on chain
- Bonus auto-calculated: `/bonus/calculate` — FIRST_DEPOSIT vs REGULAR rules apply

**Withdrawal:**
- Select bank or crypto wallet → enter amount → **OTP verify (mandatory)** → submit
- Admin approval required before balance debit

**Transfer:** Wallet ↔ Trading Account (instant, no admin)

#### **TradingPage** — `/trade/:accountId`
Real-time trading interface. Charts, order entry, live positions.

**Features:**
- Instrument search (Forex/Metals/Crypto/Indices tabs)
- Multi-chart support (single ya 4-chart grid)
- Market / Limit / Pending orders, SL/TP, leverage selector
- One-click trading toggle
- Live position tracking with real-time P&L (Socket.IO `priceUpdate`)
- Tabs: Open Positions, Trade History, Pending Orders
- Starred instruments shortcuts
- Challenge accounts pe rules + restrictions show

**Key APIs:** `/prices/instruments`, `/prices/live` (WS), `/trades/open`, `/trades/close`, `/trades/pending-order`

#### **OrderBook** — `/orders`
Multi-account positions/history view.

**Tabs:** Positions (open), History (closed), Pending Orders
**Filters:** Account, date range
**Actions:** Close position, Cancel pending, Export history
**Real-time:** WebSocket price stream → live P&L recalc
**Pagination:** 20 per page

#### **ProfilePage** — `/profile`
User settings + KYC + bank accounts.

**Sections:**
- Personal info edit (name/email/phone/address)
- Password change
- **KYC submission:** Doc type (Aadhaar/PAN/Passport) + number + 3 images (front, back, selfie) via Multer
- Bank accounts add/remove (Bank Transfer + UPI)
- Profile picture upload
- KYC status badge: Pending / Verified / Rejected

#### **IBPage** — `/ib`
Affiliate / Introducing Broker dashboard.

**Shows:** Referral link (copy-to-clipboard), commission earnings, downline tree, IB level, tier benefits
**Actions:** Apply for IB (modal), Withdraw commission (via bank account selection + OTP)
**Visual:** Banner carousel (promotional materials from admin)

#### **CopyTradePage** — `/copytrade`
Master/follower ecosystem.

**Tabs:**
- **Discover** — Browse master traders (stats: win rate, total trades, monthly return)
- **My Subscriptions** — Manage active follows (pause/resume, edit copy settings)
- **Copy Trades** — Live copied positions with P&L + commission breakdown
- **My Followers** — If user is master, manage who's copying
- **Master Profile** — Apply to become a master (display name, description, commission %)

**Copy Modes:**
- `FIXED_LOT` — Exact volume copy
- `PERCENTAGE` — Proportional to follower's account balance/equity
- `MULTIPLIER` — masterQty × multiplier (e.g., 2×)

#### **SupportPage** — `/support`
Ticket helpdesk. Create ticket → admin replies → resolved status.

#### **InstructionsPage** — `/instructions`
Onboarding guide. Static content with expandable sections. Challenge section conditional on `propTradingEnabled`.

### 4.3 Prop Challenge Pages

| Page | Route | Purpose |
|---|---|---|
| **BuyChallengePage** | `/buy-challenge` | Challenge select (1-step/2-step), fund size ($10k–$100k+), coupon, T&C agree, purchase from wallet |
| **ChallengeDashboardPage** | `/challenge-dashboard` | Track challenge progress: P&L, drawdown %, profit target %, days remaining, status badge (ACTIVE/PASSED/FUNDED/FAILED/EXPIRED) |
| **CartPage** | `/cart` | LocalStorage-based cart (no server). Add/remove challenges, checkout → `/buy-challenge` |

### 4.4 Mobile-Specific

#### **MobilePage** — `/mobile`
Responsive trading app for phones. Auto-redirect to `/dashboard` if width ≥ 768px.

**Layout:** Bottom tab nav (Home / Trade / Portfolio / Wallet / Menu)
**Features:** Condensed instrument list, simplified order entry, iOS-style notifications, account selector, modify trade modal (SL/TP)

### 4.5 Legal / Static

`/privacy-policy`, `/terms-of-service`, `/cookie-policy`, `/account-deletion` — static text pages.

---

## 5. Admin Panel — Complete Reference

> Admin pages `frontend/src/pages/Admin*.jsx`, shared layout `components/AdminLayout.jsx`.

### 5.1 Admin Authentication & Roles

**Two portals:**
- **SUPER_ADMIN** — `/admin` (full access)
- **ADMIN (Employee)** — `/admin-employee` (limited via `sidebarPermissions`)

**Permission system** (in `AdminLayout.jsx`):
- `hasSidebarPermission(sidebarKey)` checks `admin.sidebarPermissions[key]` from localStorage
- SUPER_ADMIN bypasses all checks
- 19 menu items, each gated by a `sidebarKey` (e.g. `userManagement`, `fundManagement`, `ibManagement`)
- Dashboard + My Profile always visible
- `adminToken` + `adminUser` in localStorage

### 5.2 Sidebar Menu (poora list)

| # | Menu | Path | Key Capability |
|---|---|---|---|
| 1 | Overview Dashboard | `/admin/dashboard` | Stats: users, deposits, withdrawals, pending requests |
| 2 | User Management | `/admin/users` | User CRUD, wallet ops, KYC, ban/block, login-as-user |
| 3 | Trade Management | `/admin/trades` | Manual trade create/edit/close, live price subscription |
| 4 | Fund Management | `/admin/funds` | Approve/reject deposits & withdrawals |
| 5 | Crypto Settings | `/admin/bank-settings` | Bank/UPI/Crypto config, currency markups |
| 6 | IB Management | `/admin/ib-management` | Affiliate tree, commissions per tier, applications |
| 7 | Forex Charges | `/admin/forex-charges` | Per-symbol commission/spread/swap |
| 8 | Earnings Report | `/admin/earnings` | Daily P&L charts, commission breakdowns |
| 9 | Copy Trade Mgmt | `/admin/copy-trade` | Approve masters, view followers |
| 10 | Prop Firm Challenges | `/admin/prop-firm` | Challenge CRUD, rules, participants tracking |
| 11 | Account Types | `/admin/account-types` | Standard/Pro/ECN/Demo CRUD with leverage, min deposit |
| 12 | Theme Settings | `/admin/theme` | UI color themes, presets |
| 13 | Email Templates | `/admin/email-templates` | Template editor + SMTP config |
| 14 | Bonus Management | `/admin/bonus-management` | Deposit bonus campaigns |
| 15 | Banner Management | `/admin/banners` | Promo banners for IB/dashboard |
| 16 | Employee Management | `/admin/admin-management` | Create sub-admins, assign permissions |
| 17 | KYC Verification | `/admin/kyc` | Approve/reject KYC submissions |
| 18 | Support Tickets | `/admin/support` | Reply to user tickets |
| 19 | My Profile | `/admin/profile` | Self profile edit |

### 5.3 Key Admin Pages — Deep Dive

#### **User Management** (`/admin/users`)
**Most-used admin page.** Per user:
- Wallet add/deduct funds (with reason)
- Create trading accounts for user
- Fund/deduct specific trading accounts
- KYC view + force re-verify
- **Login-as-user** (impersonation for support)
- Ban / Block / Reset Password
- Tab 2: Password Reset Requests (approve with new password)

#### **Fund Management** (`/admin/funds`)
**Central money flow controller.**
- Transaction types: `DEPOSIT`, `WITHDRAWAL`, `ADMIN_FUND_ADD`, `ADMIN_CREDIT_REMOVE`
- Filters: type, account type, date range
- Per-txn: approve (credits wallet + email), reject (with reason), view receipt
- Stats cards: total deposits, withdrawals, pending count, net flow

#### **IB Management** (`/admin/ib-management`)
**Sabse complex admin module.**
- Tabs: IBs, Network (hierarchy tree), Applications, Commissions, Levels
- Network tab — visual hierarchy, search, move/detach referrals
- Commissions tab — per-account-type, per-tier (Bronze/Silver/Gold/Platinum/Diamond) commission % set
- Auto-refresh 10s

> **Routing quirk:** `/api/admin/ib/*` URLs `server.js` me rewrite hote hain to `/api/ib/admin/*` — dono paths same handler hit karte hain. Naya engine `ibEngineNew.js` + `ibNew.js` + `IB*New` models use karta hai (legacy `ibEngine.js` mounted nahi hai).

#### **Prop Firm Challenges** (`/admin/prop-firm`)
- **Settings:** Enable/disable challenge mode platform-wide
- **Challenges tab:** CRUD challenge types — fund size ($10k–$100k+), fee ($99+), rules (max daily/overall DD %, profit targets phase 1/2, lot limits, SL mandatory, max concurrent trades, leverage, news trading allowed, expiry 30 days), funded settings (profit split %, withdrawal frequency)
- **Participants tab:** Live trackers, filter by status, view equity/drawdown

#### **Copy Trade Management** (`/admin/copy-trade`)
- Approve masters with commission % + admin share %
- View pending master applications
- Track all followers and their subscriptions
- Suspend masters

#### **KYC Verification** (`/admin/kyc`)
- Filter by status (pending/approved/rejected)
- Modal: view all uploaded images + user details
- Approve → user KYC_STATUS=VERIFIED (withdrawal limits lift)
- Reject with reason → user resubmits

#### **Forex Charges** (`/admin/forex-charges`)
- 50+ instruments (15 forex, 10 metals, 15 crypto, 13 indices)
- Tabs: Commission (fixed/% per lot), Spread (pips), Swap (overnight charge)
- Per-symbol CRUD

#### **Account Types** (`/admin/account-types`)
- Define account templates: name, description, min deposit, **leverage** (e.g. 1:500), exposure limit, spreads, commission, demo flag + virtual balance

#### **Earnings Report** (`/admin/earnings`)
- Multi-view analytics: Overview, Daily (line chart 7/30/90 days), By User (top earners), By Symbol, Copy Masters
- Endpoints: `/earnings/summary`, `/earnings/daily?days=X`, `/earnings/by-user`, `/earnings/by-symbol`, `/earnings/copy-masters`

#### **Theme Settings** (`/admin/theme`)
- List themes (dark/light variants), apply presets, edit color palette
- Active theme push: server `/theme/active` se sab clients fetch karte hain (every 30s)
- Frontend CSS variables (`--theme-primary`, `--theme-bgCard` etc.) auto-update

#### **Email Templates** (`/admin/email-templates`)
- Edit subject + HTML body for: Welcome, Password Reset, KYC Approved/Rejected, Deposit/Withdrawal Pending/Success, Challenge Passed/Failed, IB Approved, etc.
- SMTP config (host/port/user/pass/from), test connection + test send
- OTP config (enable + expiry 10 min)

#### **Employee Management** (`/admin/admin-management`)
- SUPER_ADMIN only
- Create sub-admins with custom sidebar permission matrix (18 keys)
- Fund admin wallets, reset their passwords

#### **Bonus Management** (`/admin/bonus-management`)
- Bonus types: FIRST_DEPOSIT, REGULAR, REFERRAL, SEASONAL
- Per bonus: percentage vs fixed, min deposit trigger, max cap, **wager requirement** (e.g. 30x), duration, max withdrawal ratio
- Tab 2: User bonus tracking (active/withdrawn/expired)

### 5.4 Common Admin Workflows

| Workflow | Steps |
|---|---|
| Approve deposit | `/admin/funds` → filter Pending → click txn → view proof → Approve (wallet credits + email) |
| Verify KYC | `/admin/kyc` → Pending tab → open modal → review images → Approve / Reject (with reason) |
| Setup new IB tier | `/admin/ib-management` → Commissions tab → set % per level per account type → Save |
| Create prop challenge | `/admin/prop-firm` → Challenges tab → Create → set fund size, fee, rules, expiry, profit split → Save |
| Fund a user wallet | `/admin/users` → search → user modal → Add Fund (amount + reason) → confirms |
| Add new sub-admin | `/admin/admin-management` → Create Admin → set role=ADMIN, check sidebarPermissions → Save |
| Update theme colors | `/admin/theme` → select theme → edit palette → Activate → all clients refresh in ≤30s |

---

## 6. Business Logic — Critical Flows

> Yahan se deep technical hai. Project owner ko **kya kab trigger hota hai** samajhna important hai.

### 6.1 Trade Execution Lifecycle

**File:** [`backend/services/tradeEngine.js`](../backend/services/tradeEngine.js)

```
USER ORDER PLACE
       ↓
1. POST /api/trade → tradeEngine.openTrade()
2. Validate: market hours, balance > 0, free margin, trade count limits, SL/TP rules
3. Apply charges: spread (pips→$) + commission (per lot OR % notional)
4. Calculate margin: (qty × contractSize × price) / leverage
5. Deduct commission from balance
6. Save Trade with status:
   - 'OPEN' (Market order, immediately filled)
   - 'PENDING' (Limit/Stop, waits for trigger)
       ↓
[BACKGROUND] Every 1 sec: checkPendingOrders()
   - BUY_LIMIT triggers when ask ≤ price
   - BUY_STOP triggers when ask ≥ price
   - On fill: status → OPEN, if master → copy to followers
       ↓
[BACKGROUND] Every 1 sec: checkSlTpForAllTrades()
   - Reads priceCache (from Infoway)
   - BUY: close at SL if bid ≤ SL, at TP if bid ≥ TP (SELL reversed)
   - Close price = exact SL/TP level
   - PnL realized = (close - open) × qty × contractSize - swap - closeCommission
       ↓
[BACKGROUND] Every 5 sec: checkAllAccountsStopOut()
   - Margin Level = (Equity / Used Margin) × 100
   - Trigger: Margin Level ≤ stop-out threshold (default 100%) OR Equity ≤ 0
   - Force-close ALL trades, largest losses first
       ↓
[ON CLOSE] processTradeCommission(trade)
   - IB engine walks upline 20 levels, distributes commission
       ↓
[ON CLOSE] copyTradingEngine.closeFollowerTrades()
   - All follower copies auto-close at same price
```

**Market hours rule:** Forex/Metals closed Fri 22:00 UTC – Sun 22:00 UTC; crypto always open.

**Profit/Loss math at close:**
- Profit → added to balance
- Loss → deducted from balance first, then from `credit` if needed

---

### 6.2 Real-Time Price Feed

**File:** [`backend/services/infowayService.js`](../backend/services/infowayService.js)

```
INFOWAY API (external)
       ↓
WS Connections (3 channels):
  - 'common'  → Forex / Metals / Energy / Indices
  - 'crypto'  → BTC, ETH, USDT pairs
  - 'stock'   → AAPL.US, TSLA.US etc.
       ↓
DEPTH_PUSH messages (best bid/ask)
       ↓
infowayService parses → updates `priceCache` Map (symbol → {bid, ask, mid, time})
       ↓
Callback onPriceUpdate(symbol, data)
       ↓
server.js Socket.IO emits:
  - 'priceUpdate' (single symbol tick) → to 'prices' room
  - 'priceStream' (batch of updated symbols) → to 'prices' room
       ↓
Frontend (TradingPage, OrderBook, MobilePage) subscribed → live UI update
       ↓
[PARALLEL] tradeEngine background jobs read same priceCache for SL/TP / stop-out checks
```

**Symbol mapping:** Internal `BTCUSD` ↔ Infoway `BTCUSDT`; internal `AAPL` ↔ Infoway `AAPL.US`.

**Resilience:** 30-sec heartbeat per channel, 5-sec auto-reconnect on drop. Fallback: hardcoded symbol list if Infoway REST API down on startup.

---

### 6.3 Wallet & Deposit/Withdraw

**Files:** [`backend/routes/wallet.js`](../backend/routes/wallet.js), [`backend/models/Wallet.js`](../backend/models/Wallet.js), [`backend/models/Transaction.js`](../backend/models/Transaction.js)

**Architecture:** **Wallet** = cash reserve. **Trading Account balance** = capital deployed. Transfer via `/api/wallet/transfer-to-trading` & reverse.

**Deposit flow:**
1. `POST /api/wallet/deposit` (amount, paymentMethod, optional screenshot)
2. Bonus auto-check: FIRST_DEPOSIT vs REGULAR rules, min deposit, usage limits
3. Bonus amount calculated (PERCENTAGE applies cap)
4. Transaction saved as `Pending`, wallet `pendingDeposits` += amount
5. `deposit_pending` email sent
6. **Admin reviews** at `/admin/funds`
7. `PUT /api/wallet/admin/approve/:id` → balance += deposit + bonus
8. If bonus → `UserBonus` record created with wager requirement
9. `deposit_success` email sent

**Withdrawal flow (3-step OTP):**
1. `POST /api/wallet/send-withdrawal-otp` → email OTP
2. `POST /api/wallet/verify-withdrawal-otp` → returns 15-min JWT (scope=withdrawal)
3. `POST /api/wallet/withdraw` (with token, amount, bank details)
4. Transaction saved as `Pending`, `pendingWithdrawals` += amount
5. Admin approves → balance debits, pending clears
6. **Crypto withdrawals:** Oxapay gateway handles payout

**Transfer to trading account:** Atomic: wallet balance -= amount, tradingAccount.balance += amount.

---

### 6.4 IB Commission System (NEW Engine)

**Files:** [`backend/services/ibEngineNew.js`](../backend/services/ibEngineNew.js), [`backend/routes/ibNew.js`](../backend/routes/ibNew.js), [`backend/services/ibEvents.js`](../backend/services/ibEvents.js)

**Setup:**
1. User applies — `IBApplication` created (PENDING)
2. Admin approves — user `ibStatus = ACTIVE`, unique `referralCode` generated
3. IB level assigned (1 if no parent, 2+ if referred)

**On every trade close** → `ibEngine.processTradeCommission(trade)`:

```
GROSS COMMISSION POOL = spread ($) + ticket commission + per-lot from account type
   Example: 0.01 lot EURUSD at 1.0850 with 2-pip spread
            = 0.01 × 100000 × 0.0002 = $20 spread revenue
       ↓
getIBChain(userId) — walks parentIBId up to 20 levels
       ↓
For each level L (1 = direct, 2 = grand-IB, ...):
   - Fetch commission % from IBCommissionConfig (per account type × level)
   - IB cut = grossCommission × (commissionPercent / 100)
   - Create IBCommission record
   - Credit IBWallet.balance
   - Emit 'IB_COMMISSION_DISTRIBUTED' event (Socket.IO via ibEvents listener)
       ↓
Remainder → platform/admin share (IBPlatformRevenue record for reporting)
```

**Default tiers:** [30%, 22%, 15%, 8%, 5%] per level (admin configurable). Applied **per trade**, not daily/volume-based.

**Validation:** Each level ≤ previous, sum < 100%.

> **Routing quirk:** `/api/admin/ib/*` rewritten to `/api/ib/admin/*` in `server.js` (~line 277). Don't duplicate routes.

---

### 6.5 Copy Trading

**File:** [`backend/services/copyTradingEngine.js`](../backend/services/copyTradingEngine.js)

**Setup:**
1. User makes one of their trading accounts a master — `MasterTrader.create({tradingAccountId, status: 'ACTIVE'})`
2. Other users discover via `/copytrade`
3. Follower picks copy mode + creates `CopyFollower` record

**Copy modes:**
| Mode | Follower qty calculation |
|---|---|
| `FIXED_LOT` | fixed qty (user-set) |
| `BALANCE_BASED` | masterQty × (followerBalance / masterBalance) |
| `EQUITY_BASED` / `AUTO` | masterQty × (followerEquity / masterEquity) |
| `MULTIPLIER` | masterQty × multiplier (e.g. 2×) |

**On master opens trade** → `copyTradeToFollowers()`:
- For each active follower: calc lot, check active + margin, create `CopyTrade` record, open in follower's account at same symbol/side/SL/TP

**On master closes** → `closeFollowerTrades()` closes all copies at same price.

**Daily commission cron** (23:59 UTC):
- `cron.schedule('59 23 * * *', copyTradingEngine.calculateDailyCommission())`
- Per follower: fixed fee, % of profit, etc. (per master's profile)
- Creates `CopyCommission` records, debits follower wallet OR takes % of realized PnL

---

### 6.6 Prop Firm Challenge

**Files:** [`backend/services/propTradingEngine.js`](../backend/services/propTradingEngine.js), [`backend/models/Challenge.js`](../backend/models/Challenge.js), [`backend/models/ChallengeAccount.js`](../backend/models/ChallengeAccount.js)

**Phases:**
- **Phase 1 (Qualification):** Profit target + drawdown limits
- **Phase 2 (Verification):** Repeat with tighter rules (optional, depends on challenge)
- **Phase 3 (FUNDED):** User trades real money, profit-split with platform

**Lifecycle:**
```
1. User buys: POST /api/prop/buy-challenge (wallet debit)
       ↓
2. propTradingEngine.createChallengeAccount():
   - accountId (CH-prefixed)
   - initialBalance = fundSize (e.g. $10,000)
   - currentPhase = 1, totalPhases = 2
   - status = 'ACTIVE'
   - expiresAt = now + challengeExpiryDays (default 30)
       ↓
3. On every trade: validateTradeOpen()
   - Phase status check
   - SL mandatory (if rule set)
   - Max trades/day, max concurrent
   - Daily DD %, overall DD %
       ↓
4. Outcomes:
   - PASS: profitTarget reached + DD within limits → advance phase
   - FAIL: DD breached → status=FAILED, account locked
   - EXPIRED: expiryDays passed → status=EXPIRED
       ↓
5. FUNDED: Final phase passed → eligible for withdrawal
   - Payout = (finalBalance - initialBalance) × profitSplitPercent (e.g. 80%)
```

**Per-challenge admin config:** Rules (DD %, profit targets), expiry days, profit split, fee — all in `Challenge` model.

---

### 6.7 KYC Flow

**Files:** [`backend/routes/kyc.js`](../backend/routes/kyc.js), [`backend/models/KYC.js`](../backend/models/KYC.js)

1. User submits: `POST /api/kyc/submit-files` (multipart):
   - Front image (ID/passport)
   - Back image (optional)
   - Selfie (face verification, optional)
   - Document type + number
2. Multer stores in `backend/uploads/kyc/` (10MB limit, image types only)
3. `KYC` record created, status = `pending`
4. User blocked from high withdrawals until approved
5. **Admin reviews** at `/admin/kyc`
6. Approve → user `KYC_STATUS = VERIFIED`, withdrawal limits lift
7. Reject (with reason) → user resubmits

**File serving:** Uploads accessible at `/uploads/kyc/{filename}` (static serve from `server.js`). No DB blob storage — filesystem-backed.

---

### 6.8 Daily Swap (Overnight Charge)

**Cron:** `0 22 * * *` UTC (22:00 UTC daily)
**Code:** `tradeEngine.applySwap()`

For each open trade:
- Fetch swap rate (long/short) per symbol
- If `POINTS`: swapAmount = `qty × swapRate`
- If `PERCENTAGE`: swapAmount = `(qty × contractSize × openPrice) × (swapRate / 100)`
- Added to trade's `swap` field (cumulative)
- At close, subtracted from realized PnL

---

### 6.9 Email System

**File:** [`backend/services/emailService.js`](../backend/services/emailService.js), DB-backed in `EmailTemplate` model.

**Function:** `sendTemplateEmail(slug, toEmail, variables)`:
- Fetches template by slug from DB
- Replaces `{{variable}}` placeholders
- Sends via Nodemailer (SMTP from `EmailSettings` singleton)

**When sent:**
| Event | Template slug |
|---|---|
| Signup | `email_verification` |
| Deposit submitted | `deposit_pending` |
| Deposit approved | `deposit_success` |
| Withdrawal submitted | `withdrawal_pending` |
| Withdrawal approved | `withdrawal_success` |
| KYC | `kyc_approved`, `kyc_rejected` |
| IB approved | `ib_approved` |
| Copy trade | follower notifications |
| Prop challenge | phase results, expiry warnings |

**SMTP ports:** 465 = SSL, 587 = STARTTLS, 25 = plain.
**Templates auto-seeded** on server startup via `seedEmailTemplates()`.

---

### 6.10 Authentication

**JWT tokens:**
- User: `POST /api/auth/login` → 7-day JWT with user ID
- Admin: separate JWT with admin ID
- Validated via middleware on protected routes (`Authorization: Bearer <token>`)
- OTP optional (toggle via `EmailSettings.otpVerificationEnabled`)

**Signup flow** (if OTP enabled):
1. `POST /api/auth/send-otp` → email OTP
2. `POST /api/auth/verify-otp` → confirms
3. `POST /api/auth/register` → user created, auto-login token returned

**Login-as-User** (admin support feature):
- Admin can impersonate user for troubleshooting
- Generates user JWT on behalf of admin (`Login as User` button in `/admin/users` modal)

---

## 7. Background Jobs Cheat Sheet

> **Yeh table sabse important hai** — kya kab fire hota hai.

| Job | Schedule | Trigger | Effect |
|---|---|---|---|
| **SL/TP Auto-Close** | Every 1 sec | `setInterval(checkSlTpForAllTrades, 1000)` | Reads `priceCache`, closes trades hitting SL/TP, processes IB commission, closes copies |
| **Stop-Out Check** | Every 5 sec | `setInterval(checkAllAccountsStopOut, 5000)` | Force-closes all trades when Margin Level ≤ threshold (default 100%) or Equity ≤ 0; largest losses first |
| **Pending Order Execution** | Every 1 sec | `setInterval(checkPendingOrders, 1000)` | Fills Limit/Stop orders when price hits trigger; mirrors to followers if master |
| **Daily Copy Commission** | 23:59 UTC | `cron.schedule('59 23 * * *')` | Per-follower commission calc, creates `CopyCommission` records, debits/credits wallets |
| **Daily Swap Application** | 22:00 UTC | `cron.schedule('0 22 * * *')` | Applies overnight swap charges to all open trades |
| **Theme Refresh (client)** | Every 30 sec | `setInterval(fetchTheme, 30000)` in `ThemeContext.jsx` | Frontend polls `/api/theme/active` to catch admin theme changes |

---

## 8. Key Backend Models — Quick Reference

| Model | Key fields | Purpose |
|---|---|---|
| **User** | email, password, referralCode, ibStatus, ibLevel, parentIBId, kycStatus | Account + IB upline |
| **Wallet** | userId, balance, pendingDeposits, pendingWithdrawals | Cash reserve |
| **TradingAccount** | userId, accountId, balance, credit, leverage, accountTypeId, status | Trading capital |
| **Trade** | tradingAccountId, symbol, side, openPrice, qty, stopLoss, takeProfit, marginUsed, swap, status | Single trade record |
| **Transaction** | walletId, userId, type, status, bonusAmount, bonusId, paymentMethod | Deposit/withdrawal log |
| **ChallengeAccount** | userId, challengeId, status, currentPhase, totalPhases, rules, initialBalance | Prop challenge participant |
| **Challenge** | name, fundSize, fee, rules (DD%, profitTarget%, expiry, profitSplit) | Challenge template |
| **MasterTrader** | tradingAccountId, status, commissionPercent | Copy trade signal source |
| **CopyFollower** | masterId, followerId, copyMode, copyValue, maxLotSize | Subscription record |
| **CopyTrade** | masterTradeId, followerId, openPrice, qty, status | Mirrored trade |
| **IBCommission** | tradeId, ibUserId, level, commissionAmount, status | Per-level commission entry |
| **IBWallet** | userId, balance | Affiliate earnings cash |
| **IBCommissionConfig** | accountTypeId, level, percentage | Tier configuration |
| **KYC** | userId, status, documentType, frontImage, backImage, selfieImage | Verification record |
| **EmailTemplate** | slug, subject, htmlBody | Email templates |
| **Bonus** | type, percentage, minDeposit, maxBonus, wagerRequirement | Bonus campaign |
| **UserBonus** | userId, bonusId, status, withdrawnAmount | User bonus claim |
| **Admin** | email, role (SUPER_ADMIN/ADMIN), sidebarPermissions | Admin user |
| **PaymentMethod** | type (bank/UPI/crypto), config, active | Payment options |
| **Charges** | symbol, spread, commission, swapLong, swapShort | Per-symbol fees |
| **AccountType** | name, minDeposit, leverage, exposureLimit, isDemo | Trading account template |

---

## 9. Technical Gotchas & Conventions

### 9.1 IB Routing Quirk
`/api/admin/ib/*` is rewritten to `/api/ib/admin/*` in [`server.js`](../backend/server.js). Both paths hit same handlers — **don't duplicate routes**. Legacy `ibEngine.js` + `IBCommission.js` still in repo but **not mounted**; the active engine is `ibEngineNew.js`.

### 9.2 Price Cache is Single Source
`priceCache` Map in `infowayService` is **the** source of truth. Background jobs (`tradeEngine`) read from it directly, not from DB. If Infoway WS drops and cache stales, trades won't auto-close — `server.js` reconnect logic + heartbeats critical.

### 9.3 Wallet vs Trading Account
**Separate balances.** Wallet = cash reserve. Trading account = deployed capital. User explicitly transfers between them. This trips up new devs — they expect one balance.

### 9.4 Money Stored as Float
All money values stored as plain JS numbers (NOT `Decimal128`). Be careful with new commission/PnL math — floating-point precision issues possible at scale.

### 9.5 Mongoose ObjectIds
Use `mongoose.Types.ObjectId` when comparing IDs. String comparisons fail silently.

### 9.6 Backend = ESM
`backend/package.json` has `"type": "module"`. Use `import`, not `require`.

### 9.7 Windows Dev Environment
Repo path contains a space (`d:\setupfx code\bull4x\`). Always **quote paths** in shell commands. Use forward slashes in code (POSIX-style).

### 9.8 Email Templates Auto-Seeded
On startup, `seedEmailTemplates()` inserts default templates if missing. Custom edits in `/admin/email-templates` persist (seed only inserts missing slugs).

### 9.9 Theme System
Server-driven theme via `/api/theme/active` endpoint. Frontend polls every 30s. CSS variables (`--theme-primary`, `--theme-bgCard`, etc.) on `:root`. **Tailwind tokens** (`bg-dark-*`, `accent-green`) are mapped to these variables in `tailwind.config.js`, so theme change auto-cascades to all components.

### 9.10 Frontend has TWO design systems
- **Main app** (`pages/`, `components/`) — Tailwind utility-first, blue/cyan brand (now overridden to **gold** via `index.css` globals to match landing)
- **Landing** (`bull4xLanding/`) — Custom CSS in `bull4x-landing.css`, "Cyber-Samurai" theme (gold + bull-dark + framer-motion + watermarks)
- Landing components use `lucide-react` (recently migrated from `react-icons/fi`)

---

## 10. Repo Layout — One Page Map

```
Bull4x-/
├── CLAUDE.md                    ← top-level architecture summary (always read first)
├── docs/
│   ├── COMMISSION-OVERVIEW.md
│   └── WEBSITE-FLOW.md          ← this document
├── backend/
│   ├── server.js                ← entrypoint, mounts routes, starts cron + intervals
│   ├── routes/                  ← Express routers per domain
│   │   ├── auth.js, admin.js, wallet.js, trade.js
│   │   ├── ibNew.js             ← active IB router
│   │   ├── copyTrading.js, prop.js, kyc.js, support.js, etc.
│   ├── services/                ← business logic engines
│   │   ├── tradeEngine.js       ← THE order/SL/TP/stop-out engine
│   │   ├── propTradingEngine.js ← challenge logic
│   │   ├── copyTradingEngine.js ← master/follower mirror
│   │   ├── ibEngineNew.js       ← multi-level commission distribution
│   │   ├── infowayService.js    ← live price WS
│   │   ├── emailService.js, oxapayService.js
│   │   └── ibEvents.js          ← EventEmitter bridge → Socket.IO
│   ├── models/                  ← 50+ Mongoose schemas
│   ├── uploads/                 ← KYC images, banner uploads (served at /uploads)
│   └── scripts/                 ← seedCredentials.js, createAdmin.js
└── frontend/
    └── src/
        ├── App.jsx              ← router: user, admin, branded routes
        ├── main.jsx             ← entry, ThemeProvider, Toaster
        ├── index.css            ← global styles + theme variables + Tailwind overrides
        ├── context/
        │   ├── ThemeContext.jsx ← server theme fetch + dark/light toggle
        │   └── LanguageContext.jsx
        ├── pages/               ← user + admin pages (Admin*.jsx prefix)
        ├── components/
        │   ├── AdminLayout.jsx  ← admin sidebar + header (permission gate)
        │   ├── UserHeader.jsx, MobileLayout.jsx, BannerSlider.jsx
        ├── services/            ← price streaming helpers (client-side)
        ├── config/api.js        ← API_URL config
        ├── i18n/                ← i18next translations
        └── bull4xLanding/       ← marketing site (separate design system)
            ├── bull4x-landing.css
            ├── components/      ← Navbar, Footer, MarketTicker, AnimatedSection
            └── pages/           ← Home, About, Pricing, Contact, etc.
                ├── home/        ← 19 sectional components for Home.jsx
                └── legal/       ← Privacy, Terms, etc.
```

---

## 11. Quick Pointers — Kya samajhna chahiye

- **Sab "wallet ops" pehle `Pending`** hote hain, then admin approval pe execute hote hain. Admin ka role real time hai.
- **Trade engine = real-time engine** (1-sec interval). Stop-out 5-sec. Yeh continuous chalte hain backend pe.
- **IB commission = per-trade** (not daily). Trade close hote hi sara chain (20 levels) walk hota hai.
- **Copy trade commission = daily** (23:59 UTC cron).
- **Swap = daily 22:00 UTC**.
- **Price feed = single source of truth** (Infoway WS → priceCache Map). Disconnect = no auto-close.
- **2 design systems frontend pe** — main app + bull4xLanding. Recently theme unified to gold across both via CSS variables.
- **Server-driven theme** = admin can change UI colors from `/admin/theme` and all clients refresh in 30 sec.
- **IB has TWO engines** — new one (`ibEngineNew.js` + `ibNew.js` + `IB*New` models) is active; legacy still in code but unmounted.
- **Mobile = separate route** (`/mobile`), auto-redirect if width < 768px.
- **White-label** = `/:slug/login`, `/:slug/signup` for partner brands.

---

**End of document.** Agar kuch flow more depth me chahiye (e.g. specific endpoint signature, exact field validation rules, ya particular admin permission matrix), bata dena — append kar dunga.
