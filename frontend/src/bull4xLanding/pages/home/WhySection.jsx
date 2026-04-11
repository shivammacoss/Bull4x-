// ============================================
// BULL4X - Why Section
// ============================================

import React from 'react'
import { StaggerContainer, StaggerItem } from '../../components/AnimatedSection'
import SectionHeader from '../../components/SectionHeader'
import { whyFeatures } from '../HomeData'

function Watermark({ char, className = '' }) {
  return (
    <span
      className={`select-none pointer-events-none ${className}`}
      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}
      aria-hidden="true"
    >
      {char}
    </span>
  )
}

export default function WhySection() {
  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0d1117 0%, #111820 100%)' }}
    >
      {/* Background watermark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Watermark char="Innovate" className="absolute -left-6 top-1/2 -translate-y-1/2 text-[200px] text-white/[0.018] font-black" />
      </div>
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" />

      <div className="section-container relative z-10">
        <SectionHeader
          badge="Why Choose Us"
          title="Why Choose BULL4X"
          highlight="BULL4X"
          subtitle="We combine institutional-grade technology with trader-friendly conditions to give you the edge in global markets."
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
          {whyFeatures.map((f) => (
            <StaggerItem key={f.title}>
              <div className="card jp-card group h-full relative overflow-hidden">
                {/* Watermark */}
                <div
                  className="absolute top-3 right-3 text-xl text-white/[0.04] font-black pointer-events-none select-none uppercase tracking-wider"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {f.kanji}
                </div>

                {/* Icon */}
                <div className={`feature-icon ${f.bg} ${f.color} mb-4`}>{f.icon}</div>

                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-[#F0C96F] transition-colors">
                  {f.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
