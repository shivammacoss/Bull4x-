'use client'

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Tag } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
import PricingTierCard from '../components/PricingTierCard';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Map admin stepsCount → tab name shown on the pricing page.
const STEP_TO_TAB = { 0: 'Standard', 1: 'Pro', 2: 'ECN' };
const TAB_TO_STEP = { 'Standard': 0, 'Pro': 1, 'ECN': 2 };

// Static plan-level features per type — these describe the *experience* (KYC,
// withdrawals, support) rather than per-tier numbers, so they don't live in the
// admin Challenge schema. Edit here if marketing copy changes.
const FEATURES_BY_TAB = {
  'Standard': [
    'Zero commission, spreads from 1.2 pips.',
    '60+ forex pairs, metals, indices, and crypto CFDs.',
    'Leverage up to 1:500 on major pairs.',
    'Same-day withdrawals in USD, EUR, GBP, or USDT.',
    'Discord, live chat, and email support — real humans.'
  ],
  'Pro': [
    'Tighter spreads from 0.6 pips with zero commission.',
    'Full instrument access — forex, metals, indices, crypto CFDs.',
    'Priority order execution and dedicated account manager.',
    'Cashback rebates on every closed lot.',
    'Same-day withdrawals across every supported rail.'
  ],
  'ECN': [
    'Raw spreads from 0.0 pips on EUR/USD.',
    '$3.5 per lot per side commission ($7 round trip).',
    'Direct tier-1 liquidity routing — STP/ECN execution.',
    'Built for scalpers, EAs, and high-frequency strategies.',
    'Multi-currency wallet, including USDT base currency.'
  ]
};

const DESC_BY_TAB = {
  'Standard': 'Zero commission. Spreads from 1.2 pips. The easiest way to start trading 60+ markets on a live account.',
  'Pro': 'Tighter spreads from 0.6 pips with a dedicated account manager. Built for active traders who want better pricing.',
  'ECN': 'Raw spreads from 0.0 pips with $3.5 per lot per side. Direct tier-1 liquidity for scalpers and algorithms.'
};

// Static tier fallback so the Pricing page always renders even when admin
// has not yet published any challenges. Live API data takes precedence.
const STATIC_TIERS_BY_TAB = {
  'Standard': [
    { capital: '$100',   price: '$0', discountedPrice: '$0', popular: false, label: 'Starter',       rules: [
      { key: 'Spread From', value: '1.2 pips' }, { key: 'Commission', value: 'Zero' },
      { key: 'Leverage', value: 'Up to 1:500' }, { key: 'Min Deposit', value: '$100' }] },
    { capital: '$1,000', price: '$0', discountedPrice: '$0', popular: true,  label: 'Most Popular',  rules: [
      { key: 'Spread From', value: '1.2 pips' }, { key: 'Commission', value: 'Zero' },
      { key: 'Leverage', value: 'Up to 1:500' }, { key: 'Min Deposit', value: '$1,000' }] },
    { capital: '$5,000', price: '$0', discountedPrice: '$0', popular: false, label: 'Scale Up',      rules: [
      { key: 'Spread From', value: '1.2 pips' }, { key: 'Commission', value: 'Zero' },
      { key: 'Leverage', value: 'Up to 1:500' }, { key: 'Min Deposit', value: '$5,000' }] },
  ],
  'Pro': [
    { capital: '$500',    price: '$0', discountedPrice: '$0', popular: false, label: 'Active Trader', rules: [
      { key: 'Spread From', value: '0.6 pips' }, { key: 'Commission', value: 'Zero' },
      { key: 'Leverage', value: 'Up to 1:500' }, { key: 'Min Deposit', value: '$500' }] },
    { capital: '$2,500',  price: '$0', discountedPrice: '$0', popular: true,  label: 'Most Popular',  rules: [
      { key: 'Spread From', value: '0.6 pips' }, { key: 'Commission', value: 'Zero' },
      { key: 'Leverage', value: 'Up to 1:500' }, { key: 'Min Deposit', value: '$2,500' }] },
    { capital: '$10,000', price: '$0', discountedPrice: '$0', popular: false, label: 'Professional',  rules: [
      { key: 'Spread From', value: '0.6 pips' }, { key: 'Commission', value: 'Zero' },
      { key: 'Leverage', value: 'Up to 1:500' }, { key: 'Min Deposit', value: '$10,000' }] },
  ],
  'ECN': [
    { capital: '$2,000',  price: '$0', discountedPrice: '$0', popular: false, label: 'Raw Spreads',   rules: [
      { key: 'Spread From', value: '0.0 pips' }, { key: 'Commission', value: '$3.5/lot/side' },
      { key: 'Leverage', value: 'Up to 1:500' }, { key: 'Min Deposit', value: '$2,000' }] },
    { capital: '$5,000',  price: '$0', discountedPrice: '$0', popular: true,  label: 'Most Popular',  rules: [
      { key: 'Spread From', value: '0.0 pips' }, { key: 'Commission', value: '$3.5/lot/side' },
      { key: 'Leverage', value: 'Up to 1:500' }, { key: 'Min Deposit', value: '$5,000' }] },
    { capital: '$25,000', price: '$0', discountedPrice: '$0', popular: false, label: 'Institutional', rules: [
      { key: 'Spread From', value: '0.0 pips' }, { key: 'Commission', value: '$3.5/lot/side' },
      { key: 'Leverage', value: 'Up to 1:500' }, { key: 'Min Deposit', value: '$25,000' }] },
  ],
};

const formatUSD = (n) => {
  if (n == null || isNaN(n)) return '';
  return '$' + Number(n).toLocaleString('en-US');
};

export default function PricingPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Standard');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/prop/challenges`)
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.challenges)) {
          setChallenges(data.challenges);
        }
      })
      .catch(() => { /* ignored — tabs render with empty tiers as a fallback */ })
      .finally(() => setLoading(false));
  }, []);

  // Pull WELCOME10 = 10% off from the top banner for the discounted price line
  // shown on each card. Coupon code text is intentionally hard-coded here so the
  // marketing card matches the banner copy without needing another admin field.
  const PROMO_CODE = 'BULL15';
  const PROMO_DISCOUNT = 0.15;

  // Build { tabName: { description, tiers: [{ fundSize, challengeFee, popular, label, rules }], features } }
  // from live admin challenges. Each tier card needs both pricing (for the top
  // block) and the rule snapshot (for the quick rules list under the price), so
  // we attach the parent challenge's rules onto every tier — same plan, same rules.
  const plans = useMemo(() => {
    const out = {};
    for (const c of challenges) {
      const tabName = STEP_TO_TAB[c.stepsCount];
      if (!tabName) continue;
      const r = c.rules || {};
      const target = c.stepsCount === 0
        ? r.profitTargetInstantPercent
        : r.profitTargetPhase1Percent;
      const cardRules = [
        target != null && { key: 'Spread From', value: `${target} pips` },
        r.maxDailyDrawdownPercent != null && { key: 'Commission', value: `$${r.maxDailyDrawdownPercent}/lot` },
        r.maxOverallDrawdownPercent != null && { key: 'Leverage', value: `Up to 1:${r.maxOverallDrawdownPercent}` },
        r.tradingDaysRequired != null && { key: 'Min Deposit', value: `$${r.tradingDaysRequired}` }
      ].filter(Boolean);

      const rawTiers = (c.tiers && c.tiers.length > 0)
        ? c.tiers
        : [{ fundSize: c.fundSize, challengeFee: c.challengeFee, isPopular: true, label: '' }];

      const tiers = rawTiers.map(t => ({
        fundSize: t.fundSize,
        challengeFee: t.challengeFee,
        capital: formatUSD(t.fundSize),
        price: formatUSD(t.challengeFee),
        discountedPrice: formatUSD(Math.round(t.challengeFee * (1 - PROMO_DISCOUNT))),
        popular: !!t.isPopular,
        label: t.label || '',
        rules: cardRules
      }));

      out[tabName] = {
        description: c.description || DESC_BY_TAB[tabName],
        tiers,
        features: FEATURES_BY_TAB[tabName]
      };
    }
    return out;
  }, [challenges]);

  const applyCoupon = () => {
    if (coupon.trim()) {
      setCouponApplied(true);
      setTimeout(() => setCouponApplied(false), 3000);
    }
  };

  // Always show all three tabs so users can see every plan type, even if the
  // admin hasn't published a challenge for one yet (we render an empty-state
  // message in that case instead of hiding the tab).
  const tabOrder = ['Standard', 'Pro', 'ECN'];
  const activePlan = plans[tab];

  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-44 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Pricing</p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }} className="text-[#0D0F1A] mb-6">
            Transparent pricing. <span className="text-[#0158c6]">No hidden fees.</span>
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed">
            Three account tiers, one shared promise — tight spreads, fast execution, and zero internal withdrawal fees.
            Open a live account from $100 and trade 60+ global markets.
          </p>
        </div>
      </section>

      {/* Tab switcher + Pricing */}
      <section className="px-6 pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto">
          {loading && (
            <div className="text-center text-[#6B7080] py-10">Loading pricing…</div>
          )}

          {!loading && (
            <>
              {/* Tabs — always render all three */}
              <div className="flex justify-center mb-8 md:mb-10">
                <div className="inline-flex bg-[#F0F2F8] border border-[#E8EAF0] rounded-full p-1 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  {tabOrder.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-6 sm:px-7 py-2.5 rounded-full text-sm font-bold transition-all ${
                        tab === t
                          ? 'bg-[#0158c6] text-white shadow-[0_4px_12px_rgba(1,88,198,0.35)]'
                          : 'text-[#0D0F1A] hover:text-[#0158c6]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className="text-center text-base text-[#6B7080] max-w-2xl mx-auto mb-10 md:mb-12">
                {activePlan?.description || DESC_BY_TAB[tab]}
              </p>

              {(() => {
                // Prefer admin-published tiers; otherwise fall back to static
                // marketing tiers so the page is never empty.
                const tiers = (activePlan && activePlan.tiers.length > 0)
                  ? activePlan.tiers
                  : STATIC_TIERS_BY_TAB[tab] || [];
                const features = (activePlan && activePlan.features) || FEATURES_BY_TAB[tab];
                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                      {tiers.map((tier) => (
                        <PricingTierCard key={tier.capital + '-' + tier.price} tier={tier} plan={tab} />
                      ))}
                    </div>

                    <div className="bg-[#FAFBFD] border border-[#E8EAF0] rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
                      <h3 className="text-lg font-bold text-[#0D0F1A] mb-2">
                        What you get with {tab}
                      </h3>
                      <p className="text-sm text-[#6B7080] mb-5">Same across every funding size in this tier.</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {features.map((f) => (
                          <li key={f} className="flex items-start gap-3">
                            <Check size={16} className="text-[#0158c6] shrink-0 mt-0.5" />
                            <span className="text-sm text-[#6B7080]">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </div>
      </section>

      {/* Coupon / Referral Section */}
      <section className="py-14 md:py-20 px-6 bg-[#0C0C1D]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(1,88,198,0.15)] border border-[rgba(1,88,198,0.3)] mb-5">
            <Tag size={14} className="text-[#0158c6]" />
            <span className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest">Coupon code</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-white mb-4">
            Got a code from someone? <span className="text-[#0158c6]">Use it here.</span>
          </h2>
          <p className="text-base text-[#9AA0B4] mb-8 max-w-2xl mx-auto">
            If a creator, mentor, or trader friend shared their code, drop it in.
            You get a deposit bonus, they get credited for the referral. Fair on both sides.
          </p>

          <div className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="ENTER CODE (e.g. BULL15)"
                className="flex-1 px-5 py-3.5 rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-white text-sm placeholder-[#9AA0B4] focus:outline-none focus:border-[#0158c6] transition-all uppercase tracking-wider"
              />
              <button
                onClick={applyCoupon}
                className="px-6 py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm hover:bg-[#0199c6] transition-all shrink-0"
              >
                Apply
              </button>
            </div>
            {couponApplied && (
              <p className="text-sm text-emerald-400 mt-3">
                Got it. "{coupon}" will show up at checkout.
              </p>
            )}
            <p className="text-xs text-[#9AA0B4] mt-4">
              Codes are checked at checkout. We pay our partners every month, on time.
            </p>
          </div>
        </div>
      </section>

      {/* Become an Affiliate / Influencer */}
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#0D0F1A] mb-6">
            Run a trading channel or mentor traders?
          </h2>
          <p className="text-base sm:text-lg text-[#6B7080] mb-8 max-w-2xl mx-auto">
            We work with creators and educators worldwide. You get your own code, a dashboard
            to see who signed up, and a payout every month. No paperwork drama.
          </p>
          <Link href="/contact-us" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:bg-[#0199c6] transition-all">
            Talk to us <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-[#6B7080] mt-4">Usually replies within a day.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
