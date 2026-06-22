'use client'

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
const faqCategories = {
  'General': [
    { q: 'What is Bull4x?', a: 'Bull4x is a global forex and CFD brokerage. We give retail and professional traders access to 60+ instruments — forex pairs, metals, global indices, and crypto CFDs — with institutional-grade execution, tight spreads, and fast withdrawals on a fully regulated platform.' },
    { q: 'How does Bull4x work?', a: 'You open a live account in minutes, complete KYC, and fund from $100. Once approved you can trade 60+ instruments on MetaTrader 4, MetaTrader 5, or our Bull4x Web Platform. Most withdrawals are processed the same business day in USD, EUR, GBP, or USDT.' },
    { q: 'Is Bull4x a real forex broker?', a: 'Yes. Bull4x is an authorised forex and CFD brokerage. Every order routes through STP/ECN execution to tier-1 liquidity providers — there is no internal dealing desk taking the other side of your trade. You always trade at real market prices.' },
    { q: 'Is Bull4x regulated?', a: 'Yes. Bull4x is an authorised forex and CFD brokerage under FCA and CySEC oversight. Client funds are held in segregated tier-1 bank accounts, fully separated from company operating capital, with negative balance protection on every live account.' },
    { q: 'Who is the platform for?', a: 'Retail and professional forex traders who want institutional execution, tight spreads, and fast withdrawals on a regulated broker. Beginners on Standard, active traders on Pro, scalpers and algos on ECN, and institutional clients on VIP — every tier is welcome.' },
    { q: 'Is Bull4x suitable for beginners?', a: 'Yes. Beginners can open a free demo account with $100,000 virtual funds, or a live Standard account from just $100. The platform, education hub, and 24/5 multilingual support are designed to help new traders go from sign-up to first trade in under a day.' },
    { q: 'Why choose Bull4x over other forex brokers?', a: 'Tier-1 liquidity, sub-30ms execution, regulated brokerage status, multi-currency wallets (USD, EUR, GBP, USDT), same-day withdrawals, and zero strategy restrictions — EAs, scalping, hedging, copy trading, and news trading are all fully permitted.' },
    { q: 'Is Bull4x safe and trustworthy?', a: 'Client funds are segregated at tier-1 banks, separated from company capital. Every live account includes negative balance protection. We are authorised by the FCA and CySEC, publish our regulatory standing transparently, and have paid every approved withdrawal on time to date.' },
  ],
  'Trading': [
    { q: 'Which instruments can I trade at Bull4x?', a: '60+ instruments across forex majors (EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CHF, USD/CAD, NZD/USD), minors and exotics; metals (XAU/USD gold, XAG/USD silver); global indices (US30, NAS100, SPX500, GER40, UK100, JP225); commodities (WTI, Brent, natural gas); and crypto CFDs (BTC, ETH, SOL, XRP).' },
    { q: 'What are the spreads and commissions?', a: 'Standard: spreads from 1.2 pips, zero commission. Pro: spreads from 0.6 pips, zero commission, dedicated account manager. ECN: raw spreads from 0.0 pips on EUR/USD with $3.5 per lot per side commission ($7 round trip) — designed for scalpers, EAs, and high-frequency strategies.' },
    { q: 'What is the maximum forex leverage?', a: 'Up to 1:500 on major forex pairs, 1:200 on metals, 1:100 on indices and commodities, and 1:20 on crypto CFDs. Negative balance protection applies on every live account regardless of leverage. Maximum leverage may be limited by your country of residence per local regulation.' },
    { q: 'What happens if my account balance reaches zero?', a: 'Every live account includes negative balance protection — your balance can never go below zero, even during extreme volatility or weekend gaps. Margin calls and stop-outs trigger automatically before that point so you only ever lose the capital you have deposited.' },
    { q: 'Can I trade forex 24 hours a day?', a: 'Yes. Forex markets trade 24/5 from Sunday 22:00 UTC through Friday 22:00 UTC across the Sydney, Tokyo, London, and New York sessions. Crypto CFDs trade 24/7 including weekends. Pick the session that fits your strategy.' },
    { q: 'Can I use Expert Advisors (EAs) and scalp?', a: 'Yes. EAs, algorithmic strategies, scalping, hedging, copy trading, high-frequency setups, and news trading are all fully permitted. There are zero strategy restrictions on any account tier — what works for you works on Bull4x.' },
    { q: 'Which trading platforms do you support?', a: 'MetaTrader 4 (MT4), MetaTrader 5 (MT5), and our Bull4x Web Platform. iOS and Android mobile apps are available. FIX API access is offered on VIP accounts for institutional algorithmic clients.' },
    { q: 'Do you offer swap-free / Islamic forex accounts?', a: 'Yes. Swap-free Islamic accounts are available on Standard, Pro, and ECN tiers with no overnight swap charges. Contact support after registration to convert your account — there is no extra cost for the conversion.' },
  ],
  'Deposits & Withdrawals': [
    { q: 'How do I deposit funds into my live account?', a: 'Deposit via Visa/Mastercard, bank wire, Skrill, Neteller, or crypto (BTC, USDT TRC20/ERC20, ETH). Most card and e-wallet deposits are credited instantly. Bank wires usually clear within one business day. Crypto deposits credit after on-chain confirmation.' },
    { q: 'What is the minimum deposit?', a: 'The minimum live deposit is $100 on Standard, $500 on Pro, and $2,000 on ECN. VIP starts at $25,000+. Demo accounts are completely free with no deposit required.' },
    { q: 'How do I withdraw my profits?', a: 'Withdraw inside your client dashboard. Most withdrawals are processed the same business day in USD, EUR, GBP, or USDT. Bank wires land within 1-2 business days. Card refunds usually clear within 2-3 business days. Crypto withdrawals clear within minutes of on-chain confirmation.' },
    { q: 'Are there any withdrawal fees?', a: 'Zero internal withdrawal fees on Bull4x live accounts. External network fees (crypto) or intermediary bank fees (international wires) may apply on certain rails — these are charged by third parties and are shown transparently before you confirm the withdrawal.' },
    { q: 'Why must my first withdrawal go back to my deposit method?', a: 'This is a standard global AML / anti-money-laundering rule. Your first withdrawal up to the deposit amount must return to the same payment method you used to deposit. Profit-only withdrawals can then be sent to any verified bank account, e-wallet, or crypto wallet on file.' },
    { q: 'Which currencies can I withdraw in?', a: 'USD, EUR, GBP, or USDT (TRC20 or ERC20). You pick the currency and rail at the moment of withdrawal — bank wire, SEPA, card refund, e-wallet, or stablecoin. No surprise currency conversion fees on supported rails.' },
  ],
  'Account': [
    { q: 'How do I open a live trading account?', a: 'Click "Open Account" on any page, enter your basic details (name, email, country of residence), verify your email with the OTP, and complete KYC by uploading a government ID and proof of address. The whole flow takes under 2 minutes; KYC is usually approved within 24 hours.' },
    { q: 'How long does account approval take?', a: 'Demo accounts are activated instantly. Live accounts are usually KYC-approved within 24 hours of document submission. Once approved you can fund the account and start trading the same business day.' },
    { q: 'What account types are available?', a: 'Standard from $100, Pro from $500, ECN from $2,000, VIP from $25,000+, and swap-free Islamic variants. Demo accounts are free on every tier with $100,000 in virtual funds. You can hold multiple live accounts of different types under the same client login.' },
    { q: 'Do I need prior trading experience to join?', a: 'No, but a basic understanding of forex helps. Beginners can open a Standard live account with $100, or practise risk-free on a free demo account first. Our education hub, tutorial library, and 24/5 multilingual support are built to help you ramp up quickly.' },
    { q: 'How do I track my trading performance?', a: 'Your client dashboard shows real-time profit and loss, open positions, full trade history, account balance, deposits/withdrawals, and cashback earnings — all updated live across web and mobile.' },
    { q: 'What documents do I need for KYC?', a: 'A valid government-issued photo ID (passport, national ID, or driving licence) and proof of address (utility bill or bank statement, dated within the last 3 months). We verify everything digitally — no in-person meeting, no notarisation, no paperwork.' },
    { q: 'Can I hold multiple trading accounts?', a: 'Yes. You can hold multiple live accounts of different types (e.g. Standard + ECN, or USD + USDT base currencies). Each account operates independently with its own balance, leverage, and instruments — all managed from a single client login.' },
    { q: 'Can I switch from demo to a live account later?', a: 'Yes. Demo accounts can be converted to live at any time with no platform re-learning — the interface, instruments, and execution are identical. Simply complete KYC, fund the live account, and start trading the same business day.' },
  ],
};

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all mb-3 ${isOpen ? 'border-[#0158c6] bg-[rgba(1,88,198,0.03)]' : 'border-[#E8EAF0] bg-white hover:border-[rgba(1,88,198,0.3)]'}`}>
      <button className="w-full flex items-center justify-between px-6 py-5 text-left gap-4" onClick={onToggle}>
        <span className={`text-sm sm:text-base font-semibold transition-colors ${isOpen ? 'text-[#0158c6]' : 'text-[#0D0F1A]'}`}>{faq.q}</span>
        <ChevronDown size={18} className={`shrink-0 transition-all duration-300 ${isOpen ? 'rotate-180 text-[#0158c6]' : 'text-[#6B7080]'}`} />
      </button>
      <div className="overflow-hidden" style={{ maxHeight: isOpen ? '1500px' : '0', opacity: isOpen ? 1 : 0, transition: 'max-height 0.4s ease, opacity 0.3s ease' }}>
        <div className="px-6 pb-5">
          <div className="h-px bg-[rgba(1,88,198,0.1)] mb-4" />
          <p className="text-sm sm:text-base text-[#6B7080] leading-relaxed">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState('General-0');
  const [activeCategory, setActiveCategory] = useState('General');

  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-44 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">FAQs</p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }} className="text-[#0D0F1A] mb-6">
            Frequently asked <span className="text-[#0158c6]">questions</span>
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about Bull4x. Can't find what you're looking for?{' '}
            <Link href="/contact-us" className="text-[#0158c6] hover:underline">Contact our team</Link>.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-8 md:mb-10 justify-center">
            {Object.keys(faqCategories).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#0158c6] text-white'
                    : 'bg-[#F0F2F8] text-[#6B7080] hover:text-[#0D0F1A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Questions */}
          <div>
            {faqCategories[activeCategory].map((faq, i) => {
              const key = `${activeCategory}-${i}`;
              return (
                <FAQItem
                  key={key}
                  faq={faq}
                  isOpen={openIndex === key}
                  onToggle={() => setOpenIndex(openIndex === key ? null : key)}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 px-6 bg-[#0C0C1D]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-base text-[#9AA0B4] mb-8">Our support team is available to help you with any queries.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact-us" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm hover:bg-[#0199c6] transition-all">
              Contact Support
            </Link>
            <Link href="/our-accounts" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-[rgba(255,255,255,0.15)] text-white font-semibold text-sm hover:border-[#0158c6] hover:text-[#0158c6] transition-all">
              View Accounts
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
