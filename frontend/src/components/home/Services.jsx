import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Wallet, Users, Copy, ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const services = [
  {
    icon: TrendingUp,
    title: 'Forex Trading',
    description: 'Trade 60+ currency pairs with tight spreads, fast execution, and up to 1:500 leverage on our advanced platform.',
    features: ['Major & Minor Pairs', 'Tight Spreads', 'Fast Execution'],
    color: 'blue',
    href: '/user/signup'
  },
  {
    icon: Wallet,
    title: 'Prop Funding',
    description: 'Get funded with up to $100,000 trading capital. Prove your skills and keep up to 90% of your profits.',
    features: ['Up to $100K Capital', '90% Profit Split', 'No Risk to You'],
    color: 'emerald',
    href: '/buy-challenge'
  },
  {
    icon: Users,
    title: 'IB Partnership',
    description: 'Earn unlimited commissions by referring traders. Get real-time tracking and instant payouts.',
    features: ['High Commissions', 'Real-time Tracking', 'Instant Payouts'],
    color: 'purple',
    href: '/ib'
  },
  {
    icon: Copy,
    title: 'Copy Trading',
    description: 'Automatically copy trades from top-performing traders. No experience needed to start earning.',
    features: ['Auto Copy Trades', 'Top Traders', 'Passive Income'],
    color: 'orange',
    href: '/copytrade'
  }
]

const colorClasses = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    icon: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-500'
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    icon: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-500'
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20 hover:border-purple-500/40',
    icon: 'text-purple-400',
    gradient: 'from-purple-500 to-pink-500'
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20 hover:border-orange-500/40',
    icon: 'text-orange-400',
    gradient: 'from-orange-500 to-yellow-500'
  }
}

export default function Services() {
  const navigate = useNavigate()
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const cardsRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate header
      gsap.fromTo(headerRef.current.children,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      // Animate cards
      gsap.fromTo(cardsRef.current.children,
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="services" className="py-24 bg-[#0a0f1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-4">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            From trading to funding to partnerships — we provide all the tools and opportunities for your financial growth.
          </p>
        </div>

        {/* Services grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => {
            const colors = colorClasses[service.color]
            return (
              <div
                key={index}
                className={`group relative p-8 rounded-2xl border ${colors.border} bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.04] cursor-pointer`}
                onClick={() => navigate(service.href)}
              >
                {/* Icon */}
                <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className={`w-7 h-7 ${colors.icon}`} />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-white/60 mb-6 leading-relaxed">{service.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {service.features.map((feature, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white/5 rounded-full text-sm text-white/70"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className={`inline-flex items-center gap-2 text-sm font-medium bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
                  Learn More
                  <ArrowRight className={`w-4 h-4 ${colors.icon}`} />
                </div>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
