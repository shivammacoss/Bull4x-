'use client'

import Link from 'next/link'
import {
  ArrowRight,
  DollarSign,
  Users,
  BarChart2,
  Megaphone,
  Trophy,
  Headphones,
  CheckCircle2,
} from 'lucide-react'
import TopBanner from '@/landing-new/components/TopBanner'
import Navbar from '@/landing-new/components/Navbar'
import Footer from '@/landing-new/components/Footer'

const BRAND_GRADIENT =
  'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)'

const benefits = [
  { icon: DollarSign, title: 'Competitive Commissions',     desc: "Earn attractive rebates based on your clients' trading activity. The more active traders you introduce, the greater your earning potential." },
  { icon: Users,      title: 'Multi-Level Referral Network', desc: 'Build and manage a referral structure that allows you to generate recurring revenue through multiple levels of client referrals.' },
  { icon: BarChart2,  title: 'Real-Time IB Dashboard',       desc: 'Monitor commissions, client activity, trading volumes, and payouts in real time through a dedicated partner portal.' },
  { icon: Megaphone,  title: 'Marketing Resources',          desc: 'Access professionally designed banners, landing pages, referral links, and promotional materials to help grow your business.' },
  { icon: Trophy,     title: 'Performance Bonuses',          desc: 'Unlock additional rewards and incentives as you reach higher trading volume milestones and referral targets.' },
  { icon: Headphones, title: 'Dedicated Account Manager',    desc: 'Receive personalized support and strategic guidance from a dedicated IB relationship manager focused on your growth.' },
]

const tiers = [
  {
    name: 'Silver Partner',
    volume: '0 – 100 Lots / Month',
    rate: '$5',
    perLot: 'per Lot',
    description: 'Ideal for new Introducing Brokers starting to build their client base.',
    accent: '#9ca3af',
    accentBg: 'rgba(156,163,175,0.12)',
    popular: false,
  },
  {
    name: 'Gold Partner',
    volume: '100 – 500 Lots / Month',
    rate: '$8',
    perLot: 'per Lot',
    description: 'Designed for growing partners with a consistent flow of active traders.',
    accent: '#0158c6',
    accentBg: 'rgba(1,88,198,0.10)',
    popular: true,
  },
  {
    name: 'Platinum Partner',
    volume: '500+ Lots / Month',
    rate: '$12',
    perLot: 'per Lot',
    description: 'Maximum commission rewards for high-volume partners and established networks.',
    accent: '#4dbe51',
    accentBg: 'rgba(77,190,81,0.12)',
    popular: false,
  },
]

const steps = [
  { num: '01', title: 'Apply',                  desc: 'Complete the Bull4x Introducing Broker application form with your business details.' },
  { num: '02', title: 'Get Approved',           desc: 'Our partnership team reviews and approves qualified applications.' },
  { num: '03', title: 'Share Your Referral Link', desc: 'Receive a unique referral link and start inviting traders to join Bull4x.' },
  { num: '04', title: 'Earn Commissions',       desc: 'Earn recurring commissions based on the trading activity of your referred clients.' },
]

const portalFeatures = [
  'Real-time commission tracking',
  'Client activity monitoring',
  'Sub-IB management system',
  'Automated payout management',
  'Custom referral links',
  'Advanced reporting & analytics',
  'Marketing resource library',
  'Dedicated priority support',
  'Multi-level commission tracking',
  'Business growth insights',
]

export default function IBManagement() {
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
              IB Management
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
              IB Management{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Program
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#6B7080] mb-8 leading-relaxed max-w-xl">
              Partner with Bull4x and build a successful Introducing Broker business while
              earning competitive commissions. Expand your client network, increase revenue, and
              grow with dedicated support from our experienced team.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] transition-all"
                style={{ background: BRAND_GRADIENT }}
              >
                Become an IB <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 border-[#4dbe51] text-[#4dbe51] font-semibold text-sm hover:bg-[#4dbe51] hover:text-white transition-all"
              >
                Learn More
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
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80"
                alt="IB Partner Network"
                className="w-full h-auto block aspect-[4/3] object-cover"
                loading="lazy"
              />
              <div className="px-5 py-4 border-t border-[#E8EAF0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-[#0D0F1A]">Live partner dashboard</span>
                </div>
                <span className="text-xs text-[#6B7080]">Updated in real-time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY PARTNER ────────────────────────────────────────────────────── */}
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
              Why Partner With <span style={{ color: '#0158c6' }}>Bull4x?</span>
            </h2>
            <p className="text-base text-[#6B7080] max-w-2xl mx-auto">
              Everything you need to build and scale a successful Introducing Broker business.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <div
                  key={b.title}
                  className="bg-white border border-[#E8EAF0] rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] hover:shadow-[0_8px_30px_rgba(1,88,198,0.1)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(1,88,198,0.08)', color: '#0158c6' }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-[#0D0F1A] font-manrope mb-2">{b.title}</h3>
                  <p className="text-sm text-[#6B7080] leading-relaxed">{b.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── COMMISSION STRUCTURE ───────────────────────────────────────────── */}
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
              Commission <span style={{ color: '#0158c6' }}>Structure</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`relative bg-white border rounded-2xl p-7 transition-all duration-300 ${
                  t.popular
                    ? 'border-[#0158c6] shadow-[0_12px_40px_rgba(1,88,198,0.15)] sm:scale-[1.02]'
                    : 'border-[#E8EAF0] shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] hover:shadow-[0_8px_30px_rgba(1,88,198,0.1)]'
                }`}
              >
                {t.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    Most Popular
                  </div>
                )}
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-5"
                  style={{ background: t.accentBg, color: t.accent }}
                >
                  {t.name}
                </div>
                <p className="text-sm text-[#6B7080] mb-4">{t.volume}</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span
                    className="font-manrope tabular-nums"
                    style={{
                      fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                      color: t.accent,
                    }}
                  >
                    {t.rate}
                  </span>
                  <span className="text-sm font-semibold text-[#6B7080]">{t.perLot}</span>
                </div>
                <p className="text-sm text-[#6B7080] leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO GET STARTED ─────────────────────────────────────────────── */}
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
              How to <span style={{ color: '#0158c6' }}>Get Started</span>
            </h2>
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

      {/* ── IB PORTAL FEATURES ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#0158c6' }}>
              Inside the portal
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
              IB Portal <span style={{ color: '#0158c6' }}>Features</span>
            </h2>
            <p className="text-base text-[#6B7080] mb-6 leading-relaxed">
              Everything you need to track, manage, and grow your IB business — built into one
              transparent partner portal.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
              {portalFeatures.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[#0D0F1A]">
                  <CheckCircle2 size={18} className="text-[#4dbe51] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-3xl opacity-25 blur-2xl"
              style={{ background: BRAND_GRADIENT }}
            />
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(13,15,26,0.14)] border border-[#E8EAF0] bg-white">
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80"
                alt="IB Portal dashboard"
                className="w-full h-auto block aspect-[5/4] object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── UNLIMITED EARNING POTENTIAL CTA ─────────────────────────────────── */}
      <section className="py-16 md:py-20 px-6 bg-[#FAFBFD]">
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
              Unlimited Earning Potential
            </h2>
            <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto mb-3">
              There are no limits to your growth. The more active traders you introduce, the more
              commissions you can earn month after month.
            </p>
            <p className="text-white/85 text-sm sm:text-base max-w-2xl mx-auto mb-8">
              Build a sustainable brokerage referral business with transparent reporting, reliable
              payouts, and professional support.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#0158c6] font-semibold text-sm hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.15)] transition-all"
            >
              Apply Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
