import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, TrendingUp, Shield, Zap, ChevronDown } from 'lucide-react'

// Floating particles animation
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}
        />
      ))}
    </div>
  )
}

// Animated trading chart background
function TradingChartBg() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10">
      <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
        <path
          d="M0,300 Q150,250 300,280 T600,200 Q750,150 900,220 T1200,180"
          fill="none"
          stroke="url(#chartLine)"
          strokeWidth="2"
          className="animate-pulse"
        />
        <path
          d="M0,350 Q200,300 400,330 T800,270 Q950,220 1100,280 T1200,250"
          fill="none"
          stroke="url(#chartLine2)"
          strokeWidth="2"
          className="animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <defs>
          <linearGradient id="chartLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="chartLine2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// Stats counter
function StatItem({ value, label, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-white/60">{label}</div>
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
    <section id="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0a0f1a]">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a]/50 via-transparent to-[#0a0f1a]" />
      </div>
      
      {/* Background gradient accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl z-10" />
      
      <FloatingParticles />
      <TradingChartBg />
      
      {/* Main content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Badge */}
        <div className={`flex justify-center mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-blue-300">Trusted by 10,000+ traders worldwide</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">
          <span className={`block transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Trade Smarter.
          </span>
          <span className={`block transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Fund Faster.
          </span>
          <span className={`block bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Grow Globally.
          </span>
        </h1>

        {/* Subheadline */}
        <p className={`text-center text-lg sm:text-xl text-white/60 max-w-3xl mx-auto mb-10 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Access global markets with up to <span className="text-white font-semibold">$100,000</span> in funded capital. 
          Professional tools, instant execution, and <span className="text-emerald-400 font-semibold">90% profit splits</span>.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={() => navigate('/user/signup')}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2 overflow-hidden"
          >
            <span className="relative z-10">Start Trading Now</span>
            <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            onClick={() => navigate('/buy-challenge')}
            className="px-8 py-4 bg-white/5 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center gap-2 border border-white/10 hover:border-white/20"
          >
            <Zap className="w-5 h-5 text-yellow-400" />
            Get Funded
          </button>
        </div>

        {/* Feature pills */}
        <div className={`flex flex-wrap justify-center gap-4 mb-16 transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/80">100+ Instruments</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white/80">Regulated & Secure</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white/80">Instant Execution</span>
          </div>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <StatItem value={10000} label="Active Traders" suffix="+" />
          <StatItem value={50} label="Trading Volume" prefix="$" suffix="M+" />
          <StatItem value={100} label="Instruments" suffix="+" />
          <StatItem value={24} label="Support" suffix="/7" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <button onClick={() => scrollToSection('#services')} className="text-white/40 hover:text-white/60 transition-colors">
          <ChevronDown className="w-8 h-8" />
        </button>
      </div>
    </section>
  )
}
