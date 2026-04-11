// ============================================
// BULL4X - Conditions Section
// ============================================

import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import AnimatedSection, { StaggerContainer, StaggerItem } from '../../components/AnimatedSection'
import SectionHeader from '../../components/SectionHeader'
import { tradingConditions } from '../HomeData'

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

export default function ConditionsSection() {
  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0d1117 0%, #111820 100%)' }}
    >
      <div className="absolute inset-0 shoji-bg opacity-20 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Watermark char="Terms" className="absolute -left-4 bottom-10 text-[180px] text-white/[0.018] font-black" />
      </div>

      <div className="section-container relative z-10">
        <SectionHeader
          badge="Trading Conditions"
          title="Professional Trading Conditions"
          highlight="Trading Conditions"
          subtitle="BULL4X follows a No Dealing Desk (NDD) execution model to ensure transparent and conflict-free trading."
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
          {tradingConditions.map((item) => (
            <StaggerItem key={item.title}>
              <div className="card jp-card group h-full text-center">
                <div className={`feature-icon ${item.bg} ${item.color} mb-4 mx-auto`}>{item.icon}</div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-[#F0C96F] transition-colors">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Risk management tools */}
        <AnimatedSection animation="slideUp" delay={0.3}>
          <div
            className="mt-10 p-6 rounded-2xl border border-white/8 relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
          >
            <div
              className="absolute top-3 right-4 text-[35px] text-white/[0.03] font-black pointer-events-none select-none uppercase tracking-wider"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Manage
            </div>

            <h4
              className="text-white font-semibold mb-4 text-center uppercase tracking-wider"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Built-in Risk Management Tools
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Stop Loss & Take Profit', 'Trailing Stop', 'Negative Balance Protection', 'Margin Call Alerts'].map((tool) => (
                <div
                  key={tool}
                  className="flex items-center gap-2 p-3 rounded-lg border border-white/5 hover:border-[#00d4aa]/20 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: '#00d4aa', boxShadow: '0 0 5px rgba(0,212,170,0.6)' }}
                  />
                  <span className="text-slate-300 text-xs">{tool}</span>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <Link to="/trading" className="b4x-btn-primary gap-2">
                View Trading Conditions <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
