import { useRef, useEffect } from 'react'
import { Star, Quote } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const testimonials = [
  {
    name: 'Michael Chen',
    role: 'Funded Trader',
    avatar: 'MC',
    content: 'Got funded with $50K in just 2 weeks. The platform is incredibly smooth and the support team is always there when you need them.',
    rating: 5,
    profit: '+$12,450'
  },
  {
    name: 'Sarah Williams',
    role: 'Professional Trader',
    avatar: 'SW',
    content: 'Best prop firm I\'ve worked with. Fast payouts, fair rules, and the 90% profit split is unbeatable in the industry.',
    rating: 5,
    profit: '+$28,900'
  },
  {
    name: 'David Kumar',
    role: 'IB Partner',
    avatar: 'DK',
    content: 'The IB program has been a game-changer for my income. Real-time tracking and weekly payouts make it so easy to grow.',
    rating: 5,
    profit: '+$8,200/mo'
  },
  {
    name: 'Emma Rodriguez',
    role: 'Copy Trader',
    avatar: 'ER',
    content: 'Started copy trading with zero experience. Now I\'m making consistent profits by following top traders on the platform.',
    rating: 5,
    profit: '+$4,500'
  }
]

export default function Testimonials() {
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
        { y: 60, opacity: 0, rotateX: 15 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 bg-[#080c14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Join our community of successful traders from around the world.
          </p>
        </div>

        {/* Testimonials grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-8 bg-white/[0.02] border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote className="w-10 h-10 text-purple-500/30 mb-4" />

              {/* Content */}
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-white/50">{testimonial.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">{testimonial.profit}</div>
                  <div className="text-xs text-white/40">Total Profit</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
