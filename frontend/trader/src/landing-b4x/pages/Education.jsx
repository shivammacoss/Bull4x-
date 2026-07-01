'use client'

// BULL4X - Education page (Bull4X landing design)
import React from 'react'
import { Link } from '../router-shim'
import { ArrowRight, GraduationCap } from 'lucide-react'
import AnimatedSection, { StaggerContainer, StaggerItem } from '../components/AnimatedSection'
import SectionHeader from '../components/SectionHeader'
import { educationItems, toolsResearch } from './HomeData'

export default function Education() {
  return (
    <>
      {/* Hero */}
      <section className="relative section-padding overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-40 pointer-events-none" aria-hidden />
        <div className="section-container relative z-10 text-center">
          <SectionHeader
            badge="Bull4X Academy"
            title="Learn to Trade With Confidence"
            highlight="Confidence"
            subtitle="From your first trade to advanced strategies — sharpen your edge with structured courses, expert insights and professional research tools."
          />
          <AnimatedSection animation="slideUp" delay={0.35}>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link to="/auth/register" className="b4x-btn-primary gap-2"><GraduationCap size={16} /> Start Learning</Link>
              <Link to="/auth/register" className="b4x-btn-outline gap-2">Open Demo Account</Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Education items */}
      <section className="section-padding">
        <div className="section-container">
          <SectionHeader badge="Learning Hub" title="Education for Every Level" highlight="Every Level" />
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {educationItems.map((item) => (
              <StaggerItem key={item.label}>
                <div className="card h-full flex gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-accent/10 border border-red-accent/20">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">{item.label}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Tools & research */}
      <section className="section-padding" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section-container">
          <SectionHeader badge="Tools & Research" title="Trade Smarter, Not Harder" highlight="Smarter" subtitle="Professional-grade research and analysis tools included with every account." />
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {toolsResearch.map((tool) => (
              <StaggerItem key={tool.label}>
                <div className="card h-full text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-red-accent/10 border border-red-accent/20">
                    {tool.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">{tool.label}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{tool.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="section-container">
          <AnimatedSection animation="scaleIn">
            <div className="card text-center py-14" style={{ background: 'linear-gradient(145deg, #1a232e 0%, #0d1117 100%)' }}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Put Your Knowledge to Work</h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8">Practice risk-free on a demo, or go live and start applying what you've learned.</p>
              <Link to="/auth/register" className="b4x-btn-primary gap-2 inline-flex">Get Started <ArrowRight size={16} /></Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
