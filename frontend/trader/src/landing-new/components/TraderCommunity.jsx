'use client'

import { ArrowRight, MessageSquare, Trophy, Send } from 'lucide-react';
import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation';

// §F — Trader Community
// Insertion: just before FAQ (§17).
// Wrapper pattern cloned from MarketAccess.jsx 3-card variant.

const channels = [
  {
    icon: MessageSquare,
    title: 'Discord Server',
    desc: '24/7 trade chat, live signal rooms, weekly Q&As with senior traders.',
    cta: 'Join Discord',
  },
  {
    icon: Trophy,
    title: 'Public Leaderboard',
    desc: 'Top 100 active traders ranked by 30-day return. Compete for monthly prizes.',
    cta: 'View Leaderboard',
  },
  {
    icon: Send,
    title: 'Telegram Channel',
    desc: 'Free daily setups and economic-calendar alerts.',
    cta: 'Open Telegram',
  },
];

export default function TraderCommunity() {
  const { ref: headerRef } = useScrollAnimation();
  const cardsRef = useStaggerAnimation(0.08, 90);

  return (
    <section className="bg-white py-14 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div ref={headerRef} className="scroll-reveal mb-10 md:mb-14 text-center max-w-3xl mx-auto">
          <h2
            className="font-extrabold text-[#0D0F1A] tracking-[-0.02em] font-manrope mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Trade With a <span className="text-[#0158c6]">Community</span>
          </h2>
          <p className="text-base sm:text-lg text-[#6B7080]">
            Join thousands of Bull4x clients sharing setups, calls, and withdrawal proofs in real time.
          </p>
        </div>

        {/* 3-card grid */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="stagger-child group bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] hover:shadow-[0_8px_30px_rgba(1,88,198,0.08)] transition-all duration-300 flex flex-col"
              >
                <div className="w-10 h-10 rounded-lg bg-[rgba(1,88,198,0.08)] flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#0158c6]" />
                </div>
                <h3 className="text-lg font-bold text-[#0D0F1A] font-manrope mb-2">{c.title}</h3>
                <p className="text-sm text-[#6B7080] leading-relaxed flex-1 mb-4">{c.desc}</p>
                <span className="text-sm font-semibold text-[#0158c6] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  {c.cta} <ArrowRight size={14} />
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <a
            href="https://discord.gg/bull4x"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:bg-[#0199c6] transition-all"
          >
            Join the Community <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
