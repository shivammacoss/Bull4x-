'use client'

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Server,
  Award,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
import ContactFormModal from '../components/ContactFormModal';
const BRAND_GRADIENT =
  'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)';

/* ── Account tiers (Bull4x brokerage model) ──────────────────────── */
const tiers = [
  {
    name: 'Standard',
    eyebrow: 'Best for Beginners',
    rules: [
      { label: 'Min Deposit', value: '$100' },
      { label: 'Spreads From', value: '1.2 pips' },
      { label: 'Commission', value: 'Zero' },
      { label: 'Leverage', value: 'Up to 1:500' },
      { label: 'Base Currency', value: 'USD / EUR / GBP' },
      { label: 'Platforms', value: 'MT4 / MT5 / Web' },
    ],
    features: [
      'Forex, metals & indices',
      'Instant deposits & withdrawals',
      'EAs & copy trading allowed',
      '24/5 multilingual support',
    ],
    cta: 'Open Standard Account',
    popular: false,
  },
  {
    name: 'Pro',
    eyebrow: 'Most Popular',
    rules: [
      { label: 'Min Deposit', value: '$500' },
      { label: 'Spreads From', value: '0.6 pips' },
      { label: 'Commission', value: 'Zero' },
      { label: 'Leverage', value: 'Up to 1:500' },
      { label: 'Base Currency', value: 'USD / EUR / GBP' },
      { label: 'Platforms', value: 'MT4 / MT5 / Web' },
    ],
    features: [
      'All 60+ instruments unlocked',
      'Priority order execution',
      'Cashback on every lot',
      'Dedicated account manager',
    ],
    cta: 'Open Pro Account',
    popular: true,
  },
  {
    name: 'Demo',
    eyebrow: 'Risk-Free Practice',
    rules: [
      { label: 'Virtual Funds', value: '$100,000' },
      { label: 'Spreads From', value: 'Live market' },
      { label: 'Commission', value: 'Zero' },
      { label: 'Leverage', value: 'Up to 1:500' },
      { label: 'Base Currency', value: 'USD / EUR / GBP' },
      { label: 'Platforms', value: 'MT4 / MT5 / Web' },
    ],
    features: [
      'Identical to live conditions',
      'Practice with $100,000 virtual funds',
      'Unlimited resets',
      'No credit card required',
    ],
    cta: 'Open Demo Account',
    popular: false,
  },
];

/* ── Account opening steps ──────────────────────────────────────────────── */
const steps = [
  {
    n: '01',
    title: 'Register',
    text: 'Create your Bull4x account in under 2 minutes — name, email, and a strong password.',
  },
  {
    n: '02',
    title: 'Verify',
    text: 'Upload a government ID and a quick proof-of-address for KYC. Most approvals land within 24 hours.',
  },
  {
    n: '03',
    title: 'Deposit Funds',
    text: 'Fund from $100 via card, bank wire, Skrill, Neteller, or crypto in USD, EUR, GBP, or USDT.',
  },
  {
    n: '04',
    title: 'Start Trading',
    text: 'Access 60+ markets on MT4, MT5, or our web platform and withdraw your profits the same business day.',
  },
];

/* ── Security highlights ────────────────────────────────────────────────── */
const securityItems = [
  {
    icon: Wallet,
    title: 'Segregated Client Funds',
    text: 'Client deposits are held in segregated accounts at Tier-1 banks, fully separated from company operating capital.',
  },
  {
    icon: Lock,
    title: '256-Bit SSL Encryption',
    text: 'Every transaction and login is protected by bank-grade TLS 1.3 with HSTS, plus mandatory 2FA on all client dashboards.',
  },
  {
    icon: ShieldCheck,
    title: 'Negative Balance Protection',
    text: 'Your account balance can never go below zero. Independent compliance audits every quarter back the policy.',
  },
  {
    icon: Server,
    title: 'Regulated Liquidity Partners',
    text: 'Price feeds are aggregated from regulated Tier-1 liquidity providers, giving institutional-grade spreads and sub-30ms fills.',
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[#6B7080]">{label}</span>
      <span className="text-[#0D0F1A] font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function TierCard({ tier, onTalkToSales }) {
  const isElite = tier.name === 'Elite';
  const ctaClass = `mt-auto w-full block text-center py-2.5 rounded-full font-semibold text-sm transition-all ${
    tier.popular
      ? 'text-white hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(1,88,198,0.25)] hover:shadow-[0_8px_24px_rgba(77,190,81,0.4)]'
      : 'border border-[#E8EAF0] text-[#0D0F1A] hover:border-[#0158c6] hover:text-[#0158c6]'
  }`;
  const ctaStyle = tier.popular ? { background: BRAND_GRADIENT } : undefined;

  return (
    <div
      className={`relative rounded-2xl bg-white p-6 sm:p-7 flex flex-col transition-all ${
        tier.popular
          ? 'border-2 border-[#4dbe51] shadow-[0_8px_40px_rgba(77,190,81,0.18)]'
          : 'border border-[#E8EAF0] shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] hover:shadow-[0_8px_32px_rgba(1,88,198,0.08)]'
      }`}
    >
      {tier.popular && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[11px] font-bold px-4 py-1 rounded-full whitespace-nowrap shadow-[0_4px_12px_rgba(77,190,81,0.35)]"
          style={{ background: 'linear-gradient(135deg, #4dbe51 0%, #81ce65 100%)' }}
        >
          MOST POPULAR
        </span>
      )}

      <p className="text-[11px] font-semibold text-[#0158c6] uppercase tracking-widest mb-2">
        {tier.eyebrow}
      </p>
      <h3 className="text-2xl font-extrabold text-[#0D0F1A] font-manrope mb-5">
        {tier.name}
      </h3>

      <div className="border-t border-[#E8EAF0] pt-4 space-y-2.5 mb-5">
        {tier.rules.map((r) => (
          <Row key={r.label} label={r.label} value={r.value} />
        ))}
      </div>

      <ul className="space-y-2 text-sm mb-6">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[#0D0F1A]">
            <CheckCircle2 size={16} className="text-[#4dbe51] shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {isElite ? (
        <button
          type="button"
          onClick={onTalkToSales}
          className={ctaClass}
          style={ctaStyle}
        >
          {tier.cta}
        </button>
      ) : (
        <Link href="/auth/register" className={ctaClass} style={ctaStyle}>
          {tier.cta}
        </Link>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
export default function AccountsPage() {
  const [contactModal, setContactModal] = useState({ open: false, subject: '', title: 'Get in touch' });

  const openExpertModal = () =>
    setContactModal({
      open: true,
      title: 'Talk to an Bull4x Expert',
      subject: 'Talk to an Expert — Accounts',
    });

  const openSalesModal = () =>
    setContactModal({
      open: true,
      title: 'Talk to Sales — VIP Account',
      subject: 'VIP institutional account enquiry',
    });

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
            <Sparkles size={14} style={{ color: '#4dbe51' }} />
            Account Types
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
              Live Account
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed mb-9">
            From a risk-free demo to live Standard and Pro accounts —
            Bull4x has the right account for every trader. Pick your tier,
            fund instantly, and trade global markets.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth/register"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] transition-all"
              style={{ background: BRAND_GRADIENT }}
            >
              Open Account
              <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={openExpertModal}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 border-[#4dbe51] text-[#4dbe51] font-semibold text-sm hover:bg-[#4dbe51] hover:text-white transition-all"
            >
              Talk to an Expert
            </button>
          </div>
        </div>
      </section>

      {/* ── Account Types Grid ─────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest mb-3">
              — Accounts —
            </p>
            <h2
              className="text-[#0D0F1A] font-manrope"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Built for{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Every Trader
              </span>
            </h2>
            <p className="text-base text-[#6B7080] max-w-2xl mx-auto mt-4">
              Three account types, one shared promise — tight spreads,
              transparent commissions, no hidden mark-ups.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {tiers.map((t) => (
              <TierCard key={t.name} tier={t} onTalkToSales={openSalesModal} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Open an Account ─────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest mb-3">
              — Get Started —
            </p>
            <h2
              className="text-[#0D0F1A] font-manrope"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              How to{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Open an Account
              </span>
            </h2>
            <p className="text-base text-[#6B7080] max-w-2xl mx-auto mt-4">
              Four steps from signup to your first trade. Most clients complete steps 1 and 2
              in a single sitting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="relative text-center">
                <div
                  className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-white font-extrabold text-lg mb-4 shadow-[0_6px_20px_rgba(1,88,198,0.25)]"
                  style={{ background: BRAND_GRADIENT }}
                >
                  {s.n}
                </div>
                <h3 className="text-lg font-bold text-[#0D0F1A] mb-2 font-manrope">
                  {s.title}
                </h3>
                <p className="text-sm text-[#6B7080] leading-relaxed max-w-[220px] mx-auto">
                  {s.text}
                </p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+44px)] right-[calc(-50%+44px)] h-px bg-gradient-to-r from-[#0158c6]/30 via-[#4dbe51]/40 to-transparent" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] transition-all"
              style={{ background: BRAND_GRADIENT }}
            >
              Open Your Account Now
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Security ───────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#0C0C1D] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3 inline-flex items-center gap-2"
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                <ShieldCheck size={14} style={{ color: '#4dbe51' }} />
                Security
              </p>
              <h2
                className="font-manrope mb-5"
                style={{
                  fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.08,
                }}
              >
                Your Capital Is{' '}
                <span
                  style={{
                    background: BRAND_GRADIENT,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                  }}
                >
                  Safe With Us
                </span>
              </h2>
              <p className="text-base text-[#9AA0B4] leading-relaxed mb-6 max-w-lg">
                Bull4x takes the security of client funds, personal data, and
                trading integrity extremely seriously. Every layer of the platform
                is engineered for transparency and protection.
              </p>
              <Link href="/auth/register"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.4)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(77,190,81,0.45)] transition-all"
                style={{ background: BRAND_GRADIENT }}
              >
                Start Securely
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {securityItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] p-5 hover:border-[#4dbe51] hover:bg-[rgba(77,190,81,0.05)] transition-all"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: 'rgba(77,190,81,0.12)' }}
                    >
                      <Icon size={18} style={{ color: '#4dbe51' }} />
                    </div>
                    <h4 className="text-sm font-bold mb-1.5">{item.title}</h4>
                    <p className="text-xs text-[#9AA0B4] leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: 'rgba(77,190,81,0.1)', color: '#4dbe51' }}
          >
            <TrendingUp size={14} />
            Limited-time BULL15 — 15% deposit bonus on every funding
          </div>
          <h2
            className="text-[#0D0F1A] font-manrope mb-4"
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Ready to Open Your{' '}
            <span
              style={{
                background: BRAND_GRADIENT,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              Live Account?
            </span>
          </h2>
          <p className="text-base text-[#6B7080] max-w-xl mx-auto mb-8">
            Join thousands of traders worldwide. Open a live account or
            try a free demo — no obligation, no risk.
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
              <Award size={16} />
              Open Demo Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <ContactFormModal
        isOpen={contactModal.open}
        onClose={() => setContactModal((s) => ({ ...s, open: false }))}
        title={contactModal.title}
        subject={contactModal.subject}
      />
    </div>
  );
}
