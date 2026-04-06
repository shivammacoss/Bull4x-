# Unicap — How commission works (with examples)

This document explains **trade fees**, **IB (Introducing Broker) payouts**, **copy trading profit share**, and how they relate. It matches the current `unicap` backend logic.

---

## 1. Three separate money flows (quick table)

| Flow | When | Who pays | Who receives | Main code |
|------|------|----------|--------------|-----------|
| **Broker / ticket** | Open / close trade | Trader (trading account balance) | Platform (revenue on the trade) | `services/tradeEngine.js` → `Trade` fields |
| **IB** | After trade processing | Not a second charge on user* | Upline IBs + platform remainder | `services/ibEngineNew.js` → `IBCommissionConfig`, `IBWallet` |
| **Copy master** | End of day (profitable days) | Follower trading balance | Master + admin pool | `services/copyTradingEngine.js` → `CopyCommission` |

\*IB split is calculated from a **gross pool derived from the trade** (spread + ticket commission, etc.). The trader already paid those ticket amounts; IBs get a **share of that pool**, not an extra line item on the ticket.

---

## 2. Trade commission (example)

**Scenario:** User opens **1 lot** EURUSD (MARKET). Account type / charges say **$7 per lot** ticket commission, spread is stored on the trade as **$X** per unit (implementation detail).

**Rough idea:**

- `Trade.commission` might be **$7** (charged at open from balance).
- `Trade.spread` reflects spread component used later for IB “gross” math.
- On close, if **commission on close** is enabled, `closeCommission` can add more.

**Example numbers (illustrative):**

| Field | Example value |
|-------|----------------|
| `quantity` (lots) | 1 |
| `commission` (ticket) | $7 |
| `spread` (as stored) | say $2 (simplified) |
| `closeCommission` | $0 |

The **trader’s wallet** is reduced by what the engine charges at open/close. These values live on **`Trade`** and feed the next step (IB gross pool).

---

## 3. IB commission — gross pool + multi-level % (example)

**When:** `tradeEngine` calls `ibEngine.processTradeCommission(trade)` (see `ibEngineNew.js`).

### Step A — Build **gross commission** (`calculateGrossCommission`)

Roughly:

- Spread cash ≈ `spread × quantity × contractSize`
- Plus ticket: `commission + closeCommission`
- Compare with **account type per-lot commission × quantity** — engine uses **max** of ticket path vs per-lot path (see code)
- Plus optional `accountType.spreadMarkup × quantity × contractSize`

**Example:**

- From ticket side: commission $7 + spread cash $18 → **$25** (illustrative)
- Per-lot from account type: $5 × 1 lot = **$5**
- Engine takes **max(25, 5) = $25** as base, then adds markup if any → say final **gross = $30**

### Step B — Find **IB chain**

- Start at trader’s `User.parentIBId`, walk up while parent is `isIB` and `ACTIVE`.
- **Level 1** = direct referrer IB, **Level 2** = their upline IB, etc.

**Example chain:**

- Trader T → IB A (L1) → IB B (L2) → IB C (L3)

### Step C — Apply **`IBCommissionConfig`** (per **account type** + **level**)

Admin sets rows like: Level 1 = **30%**, Level 2 = **22%**, Level 3 = **15%** of **gross** (not of each other).

**Example with gross = $100** (easy math):

| Chain level | IB | Config % | Cut |
|-------------|-----|----------|-----|
| 1 | A | 30% | $30 |
| 2 | B | 22% | $22 |
| 3 | C | 15% | $15 |
| **Total to IBs** | | | **$67** |
| **Platform (admin) remainder** | | | **$33** |

Each cut is stored in **`IBCommission`** (new model) and credited to **`IBWallet`** for that IB.

**If no IB chain:** whole gross goes to platform (`recordPlatformRevenue`).

### Important: `IBPlanNew` / “Default Plan”

- On **approve**, user gets `ibPlanId` (selected plan or **`getDefaultPlan()`** — named “Default Plan” with seeded level rates).
- The **live trade split** in `ibEngineNew.processTradeCommission` uses **`IBCommissionConfig`** (account type + level), **not** the per-level `$` rates inside `IBPlanNew` for that split.
- So: **Default plan** = stored **plan document** on the user; **actual % payout** for trades = **Commission %** admin UI → `IBCommissionConfig`.

---

## 4. Copy trading — daily profit share (example)

**When:** Cron / `calculateDailyCommission` groups **closed** copy trades by day, master, follower.

**Rule:** Only days where **follower’s total PnL for that group > 0**.

**Formulas (from code):**

- `totalCommission = dailyProfit × (approvedCommissionPercentage / 100)`  (master’s approved %)
- `adminShare = totalCommission × (adminSharePercentage / 100)`  (often **30%**)
- `masterShare = totalCommission - adminShare`

**Example:**

- Follower’s copied trades that day: **+$500** profit (sum of `followerPnl`).
- Master `approvedCommissionPercentage` = **20%**  
  → `totalCommission` = 500 × 20% = **$100**
- `adminSharePercentage` = **30%**  
  → admin = $100 × 30% = **$30**  
  → master = **$70**

**Money movement:**

- **$100** deducted from **follower trading account** (if balance OK).
- **`CopyCommission`** row: `adminShare`, `masterShare`, status `DEDUCTED` or `FAILED`.
- Master **`pendingCommission` / `totalCommissionEarned`** updated; **`CopySettings.adminCopyPool`** += admin share.

This is **not** the same as the IB “gross pool %” on the same trade ticket.

---

## 5. Admin “Earnings report” vs IB vs copy

- **Earnings → summary / by user / by symbol:** aggregates **`Trade.commission`, `swap`, etc.** — platform ticket/swap style revenue on trades.
- **Earnings → By Copy Master:** attributes trades linked to copy masters (follower + master account trades) and can show **`CopyCommission.adminShare`** separately for “admin commission” column.

---

## 6. One-page mental model

1. **Trader** pays **broker fees** on the trade → stored on **`Trade`**.
2. Same trade drives an **IB gross pool** → **`IBCommissionConfig`** splits % to upline IBs → rest **platform**.
3. **Copy** uses **follower daily profit** → **master %** then **admin % of that fee** → **`CopyCommission`**.

---

## 7. File map (for developers)

| Topic | Location |
|-------|----------|
| Ticket commission / spread on trade | `services/tradeEngine.js` |
| IB gross + split | `services/ibEngineNew.js` (`calculateGrossCommission`, `processTradeCommission`, `getIBChain`) |
| IB % config (admin UI) | `routes/ibNew.js` commission-config, `models/IBCommissionConfig.js` |
| Default IB plan document | `models/IBPlanNew.js` → `getDefaultPlan()` |
| Copy daily commission | `services/copyTradingEngine.js` → `calculateDailyCommission` |
| Copy commission records | `models/CopyCommission.js` |
| Earnings aggregates | `routes/earnings.js` |

---

*Examples use round numbers for teaching; live values depend on charges, account type, symbol contract size, and your admin config.*
