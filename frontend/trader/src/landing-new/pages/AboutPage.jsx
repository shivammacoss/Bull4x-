'use client'

import Link from 'next/link';
import { ArrowRight, Check, Target, Eye, Users, Globe, ShieldCheck, Scale, Sparkles, Award, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';

const stats = [
  { value: '10+ Years', label: 'Industry Experience' },
  { value: '250,000+', label: 'Registered Traders' },
  { value: '120+',      label: 'Countries Served' },
  { value: '$1.5B+',    label: 'Monthly Trading Volume' },
];

const whyChoose = [
  {
    icon: Users,
    title: 'Client-First Approach',
    desc: 'Your success is our priority. We focus on delivering exceptional service, transparent pricing, and a seamless trading experience tailored to your needs.',
  },
  {
    icon: Globe,
    title: 'Global Presence',
    desc: 'Serving traders across more than 120 countries with multilingual support, localized services, and globally accessible trading solutions.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted & Secure',
    desc: 'Built on a foundation of security, reliability, and operational excellence to ensure a safe and professional trading environment.',
  },
];

const coreValues = [
  { icon: Scale,    title: 'Transparency', desc: 'Clear pricing, honest communication, and a commitment to fairness in every interaction.' },
  { icon: Sparkles, title: 'Innovation',   desc: 'Continuous investment in technology and platform development to improve the trading experience.' },
  { icon: Heart,    title: 'Integrity',    desc: 'Operating with professionalism, accountability, and ethical business practices.' },
  { icon: Award,    title: 'Excellence',   desc: 'Striving for outstanding service, superior technology, and long-term client satisfaction.' },
];

const leadership = [
  { initials: 'DA', name: 'David Anderson',  role: 'Chief Executive Officer (CEO)', bio: "Leading the company's strategic vision, growth initiatives, and global expansion." },
  { initials: 'SM', name: 'Sophia Martinez', role: 'Chief Technology Officer (CTO)', bio: 'Overseeing platform innovation, infrastructure, and technology development.' },
  { initials: 'JW', name: 'James Wilson',    role: 'Chief Financial Officer (CFO)',  bio: 'Managing financial operations, risk management, and corporate strategy.' },
  { initials: 'OB', name: 'Olivia Bennett',  role: 'Head of Trading Operations',     bio: 'Responsible for liquidity management, execution quality, and trading operations.' },
];

const whyTradeChecks = [
  'Competitive trading conditions',
  'Advanced trading technology',
  'Multi-asset market access',
  'Fast and reliable execution',
  'Secure client environment',
  'Professional customer support',
  'Educational resources for all levels',
  'Innovative trading solutions',
  'Transparent pricing structure',
  'Global market expertise',
];

export default function AboutPage() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-14 md:pt-44 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">About Us</p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }} className="text-[#0D0F1A] mb-6">
            Who We Are — <span className="text-[#0158c6]">Bull4x</span>
          </h1>
          <p className="text-base sm:text-lg text-[#0D0F1A] max-w-2xl mx-auto leading-relaxed mb-4 font-medium">
            A global multi-asset trading platform committed to transparency, innovation, security, and client success.
          </p>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed">
            Empowering traders worldwide with advanced technology, competitive trading conditions, and exceptional customer support.
          </p>
        </div>
      </section>

      {/* About */}
      <section className="py-14 md:py-20 px-6 bg-[#FAFBFD]">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Our Story</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A] mb-8">
            About <span className="text-[#0158c6]">Bull4x</span>
          </h2>
          <div className="space-y-5 text-base sm:text-lg text-[#6B7080] leading-relaxed">
            <p>
              Founded with a vision to make global financial markets accessible to everyone, Bull4x has grown
              into a trusted trading platform serving clients across multiple regions worldwide.
            </p>
            <p>
              We provide traders with access to a wide range of financial instruments, innovative trading technology,
              educational resources, and professional support. Whether you&apos;re taking your first step into trading
              or managing a sophisticated portfolio, Bull4x delivers the tools and environment needed to succeed.
            </p>
            <p>
              Our commitment to transparency, innovation, and client satisfaction drives everything we do.
            </p>
          </div>
        </div>
      </section>

      {/* At a Glance */}
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">By the Numbers</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Bull4x at a Glance
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-8 text-center shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <p style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.02em' }} className="text-[#0158c6] mb-2">
                  {s.value}
                </p>
                <p className="text-sm sm:text-base text-[#6B7080] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-14 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Purpose</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Our Mission &amp; Vision
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              <div className="w-12 h-12 rounded-xl bg-[#0158c6]/10 flex items-center justify-center mb-5">
                <Target size={22} className="text-[#0158c6]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0D0F1A] mb-4">Our Mission</h3>
              <p className="text-sm sm:text-base text-[#6B7080] leading-relaxed">
                To empower traders worldwide through transparent, reliable, and innovative trading solutions that
                help individuals and businesses achieve their financial goals with confidence.
              </p>
            </div>
            <div className="bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              <div className="w-12 h-12 rounded-xl bg-[#0158c6]/10 flex items-center justify-center mb-5">
                <Eye size={22} className="text-[#0158c6]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0D0F1A] mb-4">Our Vision</h3>
              <p className="text-sm sm:text-base text-[#6B7080] leading-relaxed">
                To become a leading global trading platform by setting new standards in technology, client
                experience, education, and market accessibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Traders Choose Us */}
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Why Us</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Why Traders Choose <span className="text-[#0158c6]">Bull4x</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyChoose.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className="bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#0158c6]/10 flex items-center justify-center mb-5">
                    <Icon size={22} className="text-[#0158c6]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0D0F1A] mb-3">{r.title}</h3>
                  <p className="text-sm sm:text-base text-[#6B7080] leading-relaxed">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-14 md:py-24 px-6 bg-[#0C0C1D]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <p className="text-sm font-semibold text-[#0199c6] uppercase tracking-widest mb-4">What We Stand For</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-white">
              Core Values
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {coreValues.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-[#141428] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 sm:p-7">
                  <div className="w-11 h-11 rounded-xl bg-[#0158c6]/20 flex items-center justify-center mb-5">
                    <Icon size={20} className="text-[#0199c6]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{v.title}</h3>
                  <p className="text-sm text-[#9AA0B4] leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-14 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Our Leadership</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Leadership Team
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {leadership.map((t) => (
              <div key={t.name} className="bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-8 flex gap-5 items-start">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#0158c6] flex items-center justify-center text-white font-bold text-2xl shrink-0">
                  {t.initials}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0D0F1A] mb-1">{t.name}</h3>
                  <p className="text-sm text-[#0158c6] font-medium mb-3">{t.role}</p>
                  <p className="text-sm text-[#6B7080] leading-relaxed">{t.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trade with Bull4x (checklist) */}
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Trading Advantages</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Why Trade with <span className="text-[#0158c6]">Bull4x</span>?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {whyTradeChecks.map((item) => (
              <div key={item} className="flex items-start gap-3 bg-white border border-[#E8EAF0] rounded-xl px-5 py-4">
                <div className="w-6 h-6 rounded-full bg-[#0158c6]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} className="text-[#0158c6]" strokeWidth={3} />
                </div>
                <p className="text-sm sm:text-base text-[#0D0F1A] font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-24 px-6 bg-[#0C0C1D]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-white mb-6">
            Join the <span className="text-[#0199c6]">Bull4x</span> Community
          </h2>
          <p className="text-base sm:text-lg text-[#9AA0B4] mb-4 leading-relaxed">
            Experience a trading environment built around performance, reliability, and trader success.
          </p>
          <p className="text-base sm:text-lg text-[#9AA0B4] mb-8 leading-relaxed">
            Whether you&apos;re a beginner exploring the markets or an experienced professional seeking advanced
            trading solutions, Bull4x is ready to support your journey.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] hover:-translate-y-0.5 transition-all"
            style={{ background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
          >
            Open Account Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
