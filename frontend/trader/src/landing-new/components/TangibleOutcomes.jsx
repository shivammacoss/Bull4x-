'use client'

import { useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

/* ── Outcomes data — forex brokerage specific ───────────────────────────── */
const outcomes = [
  {
    id: '01',
    title: 'TIGHT SPREADS FROM 0.0 PIPS',
    description:
      'Trade 60+ forex pairs, metals, indices, and crypto CFDs with raw ECN spreads from 0.0 pips and Standard spreads from 1.2 pips. Tier-1 liquidity providers feed our order book directly.',
    bg: 'linear-gradient(135deg, rgba(1,88,198,0.92) 0%, rgba(1,153,198,0.92) 100%)',
    accent: '#ffffff',
    href: '/accounts',
  },
  {
    id: '02',
    title: 'ULTRA-FAST EXECUTION UNDER 30MS',
    description:
      'Sub-30ms order execution, STP/ECN routing, and no requotes — even during high-impact news. Slippage stays minimal so your strategy performs as designed.',
    bg: 'linear-gradient(135deg, rgba(1,153,198,0.85) 0%, rgba(77,190,81,0.85) 100%)',
    accent: '#ffffff',
    href: '/pricing',
  },
  {
    id: '03',
    title: 'REGULATED & SECURE',
    description:
      'Authorised under FCA and CySEC, with segregated client funds, negative balance protection, and investor compensation cover. Your capital is held with tier-1 banks.',
    bg: 'linear-gradient(135deg, rgba(77,190,81,0.88) 0%, rgba(129,206,101,0.88) 100%)',
    accent: '#ffffff',
    href: '/challenges',
  },
  {
    id: '04',
    title: 'MULTI-CURRENCY WALLET',
    description:
      'Fund and withdraw in USD, EUR, GBP, or USDT via card, bank wire, Skrill, Neteller, or crypto. Most withdrawals are processed the same business day with zero internal fees.',
    bg: 'linear-gradient(135deg, rgba(129,206,101,0.85) 0%, rgba(77,190,81,0.6) 100%)',
    accent: '#ffffff',
    href: '/pricing',
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
export default function TangibleOutcomes() {
  const [activeId, setActiveId] = useState('01');

  return (
    <section className="py-20 md:py-28 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Heading row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-16">
          <h2
            className="text-[#0D0F1A] font-manrope"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}
          >
            See tangible
            <br />
            <span
              style={{
                background:
                  'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              outcomes
            </span>
          </h2>
          <p className="text-xs font-semibold text-[#6B7080] uppercase tracking-widest">
            — What you get
          </p>
        </div>

        {/* Stacked colored bars */}
        <div className="space-y-3">
          {outcomes.map((o) => {
            const isActive = activeId === o.id;
            return (
              <div
                key={o.id}
                onClick={() => setActiveId(o.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveId(o.id);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer ${
                  isActive ? 'shadow-[0_12px_40px_rgba(1,88,198,0.18)]' : 'hover:translate-x-1'
                }`}
                style={{ background: o.bg }}
              >
                {/* Collapsed row */}
                {!isActive && (
                  <div className="flex items-center justify-between px-6 sm:px-8 py-4">
                    <div className="flex items-center gap-4">
                      <span
                        className="text-xs sm:text-sm font-bold tabular-nums tracking-widest opacity-90"
                        style={{ color: o.accent }}
                      >
                        {o.id}
                      </span>
                      <span
                        className="text-sm sm:text-base font-extrabold tracking-wide"
                        style={{ color: o.accent }}
                      >
                        {o.title}
                      </span>
                    </div>
                    <ChevronRight
                      size={20}
                      style={{ color: o.accent }}
                      className="opacity-70 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                )}

                {/* Expanded row */}
                {isActive && (
                  <div className="px-6 sm:px-10 py-7 sm:py-9">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="text-xs sm:text-sm font-bold tabular-nums tracking-widest"
                        style={{ color: o.accent }}
                      >
                        {o.id}
                      </span>
                      <ArrowRight size={16} style={{ color: o.accent }} />
                      <h3
                        className="text-base sm:text-xl font-extrabold tracking-wide"
                        style={{ color: o.accent }}
                      >
                        {o.title}
                      </h3>
                    </div>
                    <p
                      className="text-sm sm:text-base max-w-2xl leading-relaxed mb-5"
                      style={{ color: o.accent, opacity: 0.95 }}
                    >
                      {o.description}
                    </p>
                    <Link href={o.href}
                      className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all"
                      style={{ color: o.accent }}
                    >
                      Learn more
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                )}

                {/* Subtle decorative shape — bottom right corner */}
                <div
                  aria-hidden="true"
                  className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-20 pointer-events-none"
                  style={{ background: 'rgba(255,255,255,0.3)', filter: 'blur(20px)' }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
