'use client'

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
const highlights = [
  { value: '$5,000,000+', label: 'Total withdrawals paid to clients since launch' },
  { value: '12,000+',     label: 'Active live trading clients globally' },
  { value: '94%',         label: 'Of withdrawals processed within 24 hours' },
  { value: '<30ms',       label: 'Average order execution speed' },
];

const recentPayouts = [
  { initials: 'MC', name: 'Marcus C.',     city: 'Singapore', plan: 'Pro Account',      amount: '$24,500', date: 'April 2026',    days: 'Same day' },
  { initials: 'SA', name: 'Sofia A.',      city: 'Portugal',  plan: 'Standard Account', amount: '$18,200', date: 'April 2026',    days: '6 hours'  },
  { initials: 'HT', name: 'Hiroshi T.',    city: 'Japan',     plan: 'ECN Account',      amount: '$31,800', date: 'April 2026',    days: 'Same day' },
  { initials: 'AK', name: 'Aisha K.',      city: 'UAE',       plan: 'Standard Account', amount: '$15,400', date: 'March 2026',    days: '2 hours'  },
  { initials: 'DV', name: 'Dimitri V.',    city: 'Estonia',   plan: 'VIP Account',      amount: '$42,100', date: 'March 2026',    days: 'Same day' },
  { initials: 'JK', name: 'Jamal K.',      city: 'Nigeria',   plan: 'Standard Account', amount: '$21,600', date: 'February 2026', days: '8 hours'  },
  { initials: 'LO', name: 'Lukas O.',      city: 'Germany',   plan: 'Pro Account',      amount: '$48,300', date: 'February 2026', days: 'Same day' },
  { initials: 'ER', name: 'Elena R.',      city: 'Mexico',    plan: 'ECN Account',      amount: '$27,650', date: 'February 2026', days: '4 hours'  },
];

const testimonials = [
  {
    initials: 'MC',
    name: 'Marcus Chen',
    role: 'Day Trader, Singapore',
    quote: 'I was sceptical at first. Every broker I had tried had wide spreads disguised as raw and surprise inactivity fees. Bull4x was different — sub-30ms execution, withdrawals in USD within hours, and the pricing was exactly what they advertised. No drama.',
  },
  {
    initials: 'SA',
    name: 'Sofia Almeida',
    role: 'Algo Trader, Portugal',
    quote: 'I have been running EAs on GBP/JPY for four years. The ECN account with $3.5 per lot commission produces the lowest effective cost I have ever seen for high-frequency strategies. Withdrew profits to USDT within a few hours. Clean.',
  },
  {
    initials: 'HT',
    name: 'Hiroshi Tanaka',
    role: 'Forex Trader, Japan',
    quote: 'What convinced me was the public withdrawal history and the FCA regulation. I cross-checked the numbers, verified a few clients on X, and opened a VIP account. The dedicated account manager has been responsive on every query. Withdrawals come through as promised.',
  },
];

export default function ResultsPage() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-44 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Results</p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }} className="text-[#0D0F1A] mb-6">
            Real clients. Real <span className="text-[#0158c6]">withdrawals</span>.
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed">
            We publish our results openly. No fake screenshots, no inflated numbers.
            Every withdrawal listed here was paid to a real, KYC-verified client.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-12 md:pb-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((h) => (
            <div key={h.label} className="border border-[#E8EAF0] rounded-2xl p-6 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0D0F1A] mb-2" style={{ letterSpacing: '-0.03em' }}>{h.value}</div>
              <p className="text-sm text-[#6B7080]">{h.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Payouts Table */}
      <section className="py-14 md:py-24 px-6 bg-[#0C0C1D]">
        <div className="max-w-5xl mx-auto">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-white mb-4 text-center">
            Recent <span className="text-[#0158c6]">withdrawals</span>
          </h2>
          <p className="text-base text-[#9AA0B4] text-center mb-8 md:mb-12">Privacy-first: we show initials and city only. Full verification available on request.</p>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)]">
                  <th className="text-xs font-semibold text-[#9AA0B4] uppercase tracking-wider pb-4">Client</th>
                  <th className="text-xs font-semibold text-[#9AA0B4] uppercase tracking-wider pb-4">Account</th>
                  <th className="text-xs font-semibold text-[#9AA0B4] uppercase tracking-wider pb-4">Withdrawal</th>
                  <th className="text-xs font-semibold text-[#9AA0B4] uppercase tracking-wider pb-4">Processed In</th>
                  <th className="text-xs font-semibold text-[#9AA0B4] uppercase tracking-wider pb-4">Month</th>
                </tr>
              </thead>
              <tbody>
                {recentPayouts.map((p, i) => (
                  <tr key={i} className="border-b border-[rgba(255,255,255,0.05)]">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0158c6] flex items-center justify-center text-white text-xs font-bold shrink-0">{p.initials}</div>
                        <div>
                          <div className="text-sm font-semibold text-white">{p.name}</div>
                          <div className="text-xs text-[#9AA0B4]">{p.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-sm text-[#9AA0B4]">{p.plan}</td>
                    <td className="py-4 pr-4 text-sm font-bold text-emerald-400">{p.amount}</td>
                    <td className="py-4 pr-4 text-sm text-[#9AA0B4]">{p.days}</td>
                    <td className="py-4 text-sm text-[#9AA0B4]">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#0D0F1A] mb-8 md:mb-12 text-center">
            In their <span className="text-[#0158c6]">own words</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="border border-[#E8EAF0] rounded-2xl p-6 sm:p-8">
                <p className="text-sm text-[#6B7080] leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E8EAF0]">
                  <div className="w-10 h-10 rounded-full bg-[#0D0F1A] flex items-center justify-center text-white text-xs font-bold">{t.initials}</div>
                  <div>
                    <div className="text-sm font-bold text-[#0D0F1A]">{t.name}</div>
                    <div className="text-xs text-[#6B7080]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 px-6 bg-[#FAFBFD]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#0D0F1A] mb-6">
            Your name could be on this list
          </h2>
          <p className="text-base text-[#6B7080] mb-8">Open your live account, trade with discipline, and withdraw your profits the same day.</p>
          <Link href="/our-accounts" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:bg-[#0199c6] transition-all">
            View Accounts <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
