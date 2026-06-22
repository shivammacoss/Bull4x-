'use client'

import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  Globe2,
  ShieldCheck,
  Bitcoin,
} from 'lucide-react';

/* ── Zigzag/arrow decorative shape (matches reference image style) ───────── */
function ZigzagShape({ color = '#0158c6', opacity = 0.18 }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute pointer-events-none"
      style={{ width: '100%', height: '100%', top: 0, left: 0, opacity }}
      preserveAspectRatio="xMidYMid slice"
    >
      <polygon points="0,20 60,20 100,60 140,20 200,20 200,60 140,60 100,100 60,60 0,60" fill={color} />
      <polygon points="0,140 60,140 100,180 140,140 200,140 200,180 140,180 100,220 60,180 0,180" fill={color} />
    </svg>
  );
}

/* ── Case study cards — Bull4x achievements (click → relevant page) ──── */
const cases = [
  {
    eyebrow: 'WITHDRAWAL RAILS',
    title: 'Multi-currency withdrawals processed across 36+ countries',
    tag: 'PAYMENT RAILS',
    stat: '$5M+',
    statLabel: 'paid to clients',
    accentColor: '#0158c6',
    accentBg: 'rgba(1, 88, 198, 0.10)',
    cardBg: '#f5f9ff',
    icon: Globe2,
    href: '/pricing',
  },
  {
    eyebrow: 'MARKET ACCESS',
    title: 'Global instrument access drove 4x more client signups',
    tag: 'CLIENTS GLOBAL',
    stat: '60+',
    statLabel: 'instruments live',
    accentColor: '#4dbe51',
    accentBg: 'rgba(77, 190, 81, 0.12)',
    cardBg: '#f5fbf2',
    icon: TrendingUp,
    href: '/trading',
  },
  {
    eyebrow: 'CLIENT GROWTH',
    title: 'Upgraded ECN routing cut average withdrawal time by 75%',
    tag: 'BULL4X CLIENTS',
    stat: '4,000+',
    statLabel: 'active traders',
    accentColor: '#0199c6',
    accentBg: 'rgba(1, 153, 198, 0.10)',
    cardBg: '#f5fbff',
    icon: Bitcoin,
    href: '/challenges',
  },
  {
    eyebrow: 'REGULATED TRUST',
    title: 'FCA-aligned controls reduced client complaints by 95%',
    tag: 'BULL4X COMPLIANCE',
    stat: '95%',
    statLabel: 'fewer complaints',
    accentColor: '#81ce65',
    accentBg: 'rgba(129, 206, 101, 0.16)',
    cardBg: '#f7fbf0',
    icon: ShieldCheck,
    href: '/accounts',
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
export default function EffectiveTrading() {
  return (
    <section className="py-20 md:py-28 px-6 bg-white border-t border-[#E8EAF0]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <h2
            className="text-[#0D0F1A] font-manrope"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}
          >
            Effective{' '}
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
              forex trading
            </span>
            <br />
            for serious traders
          </h2>
          <div className="flex flex-col items-start md:items-end gap-3">
            <p className="text-sm text-[#6B7080] max-w-xs md:text-right">
              4,000+ active clients trading across global markets. <br />
              See real outcomes from the Bull4x platform.
            </p>
            <Link href="/results"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D0F1A] text-white text-sm font-semibold hover:-translate-y-0.5 transition-all"
            >
              Go to cases
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 2×2 case study grid — every card is a clickable link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7">
          {cases.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.tag} href={c.href}
                className="group relative overflow-hidden rounded-2xl p-6 sm:p-8 lg:p-10 min-h-[300px] flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(1,88,198,0.12)] transition-all duration-300 cursor-pointer"
                style={{ background: c.cardBg }}
              >
                <ZigzagShape color={c.accentColor} opacity={0.10} />

                {/* Top: eyebrow + title */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg"
                        style={{ background: c.accentBg, color: c.accentColor }}
                      >
                        <Icon size={18} />
                      </span>
                      <span
                        className="text-[11px] font-bold uppercase tracking-widest inline-flex items-center gap-1"
                        style={{ color: c.accentColor }}
                      >
                        <ArrowRight size={12} />
                        {c.eyebrow}
                      </span>
                    </div>
                    <ArrowUpRight
                      size={18}
                      style={{ color: c.accentColor }}
                      className="opacity-60 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                    />
                  </div>
                  <h3
                    className="font-manrope text-[#0D0F1A] mb-3"
                    style={{
                      fontSize: 'clamp(1.15rem, 2.2vw, 1.5rem)',
                      fontWeight: 800,
                      lineHeight: 1.25,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {c.title}
                  </h3>
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: c.accentColor, opacity: 0.7 }}
                  >
                    {c.tag}
                  </p>
                </div>

                {/* Bottom: big stat */}
                <div className="relative mt-8 flex items-baseline gap-3">
                  <span
                    className="font-manrope tabular-nums"
                    style={{
                      fontSize: 'clamp(2.4rem, 5vw, 3.2rem)',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                      color: c.accentColor,
                    }}
                  >
                    {c.stat}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#6B7080] uppercase tracking-wide">
                    {c.statLabel}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
