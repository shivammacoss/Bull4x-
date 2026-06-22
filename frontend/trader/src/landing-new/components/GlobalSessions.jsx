'use client'

import { Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation';

// §B — Global Trading Sessions Strip
// Insertion: after WhyChooseUs (§12).
// Wrapper pattern cloned from WhyChooseUs section background + MarketAccess card grid
// so it sits visually between the dark "Why Choose" and the light Pricing section.

const sessions = [
  { icon: Moon,    name: 'Sydney',    time: '22:00 – 07:00 GMT', note: 'AUD pairs active' },
  { icon: Sunrise, name: 'Tokyo',     time: '00:00 – 09:00 GMT', note: 'JPY pairs active' },
  { icon: Sun,     name: 'London',    time: '08:00 – 17:00 GMT', note: 'Highest liquidity window' },
  { icon: Sunset,  name: 'New York',  time: '13:00 – 22:00 GMT', note: 'USD pairs dominant' },
];

export default function GlobalSessions() {
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
            Trade Every Session, From{' '}
            <span className="text-[#0158c6]">Sydney to New York</span>
          </h2>
        </div>

        {/* 4-card session strip */}
        <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {sessions.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.name}
                className="stagger-child bg-white border border-[#E8EAF0] rounded-2xl p-5 sm:p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] hover:shadow-[0_8px_30px_rgba(1,88,198,0.08)] transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(1,88,198,0.08)] flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-[#0158c6]" />
                  </div>
                  <h3 className="text-base font-bold text-[#0D0F1A] font-manrope">{s.name}</h3>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#0D0F1A] tabular-nums mb-1">{s.time}</p>
                <p className="text-xs text-[#6B7080]">{s.note}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
