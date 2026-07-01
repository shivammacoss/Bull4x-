'use client'

// BULL4X - Trading / Markets page (Bull4X landing design)
import React from 'react'
import { Link } from '../router-shim'
import { ArrowRight, ChevronRight } from 'lucide-react'
import AnimatedSection, { StaggerContainer, StaggerItem } from '../components/AnimatedSection'
import SectionHeader from '../components/SectionHeader'
import { marketAssets, tradingConditions } from './HomeData'

export default function Trading() {
  return (
    <>
      {/* Hero */}
      <section className="relative section-padding overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-40 pointer-events-none" aria-hidden />
        <div className="section-container relative z-10 text-center">
          <SectionHeader
            badge="Global Markets"
            title="Trade the World's Markets"
            highlight="Markets"
            subtitle="Access 60+ instruments across forex, indices, commodities, stocks and crypto — all from a single Bull4X account with institutional-grade execution."
          />
          <AnimatedSection animation="slideUp" delay={0.35}>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link to="/auth/register" className="b4x-btn-primary gap-2">
                Open Live Account <ArrowRight size={16} />
              </Link>
              <Link to="/auth/register" className="b4x-btn-outline gap-2">
                Try Free Demo
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Asset classes */}
      <section className="section-padding">
        <div className="section-container">
          <SectionHeader
            badge="Asset Classes"
            title="Diversify Across Markets"
            highlight="Markets"
            subtitle="One platform, multiple opportunities. Explore every asset class Bull4X has to offer."
          />
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {marketAssets.map((asset) => (
              <StaggerItem key={asset.label}>
                <div className="card h-full group">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-red-accent/10 border border-red-accent/20">
                    {asset.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{asset.label}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{asset.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Trading conditions */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-container">
          <SectionHeader
            badge="Why Trade With Us"
            title="Superior Trading Conditions"
            highlight="Conditions"
            subtitle="Transparent pricing, deep liquidity and risk tools built into every account."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {tradingConditions.map((c, i) => (
              <AnimatedSection key={c.title} animation="slideUp" delay={i * 0.08}>
                <div className="card h-full flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                    <span className={c.color}>{c.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1.5">{c.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{c.desc}</p>
                  </div>
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
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Trade Global Markets?</h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8">Open your Bull4X account in minutes and start trading with millisecond execution.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/auth/register" className="b4x-btn-primary gap-2">Open Account <ChevronRight size={16} /></Link>
                <Link to="/our-accounts" className="b4x-btn-outline">Compare Accounts</Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
