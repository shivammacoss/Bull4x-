import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'

function AnimatedGlobe() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <div className="relative w-[800px] h-[800px] animate-spin-slow opacity-20">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <circle cx="200" cy="200" r="180" fill="none" stroke="url(#globeGradient)" strokeWidth="0.5" opacity="0.3" />
          <circle cx="200" cy="200" r="160" fill="none" stroke="url(#globeGradient)" strokeWidth="0.5" opacity="0.25" />
          <circle cx="200" cy="200" r="140" fill="none" stroke="url(#globeGradient)" strokeWidth="0.5" opacity="0.2" />
          {[...Array(9)].map((_, i) => (
            <ellipse
              key={`lat-${i}`}
              cx="200"
              cy="200"
              rx={180 * Math.cos((i - 4) * 0.35)}
              ry={40}
              fill="none"
              stroke="url(#globeGradient)"
              strokeWidth="0.3"
              opacity={0.15}
            />
          ))}
          {[...Array(12)].map((_, i) => (
            <ellipse
              key={`long-${i}`}
              cx="200"
              cy="200"
              rx="180"
              ry="180"
              fill="none"
              stroke="url(#globeGradient)"
              strokeWidth="0.3"
              opacity={0.15}
              transform={`rotate(${i * 15} 200 200)`}
            />
          ))}
          <defs>
            <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5FAED6" />
              <stop offset="50%" stopColor="#3E90C2" />
              <stop offset="100%" stopColor="#2F7FB5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

export default function Hero() {
  const navigate = useNavigate()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const scrollToSection = (href) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <AnimatedGlobe />
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
        <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">
          <span className={`block transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Trade Smarter. Fund Faster.
          </span>
          <span className={`block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent transition-all duration-700 delay-150 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Grow Globally.
          </span>
        </h1>

        <p className={`text-base sm:text-lg text-white/70 max-w-2xl mx-auto mb-10 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          A complete trading ecosystem offering Forex access, capital funding, IB partnership, and advanced copy trading — all under one trusted platform.
        </p>

        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={() => navigate('/user/login')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 flex items-center gap-2 group shadow-lg shadow-blue-500/25"
          >
            Start Trading
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => scrollToSection('#funding')}
            className="px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2 group border border-white/20"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Play className="w-4 h-4 fill-white" />
            </div>
            Apply For Funding
          </button>
        </div>
      </div>
    </section>
  )
}
