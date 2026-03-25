import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, MessageSquare, Headphones, ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const navigate = useNavigate()
  const sectionRef = useRef(null)
  const bannerRef = useRef(null)
  const cardsRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(bannerRef.current,
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: bannerRef.current, start: 'top 85%', toggleActions: 'play none none reverse' }
        }
      )
      gsap.fromTo(cardsRef.current.children,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 85%', toggleActions: 'play none none reverse' }
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="contact" className="py-24 bg-[#0a0f1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA Banner */}
        <div ref={bannerRef} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-600 p-12 md:p-16">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Start Trading?
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Join thousands of traders who trust Unicap for their trading journey. Get started in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/user/signup')}
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-white/90 transition-all duration-300 flex items-center gap-2 group"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/buy-challenge')}
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                Get Funded Now
              </button>
            </div>
          </div>
        </div>

        {/* Contact options */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-8 bg-white/[0.02] border border-white/10 rounded-2xl text-center hover:border-blue-500/30 transition-all">
            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Email Support</h3>
            <p className="text-white/50 mb-4">Get help via email within 24 hours</p>
            <a href="mailto:support@unicapmarkets.com" className="text-blue-400 hover:text-blue-300 transition-colors">
              support@unicapmarkets.com
            </a>
          </div>

          <div className="p-8 bg-white/[0.02] border border-white/10 rounded-2xl text-center hover:border-emerald-500/30 transition-all">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Live Chat</h3>
            <p className="text-white/50 mb-4">Chat with our team in real-time</p>
            <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Start Chat →
            </button>
          </div>

          <div className="p-8 bg-white/[0.02] border border-white/10 rounded-2xl text-center hover:border-purple-500/30 transition-all">
            <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">24/7 Support</h3>
            <p className="text-white/50 mb-4">We're here around the clock</p>
            <span className="text-purple-400">Always Available</span>
          </div>
        </div>
      </div>
    </section>
  )
}
