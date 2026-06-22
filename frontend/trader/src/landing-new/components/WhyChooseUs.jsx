'use client'

import {
  Globe, BarChart2, Zap, Layers, ShieldCheck,
  HeadphonesIcon, LayoutDashboard, BookOpen, Wallet
} from 'lucide-react';
import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation';

const features = [
  { icon: BarChart2,       title: 'Deep Liquidity',               desc: 'We pull pricing from leading banks and liquidity providers, so your fills come through tighter and with far less slippage.' },
  { icon: ShieldCheck,     title: 'Regulated & Protected',        desc: 'Client funds sit in segregated accounts with negative balance protection — your capital stays where it belongs.' },
  { icon: Zap,             title: 'Lightning-Fast Execution',     desc: 'Orders are matched in milliseconds. Scalpers, day traders, and anyone running automated strategies get the speed they need.' },
  { icon: Globe,           title: 'One Account, Many Markets',    desc: 'Move between forex, indices, commodities, stocks, and crypto without ever leaving your account.' },
  { icon: LayoutDashboard, title: 'Smart Trading Technology',     desc: 'Professional charts, custom indicators, live market data, and AI-driven insights — all in one place.' },
  { icon: Wallet,          title: 'Honest Pricing',               desc: 'What you see is what you pay. No buried fees, no games — just clean, straightforward execution.' },
  { icon: Layers,          title: 'An Account for Every Style',   desc: 'Standard, ECN Raw, Pro, VIP, and swap-free Islamic accounts — pick the one that fits how you trade.' },
  { icon: HeadphonesIcon,  title: '24/5 Support',                 desc: 'Real people on the other end whenever the markets are open, ready to help with anything you run into.' },
  { icon: BookOpen,        title: 'Education & Research',         desc: 'Daily market analysis, an economic calendar, live webinars, and a full video library to help you keep getting better.' },
];

export default function WhyChooseUs() {
  const { ref: headerRef } = useScrollAnimation();
  const cardsRef = useStaggerAnimation(0.08, 70);

  return (
    <section id="tools" className="bg-[#0C0C1D] py-14 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div ref={headerRef} className="scroll-reveal mb-10 md:mb-16 max-w-2xl">
          <h2
            className="text-white font-manrope mb-5"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Why Traders Pick{' '}
            <span className="text-[#0158c6]">Bull4x</span>
          </h2>
          <p className="text-base sm:text-lg text-[#9AA0B4]" style={{ lineHeight: 1.7 }}>
            We pair professional-grade technology with conditions that actually work in your favour — giving you a real edge across global markets.
          </p>
        </div>

        {/* Feature rows */}
        <div ref={cardsRef}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="stagger-child border-t border-[rgba(255,255,255,0.08)] py-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-[rgba(1,88,198,0.1)] flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-[#0158c6]" />
                </div>

                {/* Title */}
                <h3 className="text-white text-lg sm:text-xl font-bold font-manrope sm:w-64 shrink-0">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-[#9AA0B4] text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
          {/* Bottom border for last row */}
          <div className="border-t border-[rgba(255,255,255,0.08)]" />
        </div>

      </div>
    </section>
  );
}
