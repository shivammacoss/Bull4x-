// ============================================
// BULL4X - Deposits & Withdrawals Section
// ============================================

import React from 'react'
import { FiCreditCard, FiDollarSign } from 'react-icons/fi'
import AnimatedSection, { StaggerContainer, StaggerItem } from '../../components/AnimatedSection'
import SectionHeader from '../../components/SectionHeader'

const paymentMethods = [
  { name: 'Bank Transfer', icon: '??' },
  { name: 'Credit / Debit Cards', icon: '??' },
  { name: 'Skrill', icon: '??' },
  { name: 'Neteller', icon: '??' },
  { name: 'Crypto Payments', icon: '?' },
  { name: 'UPI / Local Bank Transfer', icon: '??' },
]

function PaymentsSection() {
  return (
    <section className="section-padding bg-bull-900">
      <div className="section-container">
        <SectionHeader
          badge="Payments"
          title="FAST & SECURE PAYMENTS"
          highlight="SECURE PAYMENTS"
          subtitle="Multiple payment methods available with fast processing and zero deposit fees"
        />

        <AnimatedSection animation="slideUp" delay={0.2} className="mt-12">
          <div className="max-w-5xl mx-auto">
            <div className="card">
              <h3 className="text-white font-bold text-lg mb-6 text-center">Available Methods</h3>
              
              <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <StaggerItem key={method.name}>
                    <div className="p-4 rounded-xl bg-bull-700 border border-white/5 hover:border-red-accent/20 transition-all text-center">
                      <div className="text-3xl mb-2">{method.icon}</div>
                      <p className="text-gray-300 text-sm font-medium">{method.name}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              <div className="grid md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5">
                <div className="text-center">
                  <div className="text-green-accent text-2xl font-bold mb-1">0%</div>
                  <p className="text-gray-400 text-xs">Deposit Fees</p>
                </div>
                <div className="text-center">
                  <div className="text-green-accent text-2xl font-bold mb-1">Instant</div>
                  <p className="text-gray-400 text-xs">Processing Time</p>
                </div>
                <div className="text-center">
                  <div className="text-green-accent text-2xl font-bold mb-1">24/7</div>
                  <p className="text-gray-400 text-xs">Availability</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default PaymentsSection
