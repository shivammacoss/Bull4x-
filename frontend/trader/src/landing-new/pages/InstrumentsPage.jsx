'use client'

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
const instruments = [
  {
    name: 'Forex Majors & Minors',
    exchange: 'OTC',
    type: 'Currency Pairs',
    description: 'Trade 50+ major, minor, and exotic pairs — EUR/USD, GBP/USD, USD/JPY, AUD/USD, and more. The world\'s deepest liquidity pool, with sub-30ms execution from Tier-1 aggregators.',
    lotSize: 'Up to 1:500 leverage',
    tradingHours: '24/5 — Sun 22:00 to Fri 22:00 GMT',
    marginRequired: 'As per account tier',
    allowed: ['Manual Trading', 'EAs', 'Copy Trading', 'High-Frequency', 'News Trading'],
    notAllowed: [],
  },
  {
    name: 'Metals & Commodities',
    exchange: 'OTC',
    type: 'Spot & CFDs',
    description: 'Gold (XAU/USD), silver (XAG/USD), WTI crude, brent, and natural gas. Hedge currency exposure or take directional setups during high-impact economic releases.',
    lotSize: 'Up to 1:200 leverage',
    tradingHours: '23/5 — Sun 23:00 to Fri 22:00 GMT',
    marginRequired: 'As per account tier',
    allowed: ['Manual Trading', 'EAs', 'Copy Trading', 'News Trading'],
    notAllowed: [],
  },
  {
    name: 'Global Indices',
    exchange: 'OTC',
    type: 'Index CFDs',
    description: 'US30, NAS100, SPX500, GER40, UK100, JP225 — all the world\'s major equity indices in a single account. Competitive margins and tight overnight financing.',
    lotSize: 'Up to 1:100 leverage',
    tradingHours: 'Per-index sessions (see platform)',
    marginRequired: 'As per account tier',
    allowed: ['Manual Trading', 'EAs', 'Copy Trading'],
    notAllowed: [],
  },
  {
    name: 'Crypto CFDs',
    exchange: 'OTC',
    type: 'Crypto CFDs',
    description: 'BTC/USD, ETH/USD, SOL/USD, XRP/USD, and more. Trade 24/7 with full margin flexibility — no wallet, no custody concerns. CFD form, settled in USD.',
    lotSize: 'Up to 1:20 leverage',
    tradingHours: '24/7 — including weekends',
    marginRequired: 'As per account tier',
    allowed: ['Manual Trading', 'EAs', 'Copy Trading'],
    notAllowed: [],
  },
];

const rules = [
  'All orders are routed via STP/ECN to tier-1 liquidity providers — real execution at real market prices.',
  'Manual, EA, copy trading, and high-frequency setups are permitted on every account tier.',
  'News trading is allowed — hold positions through any economic release.',
  'Overnight positions are permitted on all instruments. Swap financing applies per asset; swap-free Islamic accounts available.',
  'Negative balance protection applies across every account — your balance can never fall below zero.',
  'Forex trades 24/5; crypto trades 24/7. Sessions and holiday calendars are shown in the platform.',
];

export default function InstrumentsPage() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-44 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Instruments</p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }} className="text-[#0D0F1A] mb-6">
            Trade 60+ <span className="text-[#0158c6]">global markets</span>
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed">
            Forex pairs, metals, global indices, and crypto CFDs — all in one unified live trading account.
            No instrument restrictions. No hidden margin rules.
          </p>
        </div>
      </section>

      {/* Instruments Detail */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {instruments.map((inst, idx) => (
            <div key={inst.name} className="border border-[#E8EAF0] rounded-2xl overflow-hidden">
              {/* Header */}
              <div className={`px-6 sm:px-10 py-8 ${idx === 0 ? 'bg-[#0C0C1D] text-white' : 'bg-[#FAFBFD] text-[#0D0F1A]'}`}>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ letterSpacing: '-0.02em' }}>{inst.name}</h2>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${idx === 0 ? 'bg-[#0158c6] text-white' : 'bg-[#E8EAF0] text-[#6B7080]'}`}>
                    {inst.exchange}
                  </span>
                  <span className={`text-xs font-medium ${idx === 0 ? 'text-[#9AA0B4]' : 'text-[#6B7080]'}`}>{inst.type}</span>
                </div>
                <p className={`text-sm sm:text-base leading-relaxed max-w-3xl ${idx === 0 ? 'text-[#9AA0B4]' : 'text-[#6B7080]'}`}>
                  {inst.description}
                </p>
              </div>

              {/* Details */}
              <div className="px-6 sm:px-10 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-[#E8EAF0]">
                <div>
                  <p className="text-xs text-[#6B7080] mb-1">Lot Size</p>
                  <p className="text-sm font-bold text-[#0D0F1A]">{inst.lotSize}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7080] mb-1">Trading Hours</p>
                  <p className="text-sm font-bold text-[#0D0F1A]">{inst.tradingHours}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7080] mb-1">Allowed</p>
                  <p className="text-sm font-bold text-[#0D0F1A]">{inst.allowed.join(', ')}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7080] mb-1">Not Allowed</p>
                  <p className="text-sm font-bold text-red-500">{inst.notAllowed.join(', ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trading Rules */}
      <section className="py-14 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-4xl mx-auto">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#0D0F1A] mb-8 md:mb-10">
            Trading <span className="text-[#0158c6]">rules</span> that apply across all instruments
          </h2>
          <div className="space-y-4">
            {rules.map((rule, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="text-sm font-bold text-[#0158c6] shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-base text-[#6B7080] leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#0D0F1A] mb-6">
            Ready to trade <span className="text-[#0158c6]">global markets</span>?
          </h2>
          <p className="text-base text-[#6B7080] mb-8">Pick an account tier that matches your style and start trading today.</p>
          <Link href="/our-accounts" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:bg-[#0199c6] transition-all">
            View Accounts <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
