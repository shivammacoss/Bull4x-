'use client'

import {
  ShieldAlert, TrendingDown, CalendarCheck, Target, Newspaper, Cpu
} from 'lucide-react';
import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation';

// §D — Trading Conditions & Account Protections
// Insertion: after TradingPlatform (§15).
// Wrapper pattern cloned from WhyChooseUs.jsx — dark bg, horizontal rule rows
// with icon + title + description.

const rules = [
  { icon: Target,         title: 'No Dealing Desk (NDD)',     desc: 'Your orders go straight to liquidity providers with no manual interference — clean, transparent fills every time.' },
  { icon: TrendingDown,   title: 'Spreads & Commissions',     desc: 'Pick spread-only pricing or a raw-spread account with a small commission. Either way, what you pay stays competitive across the board.' },
  { icon: CalendarCheck,  title: 'Flexible Leverage',         desc: 'Leverage varies by account type and jurisdiction. We always encourage sizing your positions sensibly and keeping risk in check.' },
  { icon: ShieldAlert,    title: 'Built-in Risk Management',  desc: 'Stop Loss, Take Profit, Trailing Stop, Negative Balance Protection, and Margin Call alerts come standard on every account.' },
  { icon: Newspaper,      title: 'No Requotes',               desc: 'Orders fill at the price you see, even during major news releases and fast-moving markets.' },
  { icon: Cpu,            title: 'Segregated Client Funds',   desc: 'Deposits are held in segregated accounts at tier-1 banks, kept completely separate from company money.' },
];

export default function RiskRules() {
  const { ref: headerRef } = useScrollAnimation();
  const cardsRef = useStaggerAnimation(0.08, 70);

  return (
    <section className="bg-[#0C0C1D] py-14 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div ref={headerRef} className="scroll-reveal mb-10 md:mb-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(1,88,198,0.15)] border border-[rgba(1,88,198,0.3)] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0158c6]" />
            <span className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest">No Dealing Desk</span>
          </div>
          <h2
            className="text-white font-manrope mb-5"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Trading Conditions That{' '}
            <span className="text-[#0158c6]">Stay Fair</span>
          </h2>
          <p className="text-base sm:text-lg text-[#9AA0B4]" style={{ lineHeight: 1.7 }}>
            We run a No Dealing Desk (NDD) model — so there's no conflict between us and the trades you place.
          </p>
        </div>

        {/* Rule rows */}
        <div ref={cardsRef}>
          {rules.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.title}
                className="stagger-child border-t border-[rgba(255,255,255,0.08)] py-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
              >
                <div className="w-10 h-10 rounded-lg bg-[rgba(1,88,198,0.1)] flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-[#0158c6]" />
                </div>
                <h3 className="text-white text-lg sm:text-xl font-bold font-manrope sm:w-64 shrink-0">
                  {r.title}
                </h3>
                <p className="text-[#9AA0B4] text-sm leading-relaxed">
                  {r.desc}
                </p>
              </div>
            );
          })}
          <div className="border-t border-[rgba(255,255,255,0.08)]" />
        </div>

      </div>
    </section>
  );
}
