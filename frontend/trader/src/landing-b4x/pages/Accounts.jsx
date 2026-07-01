'use client'

// BULL4X - Account Types page (Bull4X landing design)
import React from 'react'
import { Link } from '../router-shim'
import { ArrowRight, Check, UserPlus, ShieldCheck, Wallet, Rocket } from 'lucide-react'
import AnimatedSection, { StaggerContainer, StaggerItem } from '../components/AnimatedSection'
import SectionHeader from '../components/SectionHeader'
import { accounts } from './HomeData'

const steps = [
  { icon: <UserPlus size={22} className="text-red-accent" />, title: 'Register', desc: 'Create your account in under 2 minutes with your email.' },
  { icon: <ShieldCheck size={22} className="text-red-accent" />, title: 'Verify', desc: 'Complete a quick KYC to secure and activate your account.' },
  { icon: <Wallet size={22} className="text-red-accent" />, title: 'Fund', desc: 'Deposit via card, bank wire or crypto — instantly.' },
  { icon: <Rocket size={22} className="text-red-accent" />, title: 'Trade', desc: 'Access 60+ markets and start trading right away.' },
]

export default function Accounts() {
  return (
    <>
      {/* Hero */}
      <section className="relative section-padding overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-40 pointer-events-none" aria-hidden />
        <div className="section-container relative z-10 text-center">
          <SectionHeader
            badge="Account Types"
            title="Find Your Perfect Account"
            highlight="Perfect Account"
            subtitle="From first-time traders to institutional volumes — choose the Bull4X account that matches your strategy."
          />
          <AnimatedSection animation="slideUp" delay={0.35}>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link to="/auth/register" className="b4x-btn-primary gap-2">Open Account <ArrowRight size={16} /></Link>
              <Link to="/auth/register" className="b4x-btn-outline gap-2">Try Free Demo</Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Account cards */}
      <section className="section-padding">
        <div className="section-container">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {accounts.map((acc) => (
              <StaggerItem key={acc.name}>
                <div
                  className={`card h-full flex flex-col relative ${acc.highlight ? 'border-red-accent/40' : ''}`}
                  style={acc.highlight ? { boxShadow: '0 0 24px rgba(217,161,54,0.15)' } : undefined}
                >
                  {acc.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge bg-red-accent text-black font-bold">Most Popular</span>
                  )}
                  <span className={`badge ${acc.badgeColor} mb-3 w-fit`}>{acc.badge}</span>
                  <h3 className="text-2xl font-bold text-white mb-1">{acc.name}</h3>
                  <div className="text-slate-400 text-xs uppercase tracking-wider font-mono mb-4">Min. Deposit</div>
                  <div className="text-3xl font-bold text-red-gradient mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>{acc.minDeposit}</div>

                  <div className="space-y-2 mb-5 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Spreads</span><span className="text-white font-medium">{acc.spreads}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Commission</span><span className="text-white font-medium">{acc.commission}</span></div>
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {acc.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                        <Check size={15} className="text-green-accent flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/auth/register"
                    className={`${acc.highlight ? 'b4x-btn-primary' : 'b4x-btn-outline'} w-full justify-center gap-2`}
                  >
                    {acc.cta} <ArrowRight size={15} />
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How to open */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-container">
          <SectionHeader badge="Getting Started" title="Open an Account in 4 Steps" highlight="4 Steps" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {steps.map((s, i) => (
              <AnimatedSection key={s.title} animation="slideUp" delay={i * 0.08}>
                <div className="card h-full text-center relative">
                  <div className="absolute top-4 right-4 text-4xl font-bold text-white/5">{i + 1}</div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-red-accent/10 border border-red-accent/20">
                    {s.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
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
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Open Your Bull4X Account</h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8">Join thousands of traders worldwide. It only takes a few minutes.</p>
              <Link to="/auth/register" className="b4x-btn-primary gap-2 inline-flex">Get Started <ArrowRight size={16} /></Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
