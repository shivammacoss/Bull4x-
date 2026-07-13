'use client'
// ============================================
// BULL4X - TradingView Widget
// ============================================

import React, { useEffect, useRef, useState, memo } from 'react'

const CHART_HEIGHT = 700

function TradingViewWidget({ symbol = 'FX:EURUSD' }) {
  const container = useRef(null)
  // Defer the heavy external TradingView embed (s3.tradingview.com script +
  // iframe) until the chart scrolls near the viewport. Loading it on mount
  // made the landing page pull ~hundreds of KB + external requests during
  // first paint even when the section was far below the fold.
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = container.current
    if (!el || inView) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          obs.disconnect()
        }
      },
      { rootMargin: '300px' }, // start loading just before it's visible
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [inView])

  useEffect(() => {
    if (!container.current || !inView) return

    // Clear previous widget
    container.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: false,
      width: '100%',
      height: CHART_HEIGHT,
      symbol: symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      backgroundColor: 'rgba(7, 9, 14, 1)',
      gridColor: 'rgba(255, 255, 255, 0.04)',
    })

    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container__widget'
    widgetContainer.style.height = `${CHART_HEIGHT}px`
    widgetContainer.style.width = '100%'
    
    container.current.appendChild(widgetContainer)
    container.current.appendChild(script)
  }, [symbol, inView])

  return (
    <div
      className="tradingview-widget-container rounded-2xl overflow-hidden border border-white/5"
      ref={container}
      style={{ height: `${CHART_HEIGHT}px`, width: '100%' }}
    />
  )
}

export default memo(TradingViewWidget)
