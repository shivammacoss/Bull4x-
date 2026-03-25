import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const categories = [
  { id: 'forex', name: 'Forex', count: 60 },
  { id: 'crypto', name: 'Crypto', count: 15 },
  { id: 'indices', name: 'Indices', count: 12 },
  { id: 'commodities', name: 'Commodities', count: 8 },
]

const instruments = {
  forex: [
    { symbol: 'EUR/USD', name: 'Euro / US Dollar', spread: '0.1', change: '+0.12%', positive: true },
    { symbol: 'GBP/USD', name: 'British Pound / US Dollar', spread: '0.3', change: '+0.08%', positive: true },
    { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', spread: '0.2', change: '-0.15%', positive: false },
    { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', spread: '0.4', change: '+0.22%', positive: true },
    { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', spread: '0.5', change: '-0.05%', positive: false },
    { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', spread: '0.6', change: '+0.18%', positive: true },
  ],
  crypto: [
    { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', spread: '15', change: '+2.45%', positive: true },
    { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', spread: '1.2', change: '+1.82%', positive: true },
    { symbol: 'XRP/USD', name: 'Ripple / US Dollar', spread: '0.002', change: '-0.95%', positive: false },
    { symbol: 'LTC/USD', name: 'Litecoin / US Dollar', spread: '0.5', change: '+0.67%', positive: true },
  ],
  indices: [
    { symbol: 'US30', name: 'Dow Jones 30', spread: '1.5', change: '+0.35%', positive: true },
    { symbol: 'US500', name: 'S&P 500', spread: '0.4', change: '+0.28%', positive: true },
    { symbol: 'US100', name: 'Nasdaq 100', spread: '1.0', change: '+0.52%', positive: true },
    { symbol: 'UK100', name: 'FTSE 100', spread: '1.2', change: '-0.18%', positive: false },
  ],
  commodities: [
    { symbol: 'XAU/USD', name: 'Gold / US Dollar', spread: '0.3', change: '+0.45%', positive: true },
    { symbol: 'XAG/USD', name: 'Silver / US Dollar', spread: '0.02', change: '+0.72%', positive: true },
    { symbol: 'WTI', name: 'Crude Oil WTI', spread: '0.03', change: '-1.25%', positive: false },
    { symbol: 'BRENT', name: 'Brent Crude Oil', spread: '0.03', change: '-0.98%', positive: false },
  ],
}

export default function Instruments() {
  const [activeCategory, setActiveCategory] = useState('forex')
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const tableRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current.children,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 85%', toggleActions: 'play none none reverse' }
        }
      )
      gsap.fromTo(tableRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: tableRef.current, start: 'top 85%', toggleActions: 'play none none reverse' }
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="instruments" className="py-24 bg-[#080c14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div ref={headerRef} className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-4">
            Markets
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Trade{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              100+ Instruments
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Access global markets with competitive spreads and lightning-fast execution.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {category.name}
              <span className={`ml-2 text-sm ${activeCategory === category.id ? 'text-white/80' : 'text-white/40'}`}>
                ({category.count})
              </span>
            </button>
          ))}
        </div>

        {/* Instruments table */}
        <div ref={tableRef} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-white/5 border-b border-white/10 text-sm font-medium text-white/60">
            <div>Instrument</div>
            <div className="text-center">Spread</div>
            <div className="text-center">Change</div>
            <div className="text-right">Action</div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-white/5">
            {instruments[activeCategory].map((instrument, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  <div className="font-semibold text-white">{instrument.symbol}</div>
                  <div className="text-sm text-white/50">{instrument.name}</div>
                </div>
                <div className="text-center">
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium">
                    {instrument.spread}
                  </span>
                </div>
                <div className="text-center">
                  <span className={`font-medium ${instrument.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {instrument.change}
                  </span>
                </div>
                <div className="text-right">
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                    Trade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8">
          <p className="text-white/50 text-sm">
            View all instruments in our trading platform
          </p>
        </div>
      </div>
    </section>
  )
}
