'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Users,
  Copy,
  ShieldCheck,
  BarChart2,
  Settings,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'
import TopBanner from '@/landing-new/components/TopBanner'
import Navbar from '@/landing-new/components/Navbar'
import Footer from '@/landing-new/components/Footer'

const BRAND_GRADIENT =
  'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)'

const steps = [
  { num: '01', title: 'Open an Account',  desc: 'Create and verify your Bull4x trading account to access the copy trading platform.' },
  { num: '02', title: 'Browse Traders',   desc: 'Explore top-performing traders and filter them based on performance, risk level, trading style, and consistency.' },
  { num: '03', title: 'Allocate & Copy',  desc: 'Choose your investment amount and start automatically copying trades from your selected strategy provider.' },
  { num: '04', title: 'Monitor & Adjust', desc: 'Track your copied trades in real time. Pause, adjust allocations, switch providers, or stop copying whenever you choose.' },
]

const features = [
  { icon: Users,      title: 'Follow Top Traders',           desc: 'Discover verified traders ranked by performance, consistency, and risk metrics. Access transparent trading statistics before making decisions.' },
  { icon: Copy,       title: 'Auto-Copy Trades',             desc: 'Automatically mirror trades from selected strategy providers. Positions are opened and closed instantly within your account.' },
  { icon: ShieldCheck,title: 'Advanced Risk Controls',       desc: 'Manage risk with customizable limits, stop-loss settings, allocation controls, and portfolio protection tools.' },
  { icon: BarChart2,  title: 'Performance Analytics',        desc: 'Analyze detailed trading statistics including win rate, profit factor, average return, risk-reward ratio, and historical performance.' },
  { icon: Settings,   title: 'Flexible Capital Allocation',  desc: 'Decide how much capital to allocate to each trader and adjust your investments anytime without disrupting active strategies.' },
  { icon: TrendingUp, title: 'Become a Strategy Provider',   desc: 'Share your trading expertise, build a following, and earn performance-based commissions when other traders copy your strategies.' },
]

const whyChecklist = [
  'No hidden copy trading fees',
  'Transparent trader performance data',
  'Full control over risk management',
  'Real-time trade replication',
  'Compatible with all account types',
  'Withdraw funds anytime with no lock-in periods',
  'Diverse range of trading strategies',
  'Professional risk monitoring tools',
  'Instant allocation adjustments',
  'Secure and transparent trading environment',
]

export default function CopyTrading() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-14 md:pt-44 md:pb-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p
              className="text-xs sm:text-sm font-semibold uppercase tracking-widest mb-4 inline-flex items-center gap-2"
              style={{ color: '#0158c6' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0158c6]" />
              Copy Trading
            </p>
            <h1
              className="text-[#0D0F1A] mb-5 font-manrope"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
              }}
            >
              Copy{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Top Traders
              </span>{' '}
              Automatically
            </h1>
            <p className="text-base sm:text-lg text-[#6B7080] mb-8 leading-relaxed max-w-xl">
              Follow experienced traders and automatically replicate their strategies in real time.
              No trading expertise required — let professional traders do the work while you stay
              in control.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] transition-all"
                style={{ background: BRAND_GRADIENT }}
              >
                Start Copy Trading <ArrowRight size={16} />
              </Link>
              <Link
                href="/accounts/demo"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 border-[#4dbe51] text-[#4dbe51] font-semibold text-sm hover:bg-[#4dbe51] hover:text-white transition-all"
              >
                Try Demo Account
              </Link>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl"
              style={{ background: BRAND_GRADIENT }}
            />
            <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(1,88,198,0.18)] border border-[#E8EAF0] bg-white">
              <img
                src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=80"
                alt="Copy Trading Network"
                className="w-full h-auto block aspect-[4/3] object-cover"
                loading="lazy"
              />
              <div className="px-5 py-4 border-t border-[#E8EAF0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-[#0D0F1A]">10,000+ Strategy Providers</span>
                </div>
                <span className="text-xs text-[#6B7080]">Live network</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-[#0D0F1A] font-manrope mb-3"
              style={{
                fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              How It <span style={{ color: '#0158c6' }}>Works</span>
            </h2>
            <p className="text-base text-[#6B7080]">Get started in four simple steps.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div
                key={s.num}
                className="bg-white border border-[#E8EAF0] rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] hover:shadow-[0_8px_30px_rgba(1,88,198,0.1)] hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className="text-3xl font-extrabold mb-3 font-manrope"
                  style={{
                    background: BRAND_GRADIENT,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                  }}
                >
                  {s.num}
                </div>
                <h3 className="text-base font-bold text-[#0D0F1A] font-manrope mb-2">{s.title}</h3>
                <p className="text-sm text-[#6B7080] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-[#0D0F1A] font-manrope"
              style={{
                fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Copy Trading <span style={{ color: '#0158c6' }}>Features</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="bg-white border border-[#E8EAF0] rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] hover:shadow-[0_8px_30px_rgba(1,88,198,0.1)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(1,88,198,0.08)', color: '#0158c6' }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-[#0D0F1A] font-manrope mb-2">{f.title}</h3>
                  <p className="text-sm text-[#6B7080] leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── WHY COPY TRADE — 2 col with image ──────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-3xl opacity-25 blur-2xl"
              style={{ background: BRAND_GRADIENT }}
            />
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(13,15,26,0.14)] border border-[#E8EAF0] bg-white">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80"
                alt="Strategy provider analytics"
                className="w-full h-auto block aspect-[5/4] object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#0158c6' }}>
              Built for transparency
            </p>
            <h2
              className="text-[#0D0F1A] mb-5 font-manrope"
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              Why Copy Trade with{' '}
              <span style={{ color: '#0158c6' }}>Bull4x?</span>
            </h2>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
              {whyChecklist.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[#0D0F1A]">
                  <CheckCircle2 size={18} className="text-[#4dbe51] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 10,000+ Strategy Providers CTA ─────────────────────────────────── */}
      <section className="py-16 md:py-20 px-6 bg-white">
        <div
          className="max-w-5xl mx-auto rounded-3xl px-8 py-12 sm:px-12 sm:py-16 text-center relative overflow-hidden"
          style={{ background: BRAND_GRADIENT }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)',
            }}
          />
          <div className="relative">
            <div className="text-5xl sm:text-6xl font-extrabold text-white mb-3 font-manrope tabular-nums">
              10,000+
            </div>
            <h2
              className="text-white font-manrope mb-4"
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              Strategy Providers
            </h2>
            <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Access a global network of experienced traders and strategy providers across Forex,
              Indices, Commodities, Cryptocurrencies, and more.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#0158c6] font-semibold text-sm hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.15)] transition-all"
            >
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
