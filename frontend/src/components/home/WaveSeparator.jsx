import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function WaveSeparator({ 
  variant = 'default', 
  flip = false,
  color = '#0a0f1a',
  nextColor = '#080c14'
}) {
  const waveRef = useRef(null)
  const pathRef = useRef(null)

  useEffect(() => {
    if (pathRef.current) {
      // Animate the wave path
      gsap.to(pathRef.current, {
        attr: { d: getAnimatedPath(variant) },
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })
    }
  }, [variant])

  const getPath = (type) => {
    switch(type) {
      case 'trading':
        // Trading chart style wave
        return 'M0,64 L48,80 L96,32 L144,96 L192,48 L240,72 L288,24 L336,88 L384,56 L432,40 L480,64 L528,80 L576,32 L624,96 L672,48 L720,72 L768,24 L816,88 L864,56 L912,40 L960,64 L1008,80 L1056,32 L1104,96 L1152,48 L1200,72 L1248,24 L1296,88 L1344,56 L1392,40 L1440,64 L1440,150 L0,150 Z'
      case 'crypto':
        // Crypto candlestick inspired
        return 'M0,80 C120,40 240,100 360,60 C480,20 600,90 720,50 C840,10 960,80 1080,40 C1200,0 1320,70 1440,30 L1440,150 L0,150 Z'
      case 'smooth':
        // Smooth flowing wave
        return 'M0,64 C180,120 360,0 540,64 C720,128 900,0 1080,64 C1260,128 1350,32 1440,64 L1440,150 L0,150 Z'
      case 'sharp':
        // Sharp angular wave
        return 'M0,50 L180,90 L360,30 L540,70 L720,20 L900,80 L1080,40 L1260,100 L1440,50 L1440,150 L0,150 Z'
      default:
        // Default wave
        return 'M0,96 C320,160 420,0 740,96 C1060,192 1140,0 1440,96 L1440,150 L0,150 Z'
    }
  }

  const getAnimatedPath = (type) => {
    switch(type) {
      case 'trading':
        return 'M0,80 L48,48 L96,64 L144,32 L192,80 L240,40 L288,72 L336,24 L384,88 L432,56 L480,80 L528,48 L576,64 L624,32 L672,80 L720,40 L768,72 L816,24 L864,88 L912,56 L960,80 L1008,48 L1056,64 L1104,32 L1152,80 L1200,40 L1248,72 L1296,24 L1344,88 L1392,56 L1440,80 L1440,150 L0,150 Z'
      case 'crypto':
        return 'M0,40 C120,80 240,20 360,80 C480,140 600,30 720,90 C840,150 960,40 1080,100 C1200,160 1320,50 1440,80 L1440,150 L0,150 Z'
      case 'smooth':
        return 'M0,96 C180,32 360,128 540,64 C720,0 900,128 1080,64 C1260,0 1350,96 1440,64 L1440,150 L0,150 Z'
      case 'sharp':
        return 'M0,80 L180,30 L360,90 L540,20 L720,70 L900,10 L1080,80 L1260,40 L1440,80 L1440,150 L0,150 Z'
      default:
        return 'M0,64 C320,0 420,128 740,64 C1060,0 1140,128 1440,64 L1440,150 L0,150 Z'
    }
  }

  return (
    <div 
      ref={waveRef}
      className={`relative w-full h-[100px] md:h-[150px] overflow-hidden ${flip ? 'rotate-180' : ''}`}
      style={{ marginTop: flip ? 0 : '-1px', marginBottom: flip ? '-1px' : 0 }}
    >
      {/* Gradient background */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(to bottom, ${color}, ${nextColor})`
        }}
      />
      
      {/* Main wave */}
      <svg
        className="absolute bottom-0 w-full h-full"
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`waveGradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Background wave layer */}
        <path
          d={getPath(variant)}
          fill={nextColor}
          className="opacity-100"
        />
        
        {/* Animated accent wave */}
        <path
          ref={pathRef}
          d={getPath(variant)}
          fill={`url(#waveGradient-${variant})`}
          className="opacity-50"
        />
      </svg>

      {/* Trading line accent */}
      {variant === 'trading' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg className="w-full h-12 opacity-20" viewBox="0 0 1440 48" preserveAspectRatio="none">
            <path
              d="M0,24 L100,30 L200,18 L300,36 L400,12 L500,28 L600,20 L700,32 L800,16 L900,26 L1000,22 L1100,34 L1200,14 L1300,30 L1440,24"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              className="animate-pulse"
            />
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
    </div>
  )
}
