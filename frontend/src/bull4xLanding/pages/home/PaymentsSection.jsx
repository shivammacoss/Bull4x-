// ============================================
// BULL4X - Deposits & Withdrawals Section
// ============================================

import React from 'react'
import { CreditCard, DollarSign, Building2, Wallet, Bitcoin, Smartphone, Banknote } from 'lucide-react'
import AnimatedSection, { StaggerContainer, StaggerItem } from '../../components/AnimatedSection'
import SectionHeader from '../../components/SectionHeader'

const paymentMethods = [
  { name: 'Bank Transfer', Icon: Building2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { name: 'Credit / Debit Cards', Icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { name: 'Skrill', Icon: Wallet, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { name: 'Neteller', Icon: Banknote, color: 'text-green-accent', bg: 'bg-green-accent/10' },
  { name: 'Crypto Payments', Icon: Bitcoin, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { name: 'UPI / Local Bank Transfer', Icon: Smartphone, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
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
                {paymentMethods.map((method) => {
                  const Icon = method.Icon
                  return (
                    <StaggerItem key={method.name}>
                      <div className="p-5 rounded-xl bg-bull-700 border border-white/5 hover:border-red-accent/20 hover:bg-bull-700/70 transition-all text-center group">
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${method.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon size={22} className={method.color} strokeWidth={1.75} />
                        </div>
                        <p className="text-gray-300 text-sm font-medium">{method.name}</p>
                      </div>
                    </StaggerItem>
                  )
                })}
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
