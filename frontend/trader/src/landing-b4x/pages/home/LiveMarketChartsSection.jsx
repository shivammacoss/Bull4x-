'use client'
// ============================================
// BULL4X - Live Market Charts Section
// ============================================

import React, { useState } from 'react'
import { DollarSign, Coins, Bitcoin, BarChart3 } from 'lucide-react'
import AnimatedSection from '../../components/AnimatedSection'
import SectionHeader from '../../components/SectionHeader'
import TradingViewWidget from '../../components/TradingViewWidget'

const chartTabs = [
  { id: 'forex', label: 'Forex', symbol: 'FX:EURUSD', Icon: DollarSign },
  { id: 'gold', label: 'Gold', symbol: 'OANDA:XAUUSD', Icon: Coins },
  { id: 'crypto', label: 'Crypto', symbol: 'BINANCE:BTCUSDT', Icon: Bitcoin },
  { id: 'indices', label: 'Indices', symbol: 'CAPITALCOM:US30', Icon: BarChart3 },
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
            {chartTabs.map((tab) => {
              const Icon = tab.Icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-red-accent text-white shadow-lg shadow-red-accent/20'
                      : 'bg-bull-700 text-gray-400 hover:bg-bull-600 hover:text-white border border-white/5'
                  }`}
                >
                  <Icon size={16} strokeWidth={2} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
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
