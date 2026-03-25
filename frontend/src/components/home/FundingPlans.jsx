import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Zap, Crown, Rocket } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const plans = [
  {
    name: 'Starter',
    capital: '$5,000',
    price: '$49',
    profitSplit: '80%',
    features: ['1-Step Evaluation', '8% Profit Target', '5% Daily Drawdown', '10% Max Drawdown', 'Unlimited Trading Days'],
    popular: false,
    icon: Zap
  },
  {
    name: 'Growth',
    capital: '$25,000',
    price: '$199',
    profitSplit: '85%',
    features: ['1-Step Evaluation', '8% Profit Target', '5% Daily Drawdown', '10% Max Drawdown', 'Unlimited Trading Days', 'Priority Support'],
    popular: true,
    icon: Rocket
  },
  {
    name: 'Prime',
    capital: '$100,000',
    price: '$499',
    profitSplit: '90%',
    features: ['1-Step Evaluation', '8% Profit Target', '5% Daily Drawdown', '10% Max Drawdown', 'Unlimited Trading Days', 'VIP Support', 'Scaling Plan'],
    popular: false,
    icon: Crown
  }
]

export default function FundingPlans() {
  const navigate = useNavigate()
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const cardsRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current.children,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 85%', toggleActions: 'play none none reverse' }
        }
      )
      gsap.fromTo(cardsRef.current.children,
        { y: 80, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: 'back.out(1.2)',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="funding" className="py-24 bg-[#0a0f1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-sm font-medium mb-4">
            Prop Funding
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Get Funded Up To{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              $100,000
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Prove your trading skills and trade with our capital. Keep up to 90% of your profits with zero risk to your own money.
          </p>
        </div>

        {/* Plans grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-blue-500/10 to-transparent border-blue-500/30 scale-105'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                plan.popular ? 'bg-blue-500/20' : 'bg-white/5'
              }`}>
                <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-blue-400' : 'text-white/60'}`} />
              </div>

              {/* Plan name */}
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>

              {/* Capital */}
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">{plan.capital}</span>
                <span className="text-white/50 ml-2">capital</span>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <span className="text-2xl font-bold text-emerald-400">{plan.price}</span>
                <span className="text-white/50 ml-2">one-time fee</span>
              </div>

              {/* Profit split highlight */}
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="text-sm text-emerald-400 mb-1">Profit Split</div>
                <div className="text-2xl font-bold text-white">{plan.profitSplit}</div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/70">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => navigate('/buy-challenge')}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12">
          <p className="text-white/50">
            All plans include free retakes and scaling opportunities. <span className="text-blue-400 cursor-pointer hover:underline">View all plans →</span>
          </p>
        </div>
      </div>
    </section>
  )
}
