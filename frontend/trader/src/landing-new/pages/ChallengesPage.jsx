'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  Globe2,
  Clock,
  Coins,
  LineChart,
  Bitcoin,
  CircleDollarSign,
  Zap,
  Target,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const BRAND_GRADIENT =
  'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)';

/* ── Forex markets available on every live account ──────────────────────── */
const forexMarkets = [
  {
    icon: CircleDollarSign,
    name: 'Major Pairs',
    count: '7 pairs',
    items: 'EUR/USD · GBP/USD · USD/JPY · USD/CHF · AUD/USD · USD/CAD · NZD/USD',
    spread: 'From 0.1 pips',
  },
  {
    icon: Globe2,
    name: 'Minor Pairs',
    count: '20+ crosses',
    items: 'EUR/GBP · EUR/JPY · GBP/JPY · AUD/JPY · CHF/JPY · EUR/AUD',
    spread: 'From 0.5 pips',
  },
  {
    icon: TrendingUp,
    name: 'Exotic Pairs',
    count: '15+ pairs',
    items: 'USD/TRY · USD/ZAR · USD/MXN · USD/SGD · USD/HKD · EUR/TRY',
    spread: 'From 2.0 pips',
  },
  {
    icon: Coins,
    name: 'Metals',
    count: 'Spot + CFDs',
    items: 'XAU/USD (Gold) · XAG/USD (Silver) · XPT/USD · XPD/USD',
    spread: 'From 0.15 pips',
  },
  {
    icon: LineChart,
    name: 'Global Indices',
    count: '12 indices',
    items: 'US30 · NAS100 · SPX500 · GER40 · UK100 · JP225 · HK50',
    spread: 'From 0.5 points',
  },
  {
    icon: Bitcoin,
    name: 'Crypto CFDs',
    count: '24/7 markets',
    items: 'BTC/USD · ETH/USD · SOL/USD · XRP/USD · ADA/USD · DOGE/USD',
    spread: 'From 8 pips',
  },
];

/* ── Forex trading sessions ─────────────────────────────────────────────── */
const sessions = [
  {
    name: 'Sydney',
    hours: '22:00 – 07:00 UTC',
    pairs: 'AUD, NZD, JPY pairs',
    accent: '#0158c6',
  },
  {
    name: 'Tokyo',
    hours: '00:00 – 09:00 UTC',
    pairs: 'JPY pairs, AUD/JPY, USD/JPY',
    accent: '#0199c6',
  },
  {
    name: 'London',
    hours: '07:00 – 16:00 UTC',
    pairs: 'EUR, GBP majors, XAU/USD',
    accent: '#4dbe51',
  },
  {
    name: 'New York',
    hours: '12:00 – 21:00 UTC',
    pairs: 'USD majors, indices, crypto',
    accent: '#81ce65',
  },
];

/* ── Map admin promotion docs → tier/bonus structure ────────────────────── */
function buildPhases(c) {
  const r = c.rules || {};
  const fmtPct = (v) => (v == null || v === '' ? null : `${v}%`);
  const fmtDays = (v) => (v == null || v === '' ? null : `${v} days`);
  const fmtBool = (v) => (v ? 'Yes' : 'No');

  const baseRules = (target) => [
    target ? { key: 'Bonus Value', value: target } : null,
    fmtPct(r.maxDailyDrawdownPercent) && {
      key: 'Min Deposit Match',
      value: fmtPct(r.maxDailyDrawdownPercent),
    },
    fmtPct(r.maxOverallDrawdownPercent) && {
      key: 'Max Bonus Cap',
      value: fmtPct(r.maxOverallDrawdownPercent),
    },
    r.maxOneDayProfitPercentOfTarget != null && {
      key: 'Volume Requirement',
      value: `${r.maxOneDayProfitPercentOfTarget}% of bonus`,
    },
    fmtDays(r.tradingDaysRequired) && {
      key: 'Active Days Required',
      value: fmtDays(r.tradingDaysRequired),
    },
    fmtDays(r.challengeExpiryDays) && {
      key: 'Promotion Validity',
      value: fmtDays(r.challengeExpiryDays),
    },
    { key: 'Withdrawable Profits', value: fmtBool(r.allowNewsTrading) },
  ].filter(Boolean);

  if (c.stepsCount === 2) {
    return [
      { label: 'Tier 1 — Initial Deposit', rules: baseRules(fmtPct(r.profitTargetPhase1Percent)) },
      { label: 'Tier 2 — Top-up Deposit',  rules: baseRules(fmtPct(r.profitTargetPhase2Percent)) },
    ];
  }
  if (c.stepsCount === 1) {
    return [{ label: 'Single-tier bonus', rules: baseRules(fmtPct(r.profitTargetPhase1Percent)) }];
  }
  return [{ label: 'Instant credit', rules: baseRules(fmtPct(r.profitTargetInstantPercent)) }];
}

function challengeTagline(c) {
  if (c.stepsCount === 0) return 'Bonus credited instantly on first deposit.';
  if (c.stepsCount === 1) return 'Single-tier bonus. Deposit once and the credit lands in your live account.';
  return 'Two-tier bonus. Stack rewards as you scale your deposit.';
}

/* ── Static fallback promotion cards (shown when no live API data) ──────── */
const staticPromotions = [
  {
    name: 'Welcome Bonus',
    tagline: 'Bonus credited instantly on first deposit.',
    description:
      'Open a live account, fund your first deposit, and a 50% welcome bonus is credited to your trading balance within minutes. Trade the required volume on any instrument to unlock withdrawal.',
    highlight: true,
    rules: [
      { key: 'Bonus Value',         value: '50% of deposit' },
      { key: 'Max Bonus',           value: '$500' },
      { key: 'Min Deposit',         value: '$100' },
      { key: 'Volume Requirement',  value: '5 standard lots' },
      { key: 'Promotion Validity',  value: '30 days' },
      { key: 'Eligible Accounts',   value: 'Standard / Pro' },
    ],
  },
  {
    name: 'Deposit Bonus',
    tagline: 'Stacks on every qualifying top-up.',
    description:
      'Earn 30% credit on every deposit you make into a live account, capped at $5,000 total. Stack the bonus with cashback rebates for maximum reward per trade.',
    highlight: false,
    rules: [
      { key: 'Bonus Value',         value: '30% of deposit' },
      { key: 'Max Bonus',           value: '$5,000' },
      { key: 'Min Deposit',         value: '$200' },
      { key: 'Volume Requirement',  value: '20 standard lots' },
      { key: 'Promotion Validity',  value: '60 days' },
      { key: 'Eligible Accounts',   value: 'All live accounts' },
    ],
  },
  {
    name: 'Cashback Rebate',
    tagline: 'Always-on. Per closed lot. No opt-in.',
    description:
      'Automatic cashback on every closed standard lot — across forex, metals, indices, and crypto CFDs. The more you trade each month, the higher your rebate tier. Settles daily, withdrawable on demand.',
    highlight: false,
    rules: [
      { key: 'Rebate Rate',         value: 'Up to $5 / lot' },
      { key: 'Max Payout',          value: 'Unlimited' },
      { key: 'Min Deposit',         value: 'None — live accounts' },
      { key: 'Volume Requirement',  value: 'Per closed lot' },
      { key: 'Promotion Validity',  value: 'Always-on' },
      { key: 'Eligible Accounts',   value: 'All live accounts' },
    ],
  },
];

/* ── Promotion comparison rows (static, marketing-style) ────────────────── */
const comparisonRows = [
  { feature: 'Promotion type',         instant: 'Welcome bonus',     step1: 'Deposit bonus',  step2: 'Cashback rebate' },
  { feature: 'Bonus on first deposit', instant: '50%',               step1: '30%',            step2: '—' },
  { feature: 'Cashback per lot',       instant: '—',                 step1: '—',              step2: 'Up to $5' },
  { feature: 'Min deposit',            instant: '$100',              step1: '$200',           step2: 'None' },
  { feature: 'Max bonus / rebate',     instant: '$500',              step1: '$5,000',         step2: 'Unlimited' },
  { feature: 'Volume requirement',     instant: '5 standard lots',   step1: '20 standard lots', step2: 'Per closed lot' },
  { feature: 'Promotion validity',     instant: '30 days',           step1: '60 days',        step2: 'Always-on' },
  { feature: 'Eligible accounts',      instant: 'Standard / Pro',    step1: 'All live accounts', step2: 'All live accounts' },
  { feature: 'EAs & copy trading',     instant: 'Allowed',           step1: 'Allowed',        step2: 'Allowed' },
  { feature: 'Profits withdrawable',   instant: 'After 5 lots',      step1: 'After 20 lots',  step2: 'Anytime' },
];

/* ─────────────────────────────────────────────────────────────────────────── */
export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/prop/challenges`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.challenges)) {
          const order = { 0: 0, 1: 1, 2: 2 };
          const sorted = [...data.challenges].sort(
            (a, b) => (order[a.stepsCount] ?? 9) - (order[b.stepsCount] ?? 9)
          );
          setChallenges(sorted);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-12 md:pt-44 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p
            className="text-xs sm:text-sm font-semibold uppercase tracking-widest mb-4 inline-flex items-center gap-2"
            style={{
              background: BRAND_GRADIENT,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            <Target size={14} style={{ color: '#4dbe51' }} />
            Live Account Promotions
          </p>
          <h1
            className="text-[#0D0F1A] mb-6"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
            }}
          >
            Pick the promotion that{' '}
            <span
              style={{
                background: BRAND_GRADIENT,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              rewards every trade
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed mb-8">
            Welcome bonuses, deposit credits, cashback rebates, and referral rewards —
            credited directly to your live trading account. Stack them with tight spreads
            on 60+ forex pairs, metals, indices, and crypto CFDs on a fully regulated platform.
          </p>

          {/* Quick stats row */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
            {[
              '60+ Forex Pairs',
              '24/5 Markets',
              'Same-Day Withdrawals',
              'Cashback on Every Lot',
            ].map((tag) => (
              <span
                key={tag}
                className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border bg-white"
                style={{
                  borderColor: 'rgba(77,190,81,0.3)',
                  color: '#0158c6',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <Link href="/our-accounts"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] transition-all"
            style={{ background: BRAND_GRADIENT }}
          >
            Choose Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Forex Markets You Can Trade ─────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest mb-3">
              — Tradable Markets —
            </p>
            <h2
              className="text-[#0D0F1A] font-manrope"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              What You'll{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Trade
              </span>{' '}
              on Every Account
            </h2>
            <p className="text-base text-[#6B7080] max-w-2xl mx-auto mt-4">
              All instruments are unlocked from day one. No premium upgrades, no
              hidden tiers — every account gets the full Bull4x market list.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {forexMarkets.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.name}
                  className="rounded-2xl bg-white p-6 border border-[#E8EAF0] hover:border-[#4dbe51] hover:shadow-[0_8px_30px_rgba(77,190,81,0.12)] transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(77,190,81,0.12)' }}
                    >
                      <Icon size={20} style={{ color: '#4dbe51' }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#0D0F1A] font-manrope">
                        {m.name}
                      </h3>
                      <p className="text-xs text-[#0158c6] font-semibold">{m.count}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#6B7080] leading-relaxed mb-3 min-h-[42px]">
                    {m.items}
                  </p>
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-[#E8EAF0]">
                    <span className="text-[#6B7080]">Spreads</span>
                    <span className="font-bold text-[#0D0F1A]">{m.spread}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Live Promotions (API-driven) ────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest mb-3">
              — Three Reward Programmes —
            </p>
            <h2
              className="text-[#0D0F1A] font-manrope"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Choose Your{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Live Account Bonus
              </span>
            </h2>
          </div>

          <div className="space-y-6">
            {/* When live API data exists, render those cards; otherwise fall back to
                the always-visible static promotion cards so the page never appears empty. */}
            {!loading && challenges.length > 0 &&
              challenges.map((c, idx) => {
                const phases = buildPhases(c);
                return (
                  <div
                    key={c._id || c.name}
                    className={`rounded-2xl overflow-hidden border ${
                      idx === 0
                        ? 'border-[#4dbe51] shadow-[0_8px_40px_rgba(77,190,81,0.18)]'
                        : 'border-[#E8EAF0] shadow-[0_2px_16px_rgba(0,0,0,0.04)]'
                    }`}
                  >
                    <div className="px-6 sm:px-10 py-8 bg-[#FAFBFD] border-b border-[#E8EAF0]">
                      <div className="flex flex-wrap items-baseline gap-3 mb-2">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0D0F1A]" style={{ letterSpacing: '-0.02em' }}>
                          {c.name}
                        </h3>
                        <span className="text-sm font-medium" style={{ color: idx === 0 ? '#4dbe51' : '#0158c6' }}>
                          {challengeTagline(c)}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-[#6B7080] leading-relaxed max-w-3xl">
                        {c.description ||
                          'Live account promotion. Trade the required volume on any instrument and withdraw the bonus in USD, EUR, GBP, or USDT.'}
                      </p>
                    </div>

                    <div className="divide-y divide-[#E8EAF0]">
                      {phases.map((phase) => (
                        <div key={phase.label} className="px-6 sm:px-10 py-6">
                          <p className="text-xs font-bold text-[#0158c6] uppercase tracking-widest mb-4">
                            {phase.label}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                            {phase.rules.map((rule) => (
                              <div key={rule.key}>
                                <p className="text-xs text-[#6B7080] mb-1">{rule.key}</p>
                                <p className="text-sm sm:text-base font-bold text-[#0D0F1A]">{rule.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="px-6 sm:px-10 py-5 bg-[#FAFBFD] border-t border-[#E8EAF0] flex flex-wrap gap-4 items-center justify-between">
                      <p className="text-sm text-[#6B7080]">Ready to claim the {c.name.toLowerCase()}?</p>
                      <Link href="/our-accounts"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-[0_4px_12px_rgba(1,88,198,0.25)] hover:shadow-[0_8px_24px_rgba(77,190,81,0.4)]"
                        style={{ background: BRAND_GRADIENT }}
                      >
                        See accounts <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}

            {/* Static fallback cards — always shown when API returns nothing OR fails */}
            {(loading || challenges.length === 0) &&
              staticPromotions.map((p, idx) => (
                <div
                  key={p.name}
                  className={`rounded-2xl overflow-hidden border ${
                    p.highlight
                      ? 'border-[#4dbe51] shadow-[0_8px_40px_rgba(77,190,81,0.18)]'
                      : 'border-[#E8EAF0] shadow-[0_2px_16px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  <div className="px-6 sm:px-10 py-8 bg-[#FAFBFD] border-b border-[#E8EAF0]">
                    <div className="flex flex-wrap items-baseline gap-3 mb-2">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0D0F1A]" style={{ letterSpacing: '-0.02em' }}>
                        {p.name}
                      </h3>
                      <span className="text-sm font-medium" style={{ color: p.highlight ? '#4dbe51' : '#0158c6' }}>
                        {p.tagline}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-[#6B7080] leading-relaxed max-w-3xl">{p.description}</p>
                  </div>

                  <div className="px-6 sm:px-10 py-6">
                    <p className="text-xs font-bold text-[#0158c6] uppercase tracking-widest mb-4">Promotion Terms</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                      {p.rules.map((rule) => (
                        <div key={rule.key}>
                          <p className="text-xs text-[#6B7080] mb-1">{rule.key}</p>
                          <p className="text-sm sm:text-base font-bold text-[#0D0F1A]">{rule.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="px-6 sm:px-10 py-5 bg-[#FAFBFD] border-t border-[#E8EAF0] flex flex-wrap gap-4 items-center justify-between">
                    <p className="text-sm text-[#6B7080]">Ready to claim the {p.name.toLowerCase()}?</p>
                    <Link href="/auth/register"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-[0_4px_12px_rgba(1,88,198,0.25)] hover:shadow-[0_8px_24px_rgba(77,190,81,0.4)]"
                      style={{ background: BRAND_GRADIENT }}
                    >
                      Open Live Account <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ── Trading Sessions ────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest mb-3 inline-flex items-center gap-2">
              <Clock size={12} /> 24/5 Forex Schedule
            </p>
            <h2
              className="text-[#0D0F1A] font-manrope"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Trade Every{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Forex Session
              </span>
            </h2>
            <p className="text-base text-[#6B7080] max-w-2xl mx-auto mt-4">
              Markets open Sunday 22:00 UTC and run continuously until Friday 22:00 UTC.
              Pick your session, trade your edge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {sessions.map((s) => (
              <div
                key={s.name}
                className="rounded-2xl bg-white p-6 border border-[#E8EAF0] hover:shadow-[0_8px_30px_rgba(1,88,198,0.1)] transition-all"
                style={{ borderTopWidth: '3px', borderTopColor: s.accent }}
              >
                <h3 className="text-xl font-bold text-[#0D0F1A] font-manrope mb-1">
                  {s.name}
                </h3>
                <p className="text-xs font-semibold mb-4" style={{ color: s.accent }}>
                  {s.hours}
                </p>
                <p className="text-xs text-[#6B7080] uppercase tracking-wider mb-1">
                  Best Pairs
                </p>
                <p className="text-sm text-[#0D0F1A] font-semibold">{s.pairs}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promotion Comparison Table ──────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest mb-3">
              — Side by Side —
            </p>
            <h2
              className="text-[#0D0F1A] font-manrope"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Compare All{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Promotions
              </span>
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E8EAF0] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: BRAND_GRADIENT }} className="text-white">
                  <th className="text-left px-5 py-4 font-semibold">Feature</th>
                  <th className="text-center px-5 py-4 font-semibold">
                    <div className="flex items-center justify-center gap-1.5">
                      <Zap size={14} /> Welcome
                    </div>
                  </th>
                  <th className="text-center px-5 py-4 font-semibold">
                    <div className="flex items-center justify-center gap-1.5">
                      <Target size={14} /> Deposit
                    </div>
                  </th>
                  <th className="text-center px-5 py-4 font-semibold">
                    <div className="flex items-center justify-center gap-1.5">
                      <Shield size={14} /> Cashback
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {comparisonRows.map((row, idx) => (
                  <tr
                    key={row.feature}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFD]'}
                  >
                    <td className="px-5 py-3.5 text-[#0D0F1A] font-medium">
                      {row.feature}
                    </td>
                    <td className="text-center px-5 py-3.5 text-[#6B7080]">
                      {row.instant}
                    </td>
                    <td className="text-center px-5 py-3.5 text-[#6B7080]">
                      {row.step1}
                    </td>
                    <td className="text-center px-5 py-3.5 text-[#6B7080]">
                      {row.step2}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-center text-[#9AA0B4] mt-4">
            * Indicative bonus values. Exact terms per promotion are published on the live promotions page.
          </p>
        </div>
      </section>

      {/* ── Rules notes ─────────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 px-6 bg-[#0C0C1D]">
        <div className="max-w-4xl mx-auto">
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
            className="text-white mb-3 text-center font-manrope"
          >
            A few things you should know
          </h2>
          <p className="text-base text-[#9AA0B4] text-center max-w-2xl mx-auto mb-10">
            Short read. Plain terms — these are the promotion mechanics that
            most traders miss in the fine print.
          </p>

          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                t: 'Welcome vs Deposit Bonus',
                d: 'Welcome bonus is a one-time credit on your very first deposit into a live account. Deposit bonus is recurring — it stacks on every qualifying top-up. Both are credited within minutes of payment confirmation.',
              },
              {
                t: 'How volume requirements work',
                d: 'Most bonuses unlock for withdrawal once a small trading volume target is met (e.g. 5 standard lots). Volume counts from any closed trade across all instruments — forex, metals, indices, or crypto CFDs.',
              },
              {
                t: 'Cashback rebate mechanics',
                d: 'Cashback settles at the end of each trading day in your account base currency. Up to $5 per standard lot on the highest loyalty tier. Always-on, automatic — no opt-in or claim form required.',
              },
              {
                t: 'Referral bonus',
                d: 'Refer a friend and earn $50 once they fund $200 and trade 1 standard lot on a live account. There is no cap — both the referrer and the referee receive a matching credit.',
              },
              {
                t: 'Eligible account types',
                d: 'Most promotions are available on Standard, Pro, and ECN live accounts. VIP accounts have a custom rebate schedule arranged directly with your dedicated account manager.',
              },
              {
                t: 'Regional availability',
                d: 'Some promotions are restricted in jurisdictions where regulators do not permit broker bonuses (e.g. the United Kingdom and EEA). Eligibility is confirmed automatically based on your verified country of residence.',
              },
            ].map((item) => (
              <div
                key={item.t}
                className="border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 sm:p-6 bg-[#141428] hover:border-[#4dbe51] transition-colors"
              >
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} style={{ color: '#4dbe51' }} />
                  {item.t}
                </h3>
                <p className="text-sm text-[#9AA0B4] leading-relaxed pl-6">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
      <section className="py-14 md:py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: 'rgba(77,190,81,0.1)', color: '#4dbe51' }}
          >
            <TrendingUp size={14} />
            Use code BULL15 — 15% deposit bonus on any account
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
            className="text-[#0D0F1A] mb-5 font-manrope"
          >
            Ready to claim your bonus?
          </h2>
          <p className="text-base sm:text-lg text-[#6B7080] mb-8">
            Open a live forex account, pick your tier, and the welcome bonus lands
            the moment your first deposit clears.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] transition-all"
              style={{ background: BRAND_GRADIENT }}
            >
              Open Live Account <ArrowRight size={16} />
            </Link>
            <Link href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-[#4dbe51] text-[#4dbe51] font-semibold text-sm hover:bg-[#4dbe51] hover:text-white transition-all"
            >
              Try Free Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
