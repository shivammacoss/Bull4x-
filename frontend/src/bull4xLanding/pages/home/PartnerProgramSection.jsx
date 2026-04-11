// ============================================
// BULL4X - IB & Affiliate Program Section
// ============================================

import React from 'react'
import { FiTrendingUp, FiDollarSign, FiBarChart2, FiAward } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import AnimatedSection, { StaggerContainer, StaggerItem } from '../../components/AnimatedSection'
import SectionHeader from '../../components/SectionHeader'

const benefits = [
  { icon: <FiDollarSign size={20} />, title: 'High rebate structure', color: 'text-green-accent', bg: 'bg-green-accent/10' },
  { icon: <FiTrendingUp size={20} />, title: 'Lifetime commissions', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { icon: <FiBarChart2 size={20} />, title: 'Partner dashboard tracking', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { icon: <FiAward size={20} />, title: 'Marketing support', color: 'text-red-accent', bg: 'bg-red-accent/10' },
]

const ibLevels = [
  { level: 'Silver IB', rebate: '$3 per lot', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' },
  { level: 'Gold IB', rebate: '$5 per lot', color: 'text-gold-500', bg: 'bg-gold-500/10', border: 'border-gold-500/20' },
  { level: 'Platinum IB', rebate: '$7 per lot', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
]

function PartnerProgramSection() {
  return (
    <section className="section-padding bg-bull-800">
      <div className="section-container">
        <SectionHeader
          badge="Partner Program"
          title="IB & AFFILIATE PROGRAM"
          highlight="AFFILIATE PROGRAM"
          subtitle="Join our partner network and earn commissions by referring traders"
        />

        {/* Benefits */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 mb-12">
          {benefits.map((benefit) => (
            <StaggerItem key={benefit.title}>
              <div className="card h-full text-center">
                <div className={`feature-icon ${benefit.bg} ${benefit.color} mb-3 mx-auto`}>
                  {benefit.icon}
                </div>
                <p className="text-gray-300 text-sm font-medium">{benefit.title}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* IB Levels */}
        <AnimatedSection animation="slideUp" delay={0.3}>
          <h3 className="text-white font-bold text-xl text-center mb-8">IB Levels</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {ibLevels.map((ib, i) => (
              <div key={ib.level} className={`card ${ib.border} text-center`}>
                <div className="text-3xl mb-3">
                  {i === 0 ? '??' : i === 1 ? '??' : '??'}
                </div>
                <h4 className={`${ib.color} font-bold text-lg mb-2`}>{ib.level}</h4>
                <p className="text-gray-300 text-2xl font-bold mb-1">{ib.rebate}</p>
                <p className="text-gray-500 text-xs">Commission per lot</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection animation="slideUp" delay={0.4} className="text-center mt-10">
          <Link to="/contact" className="b4x-btn-primary">
            Become a Partner
          </Link>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default PartnerProgramSection
