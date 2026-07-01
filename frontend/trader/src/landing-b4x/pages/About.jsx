'use client'

// BULL4X - About page (Bull4X landing design)
import React from 'react'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import { Link } from '../router-shim'
import { ArrowRight, Eye, Compass, Gem, ShieldCheck, Cpu, Globe } from 'lucide-react'
import AnimatedSection, { StaggerContainer, StaggerItem } from '../components/AnimatedSection'
import SectionHeader from '../components/SectionHeader'
import { stats } from './HomeData'

const pillars = [
  { icon: <Eye size={22} className="text-red-accent" />, title: 'Our Vision', desc: 'To become the most trusted multi-asset brokerage by empowering traders with technology, transparency and fair access to global markets.' },
  { icon: <Compass size={22} className="text-red-accent" />, title: 'Our Mission', desc: 'To deliver institutional-grade execution, deep liquidity and honest pricing to every trader — from beginner to professional.' },
  { icon: <Gem size={22} className="text-red-accent" />, title: 'Our Values', desc: 'Integrity, innovation and client-first thinking guide every decision we make and every product we build.' },
]

const reasons = [
  { icon: <ShieldCheck size={22} className="text-green-accent" />, title: 'Security First', desc: 'Segregated client funds, SSL encryption and strict KYC/AML compliance.' },
  { icon: <Cpu size={22} className="text-red-accent" />, title: 'Advanced Technology', desc: 'Low-latency infrastructure and professional charting on every platform.' },
  { icon: <Globe size={22} className="text-blue-400" />, title: 'Global Access', desc: '60+ instruments across forex, indices, commodities, stocks and crypto.' },
]

function Stat({ value, suffix, label, decimals }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 })
  return (
    <div ref={ref} className="text-center">
      <div className="stat-number">
        {inView ? <CountUp end={value} duration={2.5} decimals={decimals} suffix={suffix} /> : <span>0{suffix}</span>}
      </div>
      <p className="text-slate-400 text-xs uppercase tracking-wider font-mono mt-1">{label}</p>
    </div>
  )
}

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="relative section-padding overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-40 pointer-events-none" aria-hidden />
        <div className="section-container relative z-10 text-center">
          <SectionHeader
            badge="About Bull4X"
            title="Built on Precision & Trust"
            highlight="Trust"
            subtitle="Bull4X is a global multi-asset brokerage combining advanced technology, deep liquidity and transparent pricing to deliver a powerful trading experience worldwide."
          />
        </div>
      </section>

      {/* Stats band */}
      <section className="py-10 border-y border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <AnimatedSection key={s.label} animation="slideUp" delay={i * 0.1}>
                <Stat {...s} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding">
        <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <AnimatedSection animation="slideLeft">
            <SectionHeader align="left" badge="Our Story" title="Trading, Reimagined" highlight="Reimagined" />
            <div className="space-y-4 text-slate-400 text-sm leading-relaxed">
              <p>Bull4X was founded on a simple belief: traders deserve a broker that puts them first. No hidden fees, no conflicts of interest — just clean execution and a level playing field.</p>
              <p>We connect traders to deep liquidity sourced from premium financial institutions, paired with a technology stack engineered for speed, stability and precision.</p>
              <p>Today, traders across the globe rely on Bull4X for transparent pricing, professional tools and dependable support, 24 hours a day, 5 days a week.</p>
            </div>
          </AnimatedSection>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            {pillars.map((p) => (
              <StaggerItem key={p.title}>
                <div className="card h-full flex gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-accent/10 border border-red-accent/20">{p.icon}</div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1.5">{p.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Why choose */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-container">
          <SectionHeader badge="Why Bull4X" title="A Broker You Can Rely On" highlight="Rely On" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {reasons.map((r, i) => (
              <AnimatedSection key={r.title} animation="slideUp" delay={i * 0.08}>
                <div className="card h-full text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-white/5 border border-white/10">{r.icon}</div>
                  <h3 className="text-base font-bold text-white mb-1.5">{r.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{r.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="section-container">
          <AnimatedSection animation="scaleIn">
            <div className="card text-center py-14" style={{ background: 'linear-gradient(145deg, #1a232e 0%, #0d1117 100%)' }}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join the Bull4X Community</h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8">Experience trading the way it should be — transparent, fast and fair.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/auth/register" className="b4x-btn-primary gap-2">Open Account <ArrowRight size={16} /></Link>
                <Link to="/contact-us" className="b4x-btn-outline">Contact Us</Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
