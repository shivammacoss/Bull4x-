'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Globe2,
  BarChart3,
  MousePointerClick,
  Bell,
  CheckCircle2,
  Smartphone,
  Monitor,
  Tablet,
  Lock,
  X,
} from 'lucide-react'
import TopBanner from '@/landing-new/components/TopBanner'
import Navbar from '@/landing-new/components/Navbar'
import Footer from '@/landing-new/components/Footer'

/* ── Live chart modal — TradingView advanced chart in a popup ─────────────── */
function LiveChartModal({ open, onClose }) {
  const containerRef = useRef(null)

  // Mount TradingView widget when modal opens; tear down on close
  useEffect(() => {
    if (!open || !containerRef.current) return

    // Reset container before injecting fresh script (keeps re-opens clean)
    containerRef.current.innerHTML = ''
    const inner = document.createElement('div')
    inner.id = 'tradingview-live-chart-target'
    inner.style.width = '100%'
    inner.style.height = '100%'
    containerRef.current.appendChild(inner)

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.type = 'text/javascript'
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: 'FX:EURUSD',
      interval: '15',
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      details: true,
      hotlist: false,
      withdateranges: true,
      hide_side_toolbar: false,
      studies: [],
      container_id: 'tradingview-live-chart-target',
    })
    containerRef.current.appendChild(script)

    // Esc-to-close + lock body scroll while open
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Live Markets chart"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-[#E8EAF0]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm sm:text-base font-bold text-[#0D0F1A]">
              Live Markets <span className="text-[#6B7080] font-medium">— EUR/USD</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close live chart"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#0D0F1A] hover:bg-[#F0F2F8] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chart container — fills the modal */}
        <div ref={containerRef} className="w-full h-[68vh] sm:h-[600px] bg-white" />

        {/* Footer hint */}
        <div className="px-5 sm:px-6 py-3 border-t border-[#E8EAF0] flex items-center justify-between bg-[#FAFBFD]">
          <p className="text-[11px] sm:text-xs text-[#6B7080]">
            Chart by TradingView · symbol can be changed inside the chart
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#0158c6] hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

const BRAND_GRADIENT =
  'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)'

const features = [
  {
    icon: Globe2,
    title: 'Browser-Based Trading',
    desc: 'Access your trading account instantly from any browser without installing software.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Chart Integration',
    desc: 'Powerful charting tools with 100+ indicators, drawing tools, and market analysis features.',
  },
  {
    icon: MousePointerClick,
    title: 'One-Click Execution',
    desc: 'Execute trades instantly with lightning-fast order processing and seamless execution.',
  },
  {
    icon: Bell,
    title: 'Real-Time Alerts',
    desc: 'Stay informed with instant notifications and customizable market alerts.',
  },
]

const platformChecklist = [
  'Advanced chart integration',
  'One-click trade execution',
  'Real-time market updates',
  'Portfolio & margin monitoring',
  'Mobile-responsive interface',
  'Multiple order types',
  'Watchlist management',
  'Trading history & analytics',
  'Multi-language support',
  'Secure SSL encryption',
]

export default function WebPlatform() {
  const [liveChartOpen, setLiveChartOpen] = useState(false)

  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-14 md:pt-44 md:pb-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div>
            <p
              className="text-xs sm:text-sm font-semibold uppercase tracking-widest mb-4 inline-flex items-center gap-2"
              style={{ color: '#0158c6' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0158c6]" />
              Web Platform
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
              Bull4x Web Platform —{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Trade Instantly, Anywhere
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#6B7080] mb-8 leading-relaxed max-w-xl">
              No downloads required. Access the Bull4x Web Platform directly from your browser and
              start trading in seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] transition-all"
                style={{ background: BRAND_GRADIENT }}
              >
                Launch Platform <ArrowRight size={16} />
              </Link>
              <Link
                href="/accounts/demo"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 border-[#4dbe51] text-[#4dbe51] font-semibold text-sm hover:bg-[#4dbe51] hover:text-white transition-all"
              >
                Try Demo Account
              </Link>
            </div>
          </div>

          {/* Right: aesthetic image card */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl"
              style={{ background: BRAND_GRADIENT }}
            />
            <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(1,88,198,0.18)] border border-[#E8EAF0] bg-white">
              <img
                src="https://images.unsplash.com/photo-1642790551116-18e150f248e3?auto=format&fit=crop&w=900&q=80"
                alt="Bull4x Web Platform"
                className="w-full h-auto block aspect-[4/3] object-cover"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => setLiveChartOpen(true)}
                aria-label="Open live markets chart"
                className="w-full px-5 py-4 border-t border-[#E8EAF0] flex items-center justify-between text-left hover:bg-[#FAFBFD] transition-colors group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-[#0D0F1A] group-hover:text-[#0158c6] transition-colors">
                    Live Markets
                  </span>
                </span>
                <span className="text-xs text-[#6B7080] group-hover:text-[#0158c6] transition-colors inline-flex items-center gap-1">
                  Open chart
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#FAFBFD]">
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
              Everything You Need in{' '}
              <span style={{ color: '#0158c6' }}>One Platform</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* ── PROFESSIONAL TRADING, SIMPLIFIED ───────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-3xl opacity-25 blur-2xl"
              style={{ background: BRAND_GRADIENT }}
            />
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(13,15,26,0.14)] border border-[#E8EAF0] bg-white">
              <img
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80"
                alt="Professional trading platform"
                className="w-full h-auto block aspect-[5/4] object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#0158c6' }}>
              Built for every trader
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
              Professional Trading,{' '}
              <span style={{ color: '#0158c6' }}>Simplified</span>
            </h2>
            <p className="text-base text-[#6B7080] mb-7 leading-relaxed">
              Our web-based trading platform combines powerful technology with an intuitive
              interface. Whether you&apos;re a beginner or an experienced trader, Bull4x gives you
              the tools to trade confidently.
            </p>

            <p className="text-xs font-bold uppercase tracking-widest text-[#0D0F1A] mb-4">
              Platform Features
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
              {platformChecklist.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[#0D0F1A]">
                  <CheckCircle2 size={18} className="text-[#4dbe51] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── ACCESS ANYWHERE ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#0158c6' }}>
              Cross-Device Trading
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
              Access{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Anywhere
              </span>
            </h2>
            <p className="text-base text-[#6B7080] mb-7 leading-relaxed">
              Trade seamlessly from your desktop, laptop, tablet, or smartphone. Your trading
              environment stays synchronized across all devices, ensuring uninterrupted access to
              the markets wherever you are.
            </p>

            <div className="flex flex-wrap gap-3 mb-7">
              {[
                { Icon: Monitor, label: 'Desktop' },
                { Icon: Tablet, label: 'Tablet' },
                { Icon: Smartphone, label: 'Mobile' },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E8EAF0] text-sm font-semibold text-[#0D0F1A]"
                >
                  <Icon size={16} className="text-[#0158c6]" />
                  {label}
                </div>
              ))}
            </div>

            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 transition-all"
              style={{ background: BRAND_GRADIENT }}
            >
              Launch Web Platform <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-3xl opacity-25 blur-2xl"
              style={{ background: BRAND_GRADIENT }}
            />
            <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(1,88,198,0.18)] border border-[#E8EAF0] bg-white">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80"
                alt="Trade across devices"
                className="w-full h-auto block aspect-[5/4] object-cover"
                loading="lazy"
              />
              <div className="px-5 py-4 border-t border-[#E8EAF0] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0D0F1A]">Synced across devices</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0158c6]">
                  <Lock size={12} /> End-to-end secured
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────────────────── */}
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
            <h2
              className="text-white font-manrope mb-4"
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Start Trading in Seconds
            </h2>
            <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              No downloads. No installations. Simply open your browser, log in, and begin trading.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#0158c6] font-semibold text-sm hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.15)] transition-all"
            >
              Open Account Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── Live Markets popup ─────────────────────────────────────────────── */}
      <LiveChartModal open={liveChartOpen} onClose={() => setLiveChartOpen(false)} />
    </div>
  )
}
