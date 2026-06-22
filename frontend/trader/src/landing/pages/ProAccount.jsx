'use client'

import Link from 'next/link'
import { Check, Crown, Monitor, Zap, ArrowRight } from 'lucide-react'
import Navbar from '@/landing-new/components/Navbar'
import Footer from '@/landing-new/components/Footer'
import TopBanner from '@/landing-new/components/TopBanner'

const ProAccount = () => {
  const overview = [
    { label: 'Minimum Deposit',  value: '$5,000' },
    { label: 'Spreads From',     value: '0.0 Pips' },
    { label: 'Maximum Leverage', value: 'Up to 1:200' },
    { label: 'Commission',       value: '$3.5 / Lot' },
  ]

  const features = [
    'Priority 24/7 customer support',
    'Raw spreads from 0.0 pips',
    'Free VPS hosting',
    'Dedicated account manager',
    'Advanced trading tools',
    'Institutional-grade execution',
    'Premium market research',
    'Exclusive trading signals',
    'Enhanced liquidity access',
    'Faster order execution speeds',
  ]

  const advantages = [
    {
      icon: Crown,
      title: 'Dedicated Account Manager',
      desc: 'Receive personalized support from an experienced relationship manager who understands your trading goals and provides tailored assistance.',
    },
    {
      icon: Monitor,
      title: 'Complimentary VPS Hosting',
      desc: 'Keep your trading strategies and automated systems running 24/7 with secure, reliable VPS hosting at no additional cost.',
    },
    {
      icon: Zap,
      title: 'Raw Spread Pricing',
      desc: 'Access institutional-grade pricing with spreads starting from 0.0 pips on major Forex pairs and other selected instruments.',
    },
  ]

  const idealFor = [
    'Professional traders',
    'High-volume investors',
    'Scalpers',
    'Algorithmic traders',
    'Money managers',
    'Institutional clients',
  ]

  const comparison = [
    { feature: 'Minimum Deposit',    standard: '$100',        pro: '$5,000',           demo: '$0' },
    { feature: 'Spreads From',       standard: '1.2 Pips',    pro: '0.0 Pips',         demo: 'Live Market Spreads' },
    { feature: 'Leverage',           standard: 'Up to 1:500', pro: 'Up to 1:200',      demo: 'Up to 1:500' },
    { feature: 'Commission',         standard: 'None',        pro: '$3.5 Per Lot',     demo: 'None' },
    { feature: 'Support',            standard: '24/5',        pro: 'Priority 24/7',    demo: '24/5' },
    { feature: 'VPS Hosting',        standard: 'No',          pro: 'Included',         demo: 'No' },
    { feature: 'Dedicated Manager',  standard: 'No',          pro: 'Included',         demo: 'No' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Navbar />
      {/* Hero */}
      <section className="pt-28 pb-14 md:pt-44 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#0158c6]/10 text-[#0158c6] px-4 py-2 rounded-full mb-6 font-semibold text-sm">
            <Crown size={16} />
            For Experienced & Professional Traders
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }} className="text-[#0D0F1A] mb-6">
            <span className="text-[#0158c6]">Pro</span> Account
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed mb-8">
            Experience institutional-grade trading with ultra-tight spreads, premium support, and advanced trading
            conditions designed for serious traders and high-volume investors.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] hover:-translate-y-0.5 transition-all"
            style={{ background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
          >
            Open Pro Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Account Overview */}
      <section className="py-14 md:py-20 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Conditions</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Account Overview
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {overview.map((o) => (
              <div key={o.label} className="bg-white border-t-4 border-[#0158c6] border-x border-b border-x-[#E8EAF0] border-b-[#E8EAF0] rounded-2xl p-6 sm:p-8 text-center shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <p className="text-xs sm:text-sm text-[#6B7080] mb-3 font-medium">{o.label}</p>
                <p style={{ fontSize: 'clamp(1.4rem, 2.6vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em' }} className="text-[#0158c6]">
                  {o.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">What&apos;s Included</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Premium Features
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-3 bg-white border border-[#E8EAF0] rounded-xl px-5 py-4">
                <div className="w-6 h-6 rounded-full bg-[#0158c6]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} className="text-[#0158c6]" strokeWidth={3} />
                </div>
                <p className="text-sm sm:text-base text-[#0D0F1A] font-medium">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Trading Advantages */}
      <section className="py-14 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Pro Advantages</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Professional Trading Advantages
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {advantages.map((a) => {
              const Icon = a.icon
              return (
                <div key={a.title} className="bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#0158c6]/10 flex items-center justify-center mb-5">
                    <Icon size={22} className="text-[#0158c6]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0D0F1A] mb-3">{a.title}</h3>
                  <p className="text-sm sm:text-base text-[#6B7080] leading-relaxed">{a.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose / Ideal For */}
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-4xl mx-auto text-center mb-10 md:mb-14">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Why Pro</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A] mb-6">
            Why Choose the Pro Account?
          </h2>
          <p className="text-base sm:text-lg text-[#6B7080] leading-relaxed">
            The Bull4x Pro Account is built for active traders, professional investors, money managers, and
            algorithmic traders who need superior trading conditions and premium support.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <h3 className="text-base sm:text-lg font-bold text-[#0D0F1A] mb-5 text-center">Ideal For</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {idealFor.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 bg-[#0158c6]/10 text-[#0D0F1A] border border-[#0158c6]/20 px-4 py-2 rounded-full text-sm font-medium"
              >
                <Check size={14} className="text-[#0158c6]" strokeWidth={3} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-14 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Compare</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Account Comparison
            </h2>
          </div>
          <div className="bg-white border border-[#E8EAF0] rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-[#E8EAF0] bg-[#FAFBFD]">
                  <th className="text-left py-4 px-6 text-[#0D0F1A] font-bold text-sm">Feature</th>
                  <th className="text-center py-4 px-4 text-[#6B7080] font-bold text-sm">Standard</th>
                  <th className="text-center py-4 px-4 text-[#0158c6] font-bold text-sm">Pro</th>
                  <th className="text-center py-4 px-4 text-[#6B7080] font-bold text-sm">Demo</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFD]/60'}>
                    <td className="py-4 px-6 text-[#6B7080] text-sm">{row.feature}</td>
                    <td className="py-4 px-4 text-center text-[#6B7080] text-sm">{row.standard}</td>
                    <td className="py-4 px-4 text-center text-[#0D0F1A] font-semibold text-sm">{row.pro}</td>
                    <td className="py-4 px-4 text-center text-[#6B7080] text-sm">{row.demo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-24 px-6 bg-[#0C0C1D]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-white mb-6">
            Elevate Your Trading
          </h2>
          <p className="text-base sm:text-lg text-[#9AA0B4] mb-8 leading-relaxed">
            Unlock premium trading conditions and gain access to advanced tools, exclusive benefits, and professional-grade
            execution. Join the elite trading environment with an Bull4x Pro Account.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] hover:-translate-y-0.5 transition-all"
            style={{ background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
          >
            Open Pro Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default ProAccount
