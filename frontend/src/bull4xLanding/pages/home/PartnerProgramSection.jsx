// ============================================
// BULL4X - IB & Affiliate Program Section
// ============================================

import React from 'react'
import { TrendingUp, DollarSign, BarChart2, Award, Medal, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import AnimatedSection, { StaggerContainer, StaggerItem } from '../../components/AnimatedSection'
import SectionHeader from '../../components/SectionHeader'

const benefits = [
  { icon: <DollarSign size={20} />, title: 'High rebate structure', color: 'text-green-accent', bg: 'bg-green-accent/10' },
  { icon: <TrendingUp size={20} />, title: 'Lifetime commissions', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { icon: <BarChart2 size={20} />, title: 'Partner dashboard tracking', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { icon: <Award size={20} />, title: 'Marketing support', color: 'text-red-accent', bg: 'bg-red-accent/10' },
]

const ibLevels = [
  { level: 'Silver IB', rebate: '$3 per lot', color: 'text-gray-300', bg: 'bg-gray-400/10', border: 'border-gray-400/20', Icon: Medal },
  { level: 'Gold IB', rebate: '$5 per lot', color: 'text-gold-500', bg: 'bg-gold-500/10', border: 'border-gold-500/20', Icon: Award },
  { level: 'Platinum IB', rebate: '$7 per lot', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', Icon: Trophy },
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
            {ibLevels.map((ib) => {
              const Icon = ib.Icon
              return (
                <div key={ib.level} className={`card ${ib.border} text-center group`}>
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl ${ib.bg} ring-1 ring-inset ${ib.border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={26} className={ib.color} strokeWidth={1.75} />
                  </div>
                  <h4 className={`${ib.color} font-bold text-lg mb-2`}>{ib.level}</h4>
                  <p className="text-gray-300 text-2xl font-bold mb-1">{ib.rebate}</p>
                  <p className="text-gray-500 text-xs">Commission per lot</p>
                </div>
              )
            })}
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
