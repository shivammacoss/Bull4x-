'use client'

// BULL4X - Platforms page (Bull4X landing design)
import React from 'react'
import { Link } from '../router-shim'
import { ArrowRight, Check, Layers, Gauge, Bell, LineChart, Lock, Smartphone } from 'lucide-react'
import AnimatedSection, { StaggerContainer, StaggerItem } from '../components/AnimatedSection'
import SectionHeader from '../components/SectionHeader'
import { platforms, platformFeatures } from './HomeData'

const highlights = [
  { icon: <Gauge size={22} className="text-red-accent" />, title: 'Lightning Execution', desc: 'Sub-30ms order execution with zero requotes across all platforms.' },
  { icon: <LineChart size={22} className="text-red-accent" />, title: 'Advanced Charting', desc: '100+ indicators, multi-chart layouts and integrated TradingView tools.' },
  { icon: <Bell size={22} className="text-red-accent" />, title: 'Real-Time Alerts', desc: 'Custom price alerts and push notifications so you never miss a move.' },
  { icon: <Lock size={22} className="text-red-accent" />, title: 'Secure & Reliable', desc: 'Bank-grade encryption with 99.9% platform uptime, 24/5.' },
]

export default function Platforms() {
  return (
    <>
      {/* Hero */}
      <section className="relative section-padding overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-40 pointer-events-none" aria-hidden />
        <div className="section-container relative z-10 text-center">
          <SectionHeader
            badge="Trading Platforms"
            title="Trade on Any Platform"
            highlight="Any Platform"
            subtitle="Web, mobile or desktop — Bull4X delivers a seamless, professional trading experience everywhere you go."
          />
          <AnimatedSection animation="slideUp" delay={0.35}>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link to="/auth/register" className="b4x-btn-primary gap-2">Get Started <ArrowRight size={16} /></Link>
              <Link to="/auth/register" className="b4x-btn-outline gap-2"><Smartphone size={15} /> Try the App</Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Platform cards */}
      <section className="section-padding">
        <div className="section-container">
          <SectionHeader badge="Choose Your Platform" title="Built for Every Trader" highlight="Every Trader" />
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {platforms.map((p) => (
              <StaggerItem key={p.name}>
                <div className={`card h-full border ${p.border}`}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${p.bg}`}>
                    <span className={p.color}>{p.icon}</span>
                  </div>
                  <span className="badge bg-white/5 text-slate-300 mb-3">{p.tag}</span>
                  <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Feature list */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-container">
          <SectionHeader badge="Platform Features" title="Everything You Need" highlight="Everything" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12 max-w-4xl mx-auto">
            {platformFeatures.map((f, i) => (
              <AnimatedSection key={f} animation="slideUp" delay={i * 0.06}>
                <div className="flex items-center gap-3 card">
                  <Check size={18} className="text-green-accent flex-shrink-0" />
                  <span className="text-slate-200 text-sm">{f}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="section-padding">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h, i) => (
              <AnimatedSection key={h.title} animation="slideUp" delay={i * 0.08}>
                <div className="card h-full text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-red-accent/10 border border-red-accent/20">
                    {h.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">{h.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{h.desc}</p>
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
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start Trading Today</h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8">Pick your platform and open an account in minutes.</p>
              <Link to="/auth/register" className="b4x-btn-primary gap-2 inline-flex">Open Account <ArrowRight size={16} /></Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
