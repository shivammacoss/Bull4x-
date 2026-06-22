'use client'

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Layers,
  ShieldCheck,
  Newspaper,
  Clock,
  Bitcoin,
  Coins,
  LineChart,
  CircleDollarSign,
  CheckCircle2,
  Globe2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
const BRAND_GRADIENT =
  'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)';

/* ── Markets data (4 tabs) ──────────────────────────────────────────────── */
const markets = {
  forex: {
    icon: CircleDollarSign,
    label: 'Forex',
    title: 'Forex Trading',
    description:
      'Trade major, minor, and exotic currency pairs with institutional-grade spreads and deep liquidity from regulated Tier-1 providers. The world\'s most active market — your live trading edge starts here.',
    features: ['Tight Institutional Spreads', 'Sub-30ms Execution', 'No Requotes', 'EAs & Algos Allowed'],
    instruments: [
      'EUR/USD',
      'GBP/USD',
      'USD/JPY',
      'AUD/USD',
      'USD/CHF',
      'USD/CAD',
      'NZD/USD',
      'EUR/GBP',
    ],
    cta: 'Trade Forex Now',
  },
  metals: {
    icon: Coins,
    label: 'Metals',
    title: 'Precious Metals',
    description:
      'Spot gold, silver, platinum, and palladium with tight spreads. Hedge currency exposure or take directional setups around inflation prints and central-bank decisions.',
    features: ['XAU/USD from 0.15', 'Spot + CFDs', 'Hedging Allowed', '23/5 Schedule'],
    instruments: ['XAU/USD', 'XAG/USD', 'XPT/USD', 'XPD/USD'],
    cta: 'Trade Metals Now',
  },
  indices: {
    icon: LineChart,
    label: 'Indices',
    title: 'Global Indices',
    description:
      'Trade the headline US, EU, UK, and Asian equity indices. Tight spreads and competitive overnight financing — capture macro trends without juggling 50+ tickers.',
    features: ['US30, NAS100, SPX500', 'GER40, UK100', 'JP225, HK50', 'Tight Index Spreads'],
    instruments: ['US30', 'NAS100', 'SPX500', 'GER40', 'UK100', 'JP225', 'HK50', 'AUS200'],
    cta: 'Trade Indices Now',
  },
  crypto: {
    icon: Bitcoin,
    label: 'Crypto',
    title: 'Crypto CFDs',
    description:
      'Trade BTC, ETH, SOL, and other major cryptos as CFDs — no wallets, no custody concerns. 24/7 access including weekends with the same regulated execution as every other instrument.',
    features: ['24/7 Markets', 'No Wallet Needed', 'Weekend Trading', 'CFD Execution'],
    instruments: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'ADA/USD', 'DOGE/USD'],
    cta: 'Trade Crypto Now',
  },
};

const marketKeys = Object.keys(markets);

/* ── Trading conditions cards ───────────────────────────────────────────── */
const conditions = [
  {
    icon: Activity,
    title: 'From 0.0 pips',
    subtitle: 'Institutional Spreads',
    text: 'Raw spreads aggregated from Tier-1 liquidity providers — no markup, no hidden costs on your live account.',
  },
  {
    icon: Zap,
    title: 'Sub-30ms',
    subtitle: 'Fast Execution',
    text: 'Millisecond order routing with no requotes or rejections, even during NFP, FOMC, and ECB releases.',
  },
  {
    icon: TrendingUp,
    title: 'Up to 1:500',
    subtitle: 'Flexible Leverage',
    text: 'Account leverage scales per tier and instrument — manage exposure without margin headaches.',
  },
  {
    icon: Layers,
    title: 'Tier-1 LPs',
    subtitle: 'Deep Liquidity',
    text: 'Price feeds aggregated from regulated Tier-1 banks and ECNs for the best available pricing across sessions.',
  },
  {
    icon: Newspaper,
    title: 'Allowed',
    subtitle: 'News Trading',
    text: 'Hold positions through any economic release — no blackout windows, no surprise rule changes.',
  },
  {
    icon: Clock,
    title: '24/5 + 24/7',
    subtitle: 'Always Open',
    text: 'Trade forex Sun 22:00 → Fri 22:00 UTC, plus crypto 24/7 including weekends. Pick your session.',
  },
];

/* ── Live rates ticker ──────────────────────────────────────────────────── */
const initialRates = [
  { symbol: 'EUR/USD', base: 1.0854, decimals: 4 },
  { symbol: 'GBP/USD', base: 1.2691, decimals: 4 },
  { symbol: 'USD/JPY', base: 156.42, decimals: 2 },
  { symbol: 'USD/CHF', base: 0.9087, decimals: 4 },
  { symbol: 'AUD/USD', base: 0.6612, decimals: 4 },
  { symbol: 'USD/CAD', base: 1.3724, decimals: 4 },
];

function generateRate(r) {
  const volatility = 0.0008;
  const move = (Math.random() - 0.5) * volatility * r.base;
  const bid = r.base + move;
  const spread = r.symbol === 'USD/JPY' ? 0.02 : 0.00003;
  const ask = bid + spread;
  const change = ((move / r.base) * 100).toFixed(2);
  const d = r.decimals;
  return {
    symbol: r.symbol,
    bid: bid.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }),
    ask: ask.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }),
    spread: r.symbol === 'USD/JPY' ? '0.2' : '0.3',
    change: (change >= 0 ? '+' : '') + change + '%',
    up: change >= 0,
  };
}

/* ─────────────────────────────────────────────────────────────────────────── */
export default function TradingPage() {
  const [activeMarket, setActiveMarket] = useState('forex');
  const [rates, setRates] = useState(() => initialRates.map(generateRate));

  const updateRates = useCallback(() => {
    setRates(
      initialRates.map((r) => {
        r.base += (Math.random() - 0.48) * r.base * 0.0003;
        return generateRate(r);
      })
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(updateRates, 3000);
    return () => clearInterval(interval);
  }, [updateRates]);

  const active = markets[activeMarket];
  const ActiveIcon = active.icon;

  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-14 md:pt-44 md:pb-20 px-6">
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
            <Globe2 size={14} style={{ color: '#4dbe51' }} />
            Global Markets
          </p>
          <h1
            className="text-[#0D0F1A] mb-5"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
            }}
          >
            Trade{' '}
            <span
              style={{
                background: BRAND_GRADIENT,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              Global Markets
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed mb-9">
            Access 60+ instruments across forex, metals, indices, and crypto CFDs — all
            from one institutional-grade live trading platform with same-day
            withdrawals.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/our-accounts"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] transition-all"
              style={{ background: BRAND_GRADIENT }}
            >
              Start Trading
              <ArrowRight size={16} />
            </Link>
            <Link href="/auth/login"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 border-[#4dbe51] text-[#4dbe51] font-semibold text-sm hover:bg-[#4dbe51] hover:text-white transition-all"
            >
              Open Demo Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Choose Your Market (Tabs) ───────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest mb-3">
              — Instruments —
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
                Market
              </span>
            </h2>
            <p className="text-base text-[#6B7080] max-w-2xl mx-auto mt-4">
              Explore Bull4x's full range of tradable instruments across all major asset classes.
            </p>
          </div>

          {/* Tab pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
            {marketKeys.map((key) => {
              const m = markets[key];
              const Icon = m.icon;
              const isActive = key === activeMarket;
              return (
                <button
                  key={key}
                  onClick={() => setActiveMarket(key)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                    isActive
                      ? 'text-white shadow-[0_6px_20px_rgba(77,190,81,0.32)]'
                      : 'bg-white text-[#0D0F1A] border border-[#E8EAF0] hover:border-[#4dbe51] hover:text-[#4dbe51]'
                  }`}
                  style={isActive ? { background: BRAND_GRADIENT } : undefined}
                >
                  <Icon size={16} />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Active market content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
            {/* Left: details */}
            <div className="rounded-2xl bg-white border border-[#E8EAF0] p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{ background: 'rgba(77,190,81,0.12)', color: '#4dbe51' }}>
                <ActiveIcon size={12} />
                {active.label}
              </div>
              <h3 className="text-2xl font-extrabold text-[#0D0F1A] font-manrope mb-3">
                {active.title}
              </h3>
              <p className="text-sm text-[#6B7080] leading-relaxed mb-6">
                {active.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {active.features.map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#FAFBFD] border border-[#E8EAF0]"
                  >
                    <CheckCircle2 size={14} style={{ color: '#4dbe51' }} className="shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-[#0D0F1A]">
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/our-accounts"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-semibold text-sm shadow-[0_4px_12px_rgba(1,88,198,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(77,190,81,0.4)] transition-all"
                style={{ background: BRAND_GRADIENT }}
              >
                {active.cta}
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Right: instruments */}
            <div className="rounded-2xl bg-white border border-[#E8EAF0] p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              <p className="text-xs font-bold text-[#0158c6] uppercase tracking-widest mb-4">
                Available Instruments
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {active.instruments.map((inst) => (
                  <div
                    key={inst}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#E8EAF0] hover:border-[#4dbe51] hover:bg-[rgba(77,190,81,0.04)] transition-all"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: '#4dbe51' }}
                    />
                    <span className="text-sm font-semibold text-[#0D0F1A] tabular-nums">
                      {inst}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Market Rates ───────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest mb-3">
              — Live Rates —
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
              Live Market{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Rates
              </span>
            </h2>
            <p className="text-base text-[#6B7080] max-w-2xl mx-auto mt-4">
              Real-time indicative prices for major forex pairs. Live feed updates
              every 3 seconds.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E8EAF0] shadow-[0_2px_16px_rgba(0,0,0,0.04)] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FAFBFD] border-b border-[#E8EAF0]">
                  <th className="text-left px-5 py-4 font-semibold text-[#6B7080] uppercase tracking-wider text-xs">
                    Instrument
                  </th>
                  <th className="text-right px-5 py-4 font-semibold text-[#6B7080] uppercase tracking-wider text-xs">
                    Bid
                  </th>
                  <th className="text-right px-5 py-4 font-semibold text-[#6B7080] uppercase tracking-wider text-xs">
                    Ask
                  </th>
                  <th className="text-right px-5 py-4 font-semibold text-[#6B7080] uppercase tracking-wider text-xs hidden sm:table-cell">
                    Spread
                  </th>
                  <th className="text-right px-5 py-4 font-semibold text-[#6B7080] uppercase tracking-wider text-xs">
                    Change
                  </th>
                  <th className="text-right px-5 py-4 font-semibold text-[#6B7080] uppercase tracking-wider text-xs">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r, idx) => (
                  <tr
                    key={r.symbol}
                    className={`border-b border-[#E8EAF0] last:border-0 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFD]'
                    }`}
                  >
                    <td className="px-5 py-3.5 font-bold text-[#0D0F1A]">
                      {r.symbol}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-[#0D0F1A] font-semibold transition-all duration-500">
                      {r.bid}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-[#0D0F1A] font-semibold transition-all duration-500">
                      {r.ask}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-[#6B7080] hidden sm:table-cell">
                      {r.spread}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold tabular-nums text-sm transition-colors duration-500 ${
                          r.up ? 'text-[#4dbe51]' : 'text-red-500'
                        }`}
                      >
                        {r.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {r.change}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href="/our-accounts"
                        className="inline-flex items-center px-4 py-1.5 rounded-full text-white text-xs font-semibold hover:-translate-y-0.5 transition-all"
                        style={{ background: BRAND_GRADIENT }}
                      >
                        Trade
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-center text-[#9AA0B4] mt-4">
            * Indicative prices for demonstration. Live execution prices may vary by milliseconds and session.
          </p>
        </div>
      </section>

      {/* ── Trading Conditions ──────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest mb-3 inline-flex items-center gap-2">
              <ShieldCheck size={12} /> Conditions
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
              Trading{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Conditions
              </span>
            </h2>
            <p className="text-base text-[#6B7080] max-w-2xl mx-auto mt-4">
              Transparent, institutional-grade conditions — built for serious
              traders across every account tier.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {conditions.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.subtitle}
                  className="rounded-2xl bg-white p-6 border border-[#E8EAF0] hover:border-[#4dbe51] hover:shadow-[0_8px_30px_rgba(77,190,81,0.12)] transition-all text-center"
                >
                  <div
                    className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(77,190,81,0.12)' }}
                  >
                    <Icon size={22} style={{ color: '#4dbe51' }} />
                  </div>
                  <p
                    className="text-2xl font-extrabold mb-1 font-manrope"
                    style={{
                      background: BRAND_GRADIENT,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      color: 'transparent',
                    }}
                  >
                    {c.title}
                  </p>
                  <p className="text-sm font-bold text-[#0D0F1A] mb-2">{c.subtitle}</p>
                  <p className="text-xs text-[#6B7080] leading-relaxed">{c.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: 'rgba(77,190,81,0.1)', color: '#4dbe51' }}
          >
            <TrendingUp size={14} />
            Use code BULL15 — 15% deposit bonus on first funding
          </div>
          <h2
            className="text-[#0D0F1A] font-manrope mb-5"
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Ready to Start{' '}
            <span
              style={{
                background: BRAND_GRADIENT,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              Trading?
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#6B7080] mb-8">
            Open a live account in minutes or try a free demo first —
            no risk, no obligation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] transition-all"
              style={{ background: BRAND_GRADIENT }}
            >
              Open Live Account
              <ArrowRight size={16} />
            </Link>
            <Link href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-[#4dbe51] text-[#4dbe51] font-semibold text-sm hover:bg-[#4dbe51] hover:text-white transition-all"
            >
              Try Demo Free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
