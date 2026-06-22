'use client'

import { Lock, Activity, FileCheck, ShieldCheck } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// §H — Compliance & Trust Strip
// Insertion: directly above Footer (§20).
// Wrapper pattern cloned from TradingConditions.jsx 4-stat strip (light bg).
// Text-only icons — no new image files added.

const items = [
  { icon: ShieldCheck, label: 'Segregated Client Funds' },
  { icon: Lock,        label: 'Advanced SSL Encryption' },
  { icon: FileCheck,   label: 'Full AML & KYC Compliance' },
  { icon: Activity,    label: 'Independent Dispute Resolution' },
];

export default function ComplianceTrust() {
  const { ref: headerRef } = useScrollAnimation();

  return (
    <section className="bg-white border-t border-[#E8EAF0] py-12 md:py-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div ref={headerRef} className="scroll-reveal text-center mb-8 md:mb-10">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest">A Broker You Can Trust</p>
        </div>

        {/* 4-item strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div
                key={it.label}
                className="flex flex-col items-center text-center gap-3 px-3"
              >
                <div className="w-11 h-11 rounded-lg bg-[rgba(1,88,198,0.08)] flex items-center justify-center">
                  <Icon size={20} className="text-[#0158c6]" />
                </div>
                <p className="text-sm sm:text-base font-semibold text-[#0D0F1A] font-manrope leading-snug">
                  {it.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
