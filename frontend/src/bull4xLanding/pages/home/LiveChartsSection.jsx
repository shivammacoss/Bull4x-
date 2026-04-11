// ============================================
// BULL4X - Live Market Charts Section
// ============================================

import React, { useState } from 'react'
import AnimatedSection, { StaggerContainer, StaggerItem } from '../../components/AnimatedSection'
import SectionHeader from '../../components/SectionHeader'
import TradingViewWidget from '../../components/TradingViewWidget'

const chartTabs = [
  { id: 'forex', label: 'Forex', symbol: 'FX:EURUSD' },
  { id: 'gold', label: 'Gold', symbol: 'OANDA:XAUUSD' },
  { id: 'crypto', label: 'Crypto', symbol: 'BINANCE:BTCUSDT' },
  { id: 'indices', label: 'Indices', symbol: 'CAPITALCOM:US30' },
]

function LiveChartsSection() {
  const [activeTab, setActiveTab] = useState('forex')

  return (
    <section className="section-padding bg-bull-900">
      <div className="section-container">
        <SectionHeader
          badge="Live Markets"
          title="LIVE MARKET CHARTS"
          highlight="MARKET CHARTS"
          subtitle="Real-time professional market charts powered by advanced charting technology."
        />

        {/* Tab Navigation */}
        <AnimatedSection animation="slideUp" delay={0.2}>
          <div className="flex flex-wrap justify-center gap-3">
            {chartTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-red-accent text-white shadow-lg shadow-red-accent/20'
                    : 'bg-bull-700 text-gray-400 hover:bg-bull-600 hover:text-white border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default LiveChartsSection
