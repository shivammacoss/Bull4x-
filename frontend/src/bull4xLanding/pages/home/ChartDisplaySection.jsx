// ============================================
// BULL4X - Chart Display Section
// ============================================

import React, { useState } from 'react'
import AnimatedSection from '../../components/AnimatedSection'
import TradingViewWidget from '../../components/TradingViewWidget'

const chartTabs = [
  { id: 'forex', label: 'Forex', symbol: 'FX:EURUSD' },
  { id: 'gold', label: 'Gold', symbol: 'OANDA:XAUUSD' },
  { id: 'crypto', label: 'Crypto', symbol: 'BINANCE:BTCUSDT' },
  { id: 'indices', label: 'Indices', symbol: 'CAPITALCOM:US30' },
]

function ChartDisplaySection() {
  const [activeTab, setActiveTab] = useState('forex')

  return (
    <section className="py-24 md:py-32 bg-bull-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Chart Display - Full Width */}
        <AnimatedSection animation="slideUp">
          <div className="w-full">
            <TradingViewWidget symbol={chartTabs.find(t => t.id === activeTab)?.symbol} />
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default ChartDisplaySection
