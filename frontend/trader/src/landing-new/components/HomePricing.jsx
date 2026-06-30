'use client'

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PricingTierCard from './PricingTierCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// admin stepsCount → tab label
const STEP_TO_TAB = { 0: 'Standard', 1: 'Pro', 2: 'ECN' };

const DESC_BY_TAB = {
  'Standard': 'Spreads from 1.5 pips with zero commission. A clean, simple setup for traders just getting started — and for swing traders who want straightforward pricing on 60+ markets.',
  'Pro': 'Ultra-tight spreads with reduced commission, priority execution, advanced analytics, and dedicated support. For experienced traders after sharper conditions.',
  'ECN': 'Raw spreads from 0.0 pips with a fixed low commission, wired straight to liquidity providers. Made for scalpers, algos, and anyone who wants institutional-style pricing.'
};

// Static fallback tiers — shown when the live API has no published challenges
// yet, so the home pricing section never appears empty on a fresh deployment.
const STATIC_TIERS = {
  'Standard': [
    { capital: '$100',  price: '$0', popular: false, label: 'Starter' },
    { capital: '$1,000', price: '$0', popular: true,  label: 'Most Popular' },
    { capital: '$5,000', price: '$0', popular: false, label: 'Scale Up' },
  ],
  'Pro': [
    { capital: '$500',   price: '$0', popular: false, label: 'Active Trader' },
    { capital: '$2,500', price: '$0', popular: true,  label: 'Most Popular' },
    { capital: '$10,000', price: '$0', popular: false, label: 'Professional' },
  ],
  'ECN': [
    { capital: '$2,000',  price: '$0', popular: false, label: 'Raw Spreads' },
    { capital: '$5,000',  price: '$0', popular: true,  label: 'Most Popular' },
    { capital: '$25,000', price: '$0', popular: false, label: 'Institutional' },
  ],
};

function formatUSD(n) {
  const v = Number(n) || 0;
  return `$${v.toLocaleString('en-US')}`;
}

export default function HomePricing() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Instant');

  useEffect(() => {
    fetch(`${API_URL}/api/prop/challenges`)
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.challenges)) setChallenges(data.challenges);
      })
      .catch(() => { /* network failure → render empty state */ })
      .finally(() => setLoading(false));
  }, []);

  // Build live plans dictionary keyed by tab name. Each tier card pulls
  // pricing from the admin's published challenge tiers.
  const plans = useMemo(() => {
    const out = {};
    for (const c of challenges) {
      const tabName = STEP_TO_TAB[c.stepsCount];
      if (!tabName) continue;
      const rawTiers = (c.tiers && c.tiers.length > 0)
        ? c.tiers
        : [{ fundSize: c.fundSize, challengeFee: c.challengeFee, isPopular: true, label: '' }];
      const tiers = rawTiers.map(t => ({
        capital: formatUSD(t.fundSize),
        price: formatUSD(t.challengeFee),
        popular: !!t.isPopular,
        label: t.label || ''
      }));
      out[tabName] = {
        description: c.description || DESC_BY_TAB[tabName],
        tiers
      };
    }
    return out;
  }, [challenges]);

  const tabOrder = ['Standard', 'Pro', 'ECN'];
  const activePlan = plans[tab];

  return (
    <section className="bg-white py-14 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-10 md:mb-14 max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Pricing</p>
          <h2
            className="font-extrabold text-[#0D0F1A] tracking-[-0.02em] font-manrope mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Pick Your <span className="text-[#0158c6]">Account</span>
          </h2>
          <p className="text-base sm:text-lg text-[#6B7080]">
            Find the account that fits how you trade and where you are in your journey.
          </p>
        </div>

        {/* Tabs */}
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

        {/* Tier Cards — live API data preferred, static fallback so the section
            always renders even when no challenges have been published yet. */}
        {(() => {
          const liveTiers = (!loading && activePlan && activePlan.tiers.length > 0) ? activePlan.tiers : null;
          const renderedTiers = liveTiers || STATIC_TIERS[tab] || [];
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {renderedTiers.map((tier, i) => (
                <PricingTierCard key={tier.capital + '-' + tier.price + '-' + i} tier={tier} plan={tab} />
              ))}
            </div>
          );
        })()}

        {/* §G — Transparent Pricing callout band */}
        <div className="rounded-2xl bg-[#0C0C1D] border border-[rgba(1,88,198,0.25)] px-6 py-5 sm:px-8 sm:py-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-sm sm:text-base text-white">
            <span className="font-bold">No monthly fees. No hidden charges.</span>{' '}
            <span className="text-[#9AA0B4]">Same-day withdrawals and full pricing transparency on every account.</span>
          </p>
          <Link href="/our-accounts"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4dbe51] hover:gap-2.5 transition-all whitespace-nowrap shrink-0"
          >
            See Account Details <ArrowRight size={14} />
          </Link>
        </div>

        {/* See all accounts CTA */}
        <div className="text-center">
          <Link href="/our-accounts"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0158c6] hover:gap-3 transition-all"
          >
            See all account tiers <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
