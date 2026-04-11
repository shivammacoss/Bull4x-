// ============================================
// BULL4X - Live Market Charts Section
// ============================================

import React, { useState } from 'react'
import AnimatedSection from '../../components/AnimatedSection'
import SectionHeader from '../../components/SectionHeader'
import TradingViewWidget from '../../components/TradingViewWidget'

const chartTabs = [
  { id: 'forex', label: 'Forex', symbol: 'FX:EURUSD', icon: '??' },
  { id: 'gold', label: 'Gold', symbol: 'OANDA:XAUUSD', icon: '??' },
  { id: 'crypto', label: 'Crypto', symbol: 'BINANCE:BTCUSDT', icon: '?' },
  { id: 'indices', label: 'Indices', symbol: 'CAPITALCOM:US30', icon: '??' },
]

function LiveMarketChartsSection() {
  const [activeTab, setActiveTab] = useState('forex')

  return (
    <section className="pt-20 pb-24 md:pt-24 md:pb-32 bg-bull-900">
      <div className="section-container">
        <SectionHeader
          badge="LIVE CHARTS"
          title="LIVE MARKET CHARTS"
          highlight="MARKET CHARTS"
          subtitle="Real-time professional charts powered by TradingView � the world's leading charting platform."
        />

        {/* Tab Navigation */}
        <AnimatedSection animation="slideUp" delay={0.2}>
          <div className="flex flex-wrap justify-center gap-3 mb-12 mt-10">
            {chartTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-red-accent text-white shadow-lg shadow-red-accent/20'
                    : 'bg-bull-700 text-gray-400 hover:bg-bull-600 hover:text-white border border-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Chart Display */}
        <AnimatedSection animation="slideUp" delay={0.3}>
          <div className="w-full max-w-7xl mx-auto">
            <TradingViewWidget symbol={chartTabs.find(t => t.id === activeTab)?.symbol} />
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default LiveMarketChartsSection
