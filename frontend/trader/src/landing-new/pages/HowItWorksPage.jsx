'use client'

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
const steps = [
  {
    number: '01',
    title: 'Open Your Account',
    desc: 'Pick an account tier that matches your trading style — Standard, Pro, ECN, or VIP. Each tier has its own minimum deposit, spread structure, and base currency options.',
  },
  {
    number: '02',
    title: 'Complete KYC',
    desc: 'Upload a government-issued ID and proof of address. Verification is fully digital and most approvals land within 24 hours. Your KYC stays on file for all future deposits and withdrawals.',
  },
  {
    number: '03',
    title: 'Fund & Start Trading',
    desc: 'Deposit from $100 via card, bank wire, e-wallet, or crypto. Trade 60+ instruments on MT4, MT5, or our web platform. EAs, copy trading, and news trading are all permitted.',
  },
  {
    number: '04',
    title: 'Withdraw Profits',
    desc: 'Withdraw inside your client dashboard the moment you want. Most withdrawals process the same business day in USD, EUR, GBP, or USDT with zero internal fees.',
  },
];

const rules = [
  { label: 'Min Deposit', value: '$100', desc: 'Open a Standard account from $100. Pro starts at $500, ECN at $2,000. Demo accounts are free.' },
  { label: 'Max Leverage', value: '1:500', desc: 'Up to 1:500 on major forex pairs, 1:200 on metals, 1:100 on indices, 1:20 on crypto CFDs.' },
  { label: 'Spreads From', value: '0.0 pips', desc: 'Raw spreads from 0.0 pips on ECN accounts. 1.2 pips on Standard with zero commission.' },
  { label: 'Execution Speed', value: '<30ms', desc: 'STP/ECN routing with sub-30ms average fills. No requotes, even during high-impact news.' },
  { label: 'News Trading', value: 'Allowed', desc: 'Hold trades through any economic release. No window restrictions, no exclusions.' },
  { label: 'Strategy Restrictions', value: 'None', desc: 'Manual, EA, copy-trading, and high-frequency setups are all permitted on every account.' },
];

export default function HowItWorksPage() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-14 md:pt-44 md:pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">How It Works</p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }} className="text-[#0D0F1A] mb-6">
            From sign-up to <span className="text-[#0158c6]">live trading</span> in four simple steps
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed">
            Our onboarding process is designed to be straightforward. No complex procedures,
            no hidden requirements. Open your account, fund it, and start trading global markets.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12 md:py-20 px-6 bg-[#FAFBFD]">
        <div className="max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.number} className={`flex flex-col md:flex-row gap-6 md:gap-12 py-12 ${i < steps.length - 1 ? 'border-b border-[#E8EAF0]' : ''}`}>
              <div className="shrink-0">
                <span className="text-sm font-bold text-[#0158c6]">{step.number}</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#0D0F1A] mb-3">{step.title}</h3>
                <p className="text-base text-[#6B7080] leading-relaxed max-w-xl">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rules */}
      <section className="py-14 md:py-24 px-6 bg-[#0C0C1D]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-white mb-4">
              Trading <span className="text-[#0158c6]">Conditions</span>
            </h2>
            <p className="text-base sm:text-lg text-[#9AA0B4]">Clear, documented, no surprises. Know exactly what to expect before you start.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rules.map((r) => (
              <div key={r.label} className="bg-[#141428] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 sm:p-8">
                <p className="text-sm text-[#9AA0B4] mb-2">{r.label}</p>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mb-3" style={{ letterSpacing: '-0.03em' }}>{r.value}</div>
                <p className="text-sm text-[#9AA0B4] leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#0D0F1A] mb-6">
            Ready to trade? <span className="text-[#0158c6]">Let's begin.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#6B7080] mb-8">Choose an account tier and open your live account today.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/our-accounts" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:bg-[#0199c6] transition-all">
              View Accounts <ArrowRight size={16} />
            </Link>
            <Link href="/faqs" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-[#E8EAF0] text-[#0D0F1A] font-semibold text-sm hover:border-[#0158c6] hover:text-[#0158c6] transition-all">
              Read FAQs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
