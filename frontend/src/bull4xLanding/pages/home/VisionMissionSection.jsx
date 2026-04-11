// ============================================
// BULL4X - Vision, Mission & Values Section
// ============================================

import React from 'react'
import { FiShield, FiTrendingUp, FiHeart } from 'react-icons/fi'
import AnimatedSection, { StaggerContainer, StaggerItem } from '../../components/AnimatedSection'
import SectionHeader from '../../components/SectionHeader'

const values = [
  {
    icon: <FiShield size={22} />,
    title: 'Transparency',
    desc: 'We believe in fair trading conditions and clear pricing with no hidden charges.',
    color: 'text-green-accent',
    bg: 'bg-green-accent/10',
  },
  {
    icon: <FiTrendingUp size={22} />,
    title: 'Innovation',
    desc: 'We continuously improve our trading technology to deliver the best performance.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: <FiHeart size={22} />,
    title: 'Integrity',
    desc: 'We operate with honesty, professionalism, and strong ethical standards.',
    color: 'text-red-accent',
    bg: 'bg-red-accent/10',
  },
]

function VisionMissionSection() {
  return (
    <section className="section-padding bg-bull-800">
      <div className="section-container">
        <SectionHeader
          badge="Our Foundation"
          title="VISION, MISSION & VALUES"
          highlight="MISSION & VALUES"
          subtitle="The principles that guide everything we do"
        />

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-6 mt-12 mb-16">
          <AnimatedSection animation="slideLeft">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-red-accent/10 to-bull-600 border border-red-accent/20 h-full">
              <div className="text-4xl mb-4">??</div>
              <h3 className="text-xl font-bold text-white mb-3">Our Vision</h3>
              <p className="text-gray-300 leading-relaxed">
                To become a globally trusted trading partner providing traders with access to professional technology and fair market conditions.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="slideRight" delay={0.1}>
            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-bull-600 border border-blue-500/20 h-full">
              <div className="text-4xl mb-4">??</div>
              <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
              <p className="text-gray-300 leading-relaxed">
                To empower traders worldwide by delivering transparent pricing, reliable execution, and innovative trading solutions.
              </p>
            </div>
          </AnimatedSection>
        </div>

        {/* Core Values */}
        <AnimatedSection animation="slideUp" delay={0.2}>
          <h3 className="text-2xl font-bold text-white text-center mb-8">Core Values</h3>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((value, i) => (
            <StaggerItem key={value.title}>
              <div className="card group h-full text-center">
                <div className={`feature-icon ${value.bg} ${value.color} mb-4 mx-auto`}>
                  {value.icon}
                </div>
                <h4 className="text-white font-semibold text-lg mb-3 group-hover:text-red-accent transition-colors">
                  {value.title}
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">{value.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

export default VisionMissionSection
