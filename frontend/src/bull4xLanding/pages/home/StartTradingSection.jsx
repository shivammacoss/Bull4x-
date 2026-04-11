// ============================================
// BULL4X - Start Trading Section
// ============================================

import React from 'react'
import { FiUserPlus, FiDollarSign, FiTrendingUp } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import AnimatedSection, { StaggerContainer, StaggerItem } from '../../components/AnimatedSection'
import SectionHeader from '../../components/SectionHeader'

const steps = [
  {
    number: '1',
    icon: <FiUserPlus size={24} />,
    title: 'Register Account',
    desc: 'Create your account in minutes.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    number: '2',
    icon: <FiDollarSign size={24} />,
    title: 'Fund Account',
    desc: 'Deposit funds using secure payment methods.',
    color: 'text-green-accent',
    bg: 'bg-green-accent/10',
  },
  {
    number: '3',
    icon: <FiTrendingUp size={24} />,
    title: 'Start Trading',
    desc: 'Access global markets and begin trading instantly.',
    color: 'text-red-accent',
    bg: 'bg-red-accent/10',
  },
]

function StartTradingSection() {
  return (
    <section className="section-padding bg-bull-800">
      <div className="section-container">
        <SectionHeader
          badge="Get Started"
          title="START TRADING IN 3 SIMPLE STEPS"
          highlight="3 SIMPLE STEPS"
          subtitle="Begin your trading journey with BULL4X today"
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <StaggerItem key={step.number}>
              <div className="card h-full text-center relative">
                {/* Step Number Badge */}
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full ${step.bg} border-4 border-bull-800 flex items-center justify-center`}>
                  <span className={`${step.color} font-bold text-lg`}>{step.number}</span>
                </div>

                <div className={`feature-icon ${step.bg} ${step.color} mb-4 mx-auto mt-6`}>
                  {step.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <AnimatedSection animation="slideUp" delay={0.4} className="text-center mt-12">
          <Link to="/accounts" className="b4x-btn-primary text-lg px-8 py-4">
            Open Trading Account
          </Link>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default StartTradingSection
