// ============================================
// BULL4X - Islamic Account Section
// ============================================

import React from 'react'
import { FiCheck } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import AnimatedSection from '../../components/AnimatedSection'
import SectionHeader from '../../components/SectionHeader'

const features = [
  'Zero overnight swap fees',
  'No interest charges',
  'All instruments available',
  'Same execution speed and spreads',
]

function IslamicAccountSection() {
  return (
    <section className="section-padding bg-bull-800">
      <div className="section-container">
        <SectionHeader
          badge="Shariah Compliant"
          title="SWAP-FREE ISLAMIC ACCOUNT"
          highlight="ISLAMIC ACCOUNT"
          subtitle="Fully Shariah-compliant trading account designed for traders who require swap-free trading"
        />

        <AnimatedSection animation="slideUp" delay={0.2} className="mt-12">
          <div className="max-w-4xl mx-auto">
            <div className="card border-green-accent/20">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    BULL4X offers a fully Shariah-compliant trading account designed for traders who require swap-free trading.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    {features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FiCheck size={12} className="text-green-accent" />
                        </div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-accent/10 border border-green-accent/20">
                    <span className="text-green-accent text-sm font-semibold">Minimum Deposit: $100</span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">??</div>
                    <h3 className="text-white font-bold text-xl mb-4">Shariah Compliant</h3>
                    <Link to="/accounts" className="b4x-btn-primary">
                      Open Islamic Account
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default IslamicAccountSection
