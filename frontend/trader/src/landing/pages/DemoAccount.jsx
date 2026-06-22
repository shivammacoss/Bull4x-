'use client'

import Link from 'next/link'
import { Check, Play, GraduationCap, BarChart3, RefreshCw, ArrowRight } from 'lucide-react'
import Navbar from '@/landing-new/components/Navbar'
import Footer from '@/landing-new/components/Footer'
import TopBanner from '@/landing-new/components/TopBanner'

const DemoAccount = () => {
  const overview = [
    { label: 'Virtual Funds', value: '$100,000' },
    { label: 'Cost',          value: 'Free' },
    { label: 'Duration',      value: 'Unlimited' },
    { label: 'Platforms',     value: 'All' },
  ]

  const features = [
    'Identical trading environment to live accounts',
    'Access to all platforms (Web Platform & Copy Trading)',
    'Real-time market pricing',
    'Test trading strategies risk-free',
    'Unlimited demo account resets',
    'No credit card required',
    'Practice with $100,000 virtual funds',
    'Learn platform features and tools',
    'Experience live market execution conditions',
    'Explore multiple asset classes',
  ]

  const benefits = [
    {
      icon: GraduationCap,
      title: 'Learn Risk-Free',
      desc: 'Practice trading strategies and improve your skills without risking real money. Build confidence before transitioning to a live account.',
    },
    {
      icon: BarChart3,
      title: 'Real Market Conditions',
      desc: 'Trade using live market prices and execution conditions that closely mirror the real trading environment.',
    },
    {
      icon: RefreshCw,
      title: 'Unlimited Resets',
      desc: 'Reset your demo account anytime and start fresh with a new virtual balance whenever needed.',
    },
  ]

  const steps = [
    { n: 1, title: 'Sign Up',           desc: 'Create your free Bull4x Demo Account in just a few minutes.' },
    { n: 2, title: 'Choose a Platform', desc: 'Select your preferred platform — Web Platform or Copy Trading — and begin exploring.' },
    { n: 3, title: 'Start Trading',     desc: 'Practice with $100,000 in virtual funds and gain hands-on experience in real market conditions.' },
  ]

  const perfectFor = [
    'New traders learning the markets',
    'Testing trading strategies',
    'Practicing risk management',
    'Exploring platform features',
    'Learning technical analysis',
    'Preparing for live trading',
  ]

  const tradable = ['Forex', 'Commodities', 'Indices', 'Cryptocurrencies']

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Navbar />
      {/* Hero */}
      <section className="pt-28 pb-14 md:pt-44 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#4dbe51]/10 text-[#4dbe51] px-4 py-2 rounded-full mb-6 font-semibold text-sm">
            <Play size={16} />
            Risk-Free Practice Account
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }} className="text-[#0D0F1A] mb-6">
            Practice Risk-Free with{' '}
            <span className="text-[#0158c6]">$100,000 Virtual Funds</span>
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed mb-8">
            Experience real market conditions without risking your capital. Test strategies, learn platform features,
            and build confidence using a fully functional demo trading account.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] hover:-translate-y-0.5 transition-all"
            style={{ background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
          >
            Open Demo Account Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Demo Account Overview */}
      <section className="py-14 md:py-20 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Conditions</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Demo Account Overview
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {overview.map((o) => (
              <div key={o.label} className="bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-8 text-center shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <p className="text-xs sm:text-sm text-[#6B7080] mb-3 font-medium">{o.label}</p>
                <p style={{ fontSize: 'clamp(1.4rem, 2.6vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em' }} className="text-[#0158c6]">
                  {o.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Account Features */}
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">What&apos;s Included</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Demo Account Features
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

      {/* Why Use a Demo Account */}
      <section className="py-14 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Why Demo</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Why Use a Demo Account?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.title} className="bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#0158c6]/10 flex items-center justify-center mb-5">
                    <Icon size={22} className="text-[#0158c6]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0D0F1A] mb-3">{b.title}</h3>
                  <p className="text-sm sm:text-base text-[#6B7080] leading-relaxed">{b.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How to Get Started */}
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-4xl mx-auto bg-white border border-[#E8EAF0] rounded-2xl p-8 sm:p-12 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">3 Easy Steps</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              How to Get Started
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-12 h-12 bg-[#0158c6]/10 text-[#0158c6] rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {s.n}
                </div>
                <h3 className="text-lg font-bold text-[#0D0F1A] mb-2">{s.title}</h3>
                <p className="text-sm text-[#6B7080] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
            >
              Open Demo Account <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits — Perfect For / What You Can Trade */}
      <section className="py-14 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Benefits</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Benefits of the Bull4x Demo Account
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              <h3 className="text-lg font-bold text-[#0D0F1A] mb-5">Perfect For</h3>
              <div className="space-y-3">
                {perfectFor.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#0158c6]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={14} className="text-[#0158c6]" strokeWidth={3} />
                    </div>
                    <span className="text-sm sm:text-base text-[#6B7080]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              <h3 className="text-lg font-bold text-[#0D0F1A] mb-5">What You Can Trade</h3>
              <div className="flex flex-wrap gap-3">
                {tradable.map((item) => (
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
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-24 px-6 bg-[#0C0C1D]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-white mb-6">
            Ready When You Are
          </h2>
          <p className="text-base sm:text-lg text-[#9AA0B4] mb-8 leading-relaxed">
            When you&apos;re comfortable with your trading skills and platform knowledge, upgrade to a live account
            and start trading global markets with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
            >
              Open Demo Account <ArrowRight size={16} />
            </Link>
            <Link
              href="/accounts/standard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-[#0199c6] text-[#0199c6] font-semibold text-sm hover:bg-[#0199c6] hover:text-white transition-all"
            >
              View Live Accounts
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default DemoAccount
