'use client'

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const tiers = [
  { milestone: 'Bronze — 0 to 50 lots / month',     rebate: '$1 / lot' },
  { milestone: 'Silver — 51 to 200 lots / month',   rebate: '$2 / lot' },
  { milestone: 'Gold — 201 to 500 lots / month',    rebate: '$3 / lot' },
  { milestone: 'Platinum — 500+ lots / month',      rebate: '$5 / lot' },
];

export default function ProfitSplit() {
  const { ref: leftRef }  = useScrollAnimation(0.1);
  const { ref: rightRef } = useScrollAnimation(0.1);

  return (
    <section className="bg-[#FAFBFD] py-14 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left: Heading + Body */}
          <div ref={leftRef} className="scroll-reveal-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(1,88,198,0.08)] border border-[rgba(1,88,198,0.15)] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0158c6]" />
              <span className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest">Volume Cashback Programme</span>
            </div>
            <h2
              className="font-manrope text-[#0D0F1A] mb-6"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Earn up to <span className="text-[#0158c6]">$5 Cashback per Lot</span>
            </h2>
            <p className="text-base sm:text-lg text-[#6B7080] leading-relaxed mb-8">
              Every Bull4x live account earns automatic cashback on every closed lot —
              forex, metals, indices, or crypto CFDs. The more volume you trade each month,
              the higher your rebate tier. Cashback settles to your wallet daily and is
              withdrawable in USD, EUR, GBP, or USDT — no minimum balance, no lock-up.
            </p>
            <Link href="/our-trading"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#4dbe51] hover:gap-3 transition-all"
            >
              View Full Rebate Schedule <ArrowRight size={16} />
            </Link>
          </div>

          {/* Right: Scaling tier card */}
          <div ref={rightRef} className="scroll-reveal-right bg-white border border-[#E8EAF0] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E8EAF0] bg-[#0C0C1D]">
              <p className="text-xs font-bold text-[#0158c6] uppercase tracking-widest mb-1">Monthly Volume Tiers</p>
              <p className="text-base font-bold text-white">Your rebate scales with monthly volume</p>
            </div>
            <div>
              {tiers.map((t, i) => (
                <div
                  key={t.milestone}
                  className={`flex items-center justify-between px-6 py-5 ${i < tiers.length - 1 ? 'border-b border-[#E8EAF0]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#0158c6] w-6 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <p className="text-sm sm:text-base text-[#0D0F1A] font-semibold">{t.milestone}</p>
                  </div>
                  <p className="text-sm sm:text-base font-extrabold text-[#0158c6] tabular-nums">{t.rebate}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
