'use client'

import { Activity, Server, Layers, Headphones } from 'lucide-react';
import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation';

// §A — Trading Conditions Strip
// Insertion: after MarketAccess (§10) and before WhyChooseUs (§12).
// Wrapper pattern cloned from MarketAccess.jsx 2x2 card grid so styling stays consistent.

const stats = [
  { icon: Server,     value: '99.9%',    label: 'Server Uptime' },
  { icon: Layers,     value: '60+',      label: 'Trading Instruments' },
  { icon: Headphones, value: '24/5',     label: 'Customer Support' },
  { icon: Activity,   value: '0.0 pips', label: 'Spreads Starting From' },
];

export default function TradingConditions() {
  const { ref: headerRef } = useScrollAnimation();
  const cardsRef = useStaggerAnimation(0.08, 80);

  return (
    <section className="bg-white py-14 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div ref={headerRef} className="scroll-reveal text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <h2
            className="text-[#0D0F1A] font-manrope mb-4"
            style={{
              fontSize: 'clamp(1.875rem, 4vw, 3rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Built for <span className="text-[#0158c6]">Serious Traders</span>
          </h2>
          <p className="text-base sm:text-lg text-[#6B7080]" style={{ lineHeight: 1.7 }}>
            Reliable infrastructure and conditions you can count on — every trade, executed with precision and confidence.
          </p>
        </div>

        {/* 4-stat strip */}
        <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="stagger-child bg-white border border-[#E8EAF0] rounded-2xl p-5 sm:p-6 text-center shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] hover:shadow-[0_8px_30px_rgba(1,88,198,0.08)] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-[rgba(1,88,198,0.08)] flex items-center justify-center mx-auto mb-3">
                  <Icon size={18} className="text-[#0158c6]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0D0F1A] font-manrope mb-1" style={{ letterSpacing: '-0.02em' }}>
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm text-[#6B7080]">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
