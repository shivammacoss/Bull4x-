'use client'

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const faqs = [
  {
    q: 'What is Bull4x?',
    a: 'Bull4x is a global forex and CFD brokerage. We give retail and professional traders access to 60+ instruments — forex pairs, metals, global indices, and crypto CFDs — with institutional-grade execution, tight spreads, and same-day withdrawals on a fully regulated platform.',
  },
  {
    q: 'Is Bull4x a regulated forex broker?',
    a: 'Yes. Bull4x is an authorised forex and CFD brokerage with FCA and CySEC oversight. Client funds are held in segregated accounts at tier-1 banks with negative balance protection on every live account, so your balance can never go below zero.',
  },
  {
    q: 'Which forex pairs and instruments can I trade?',
    a: 'Over 60 instruments. Forex majors (EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CHF, USD/CAD, NZD/USD), minors and exotics; precious metals (XAU/USD, XAG/USD); global indices (US30, NAS100, SPX500, GER40, UK100, JP225); commodities (WTI, Brent, natural gas); and crypto CFDs (BTC, ETH, SOL, XRP).',
  },
  {
    q: 'What are the spreads and commissions on each account?',
    a: 'Standard: spreads from 1.2 pips, zero commission. Pro: spreads from 0.6 pips, zero commission, plus a dedicated account manager. ECN: raw spreads from 0.0 pips on EUR/USD with $3.5 per lot per side commission — built for scalpers, EAs, and high-frequency strategies.',
  },
  {
    q: 'How do I deposit and withdraw funds?',
    a: 'Deposit via Visa/Mastercard, bank wire, Skrill, Neteller, or crypto (BTC, USDT, ETH). Most withdrawals are processed the same business day in USD, EUR, GBP, or USDT. Zero internal withdrawal fees on every live account.',
  },
  {
    q: 'What is the minimum deposit and how do I open an account?',
    a: 'The minimum live deposit is $100 on Standard, $500 on Pro, and $2,000 on ECN. Demo accounts are free with no deposit required. Sign up takes under 2 minutes and KYC is usually approved within 24 hours so you can start trading the same day.',
  },
  {
    q: 'What is the maximum leverage on forex?',
    a: 'Up to 1:500 on major forex pairs, 1:200 on metals, 1:100 on indices and commodities, and 1:20 on crypto CFDs. Negative balance protection applies on every live account regardless of leverage. Maximum leverage may vary by jurisdiction.',
  },
  {
    q: 'Can I use Expert Advisors, scalp, or trade news?',
    a: 'Yes. EAs, algorithmic strategies, scalping, hedging, copy trading, high-frequency setups, and news trading are all fully permitted with zero strategy restrictions. We support MetaTrader 4, MetaTrader 5, and our Bull4x Web Platform.',
  },
];

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 mb-3 ${
        isOpen
          ? 'border-[#0158c6] bg-[rgba(1,88,198,0.03)]'
          : 'border-[#E8EAF0] bg-white hover:border-[rgba(1,88,198,0.3)]'
      }`}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
        onClick={onToggle}
      >
        <span className={`text-sm sm:text-base font-semibold font-manrope transition-colors ${isOpen ? 'text-[#0158c6]' : 'text-[#0D0F1A]'}`}>
          {faq.q}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-all duration-300 ${isOpen ? 'rotate-180 text-[#0158c6]' : 'text-[#6B7080]'}`}
        />
      </button>
      <div
        className="overflow-hidden"
        style={{
          maxHeight: isOpen ? '500px' : '0',
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 0.4s ease, opacity 0.3s ease',
        }}
      >
        <div className="px-5 pb-4">
          <div className="h-px bg-[rgba(1,88,198,0.15)] mb-3" />
          <p className="text-sm sm:text-base text-[#6B7080] leading-relaxed">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const { ref: headerRef } = useScrollAnimation();
  const { ref: contentRef } = useScrollAnimation(0.1);

  return (
    <section className="bg-white py-14 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Two-column layout */}
        <div ref={headerRef} className="scroll-reveal grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* LEFT — Heading (1/3) */}
          <div className="lg:col-span-1">
            <h2
              className="font-extrabold text-[#0D0F1A] tracking-[-0.02em] font-manrope mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Frequently Asked{' '}
              <span className="text-[#0158c6]">Questions</span>
            </h2>
            <p className="text-base sm:text-lg text-[#6B7080] font-light">
              Answers to the questions traders ask us most.
            </p>
          </div>

          {/* RIGHT — FAQ accordion (2/3) */}
          <div ref={contentRef} className="scroll-reveal lg:col-span-2">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                faq={faq}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
