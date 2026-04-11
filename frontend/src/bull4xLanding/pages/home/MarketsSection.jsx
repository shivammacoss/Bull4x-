// ============================================
// BULL4X - Markets Section
// ============================================

import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { StaggerContainer, StaggerItem } from '../../components/AnimatedSection'
import SectionHeader from '../../components/SectionHeader'
import { marketAssets } from '../HomeData'

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

export default function MarketsSection() {
  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #111820 0%, #0d1117 100%)' }}
    >
      {/* Background watermark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Watermark char="Trade" className="absolute -right-4 bottom-10 text-[180px] text-white/[0.018] font-black" />
      </div>
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="section-container relative z-10">
        <SectionHeader
          badge="Markets"
          title="Global Markets Access"
          highlight="Global Markets"
          subtitle="At BULL4X, you can access a wide range of global financial instruments from a single account."
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
          {marketAssets.map((asset) => (
            <StaggerItem key={asset.label}>
              <div className="card jp-card group h-full relative overflow-hidden">
                {/* Watermark */}
                <div
                  className="absolute top-3 right-3 text-xs text-white/[0.05] font-black pointer-events-none select-none uppercase tracking-widest"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {asset.kanji}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{asset.icon}</span>
                  <h3 className="text-white font-semibold text-lg group-hover:text-[#F0C96F] transition-colors">
                    {asset.label}
                  </h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{asset.desc}</p>
              </div>
            </StaggerItem>
          ))}

          {/* CTA card */}
          <StaggerItem>
            <div
              className="card jp-card h-full flex flex-col items-center justify-center text-center border-dashed border-[#D9A136]/20 hover:border-[#D9A136]/40 min-h-[160px]"
            >
              <div
                className="text-2xl mb-3 text-[#D9A136]/40 uppercase tracking-wider font-black"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                More
              </div>
              <p className="text-slate-400 text-sm mb-4">And many more instruments available</p>
              <Link to="/trading" className="b4x-btn-primary gap-2 text-sm">
                Explore All Markets <FiArrowRight size={14} />
              </Link>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  )
}
