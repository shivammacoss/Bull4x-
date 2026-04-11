// ============================================
// BULL4X - Security & Regulation Section
// ============================================

import React from 'react'
import { FiShield, FiLock, FiCheckCircle, FiFileText } from 'react-icons/fi'
import AnimatedSection, { StaggerContainer, StaggerItem } from '../../components/AnimatedSection'
import SectionHeader from '../../components/SectionHeader'

const securityFeatures = [
  {
    icon: <FiShield size={22} />,
    title: 'Client funds held in segregated accounts',
    color: 'text-green-accent',
    bg: 'bg-green-accent/10',
  },
  {
    icon: <FiLock size={22} />,
    title: 'Advanced SSL encryption security',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: <FiCheckCircle size={22} />,
    title: 'Full AML & KYC compliance',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: <FiFileText size={22} />,
    title: 'Independent dispute resolution system',
    color: 'text-red-accent',
    bg: 'bg-red-accent/10',
  },
]

function SecuritySection() {
  return (
    <section className="section-padding bg-bull-900">
      <div className="section-container">
        <SectionHeader
          badge="Security"
          title="TRUSTED & SECURE BROKER"
          highlight="SECURE BROKER"
          subtitle="Your security and trust are our top priorities"
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
          {securityFeatures.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="card h-full">
                <div className={`feature-icon ${feature.bg} ${feature.color} mb-4`}>
                  {feature.icon}
                </div>
                <p className="text-white font-medium leading-relaxed">{feature.title}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <AnimatedSection animation="slideUp" delay={0.4} className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-green-accent/10 border border-green-accent/20">
            <FiShield className="text-green-accent" size={20} />
            <span className="text-green-accent font-semibold">Your funds are protected</span>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default SecuritySection
