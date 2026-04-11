import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  TrendingUp, 
  Shield, 
  Users, 
  Zap, 
  BarChart3, 
  Globe, 
  CheckCircle,
  Star,
  Menu,
  X,
} from 'lucide-react'

// Import here Logos and Videos
import logo from '../assets/logo.png'
import heroVideo from '../assets/hero_video.mp4'
import { DOMAINS } from '../config/api'

const HomePage = () => {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [scrollY, setScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Advanced Trading',
      description: 'Access forex, crypto, and commodities with real-time market data and lightning-fast execution.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Platform',
      description: 'Bank-grade security with 256-bit encryption protecting your funds and personal data.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Copy Trading',
      description: 'Follow and copy successful traders automatically. Earn while you learn from the best.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Instant Execution',
      description: 'Ultra-low latency order execution with spreads starting from 0.0 pips.'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'IB Program',
      description: 'Earn unlimited commissions through our 18-level referral program.'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help you succeed in your trading journey.'
    }
  ]

  const stats = [
    { value: '$2.5B+', label: 'Trading Volume' },
    { value: '150K+', label: 'Active Traders' },
    { value: '99.9%', label: 'Uptime' },
    { value: '0.001s', label: 'Execution Speed' }
  ]

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Professional Trader',
      content: 'BULL4X has transformed my trading experience. The platform is incredibly fast and reliable.',
      rating: 5
    },
    {
      name: 'Sarah Johnson',
      role: 'Copy Trader',
      content: 'I started with copy trading and now I\'m earning consistent profits. Best decision I ever made!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'IB Partner',
      content: 'The IB program is amazing. I\'ve built a passive income stream just by referring traders.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${scrollY > 50 ? 'bg-black/90 backdrop-blur-lg border-b border-gray-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src={logo} alt="BULL4X" className="h-12 object-contain" />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#stats" className="text-gray-300 hover:text-white transition-colors">Stats</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
            </div>
            {/* Desktop buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => window.location.href = '/user/login'}
                className="bg-sky-400 hover:bg-sky-500 text-white px-6 py-2.5 rounded-full font-medium transition-all transform hover:scale-105"
              >
                Login
              </button>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 via-cyan-500 via-green-500 via-yellow-500 to-pink-500 rounded-full bg-[length:400%_100%] animate-rainbow blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <button 
                  onClick={() => window.location.href = '/user/signup'}
                  className="relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-full font-medium transition-all transform hover:scale-105"
                >
                  Get Started
                </button>
              </div>
            </div>
            {/* Mobile hamburger button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[55] md:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-20 left-0 right-0 bg-gray-900 border-b border-gray-800 p-6">
            <div className="flex flex-col gap-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors py-2">Features</a>
              <a href="#stats" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors py-2">Stats</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors py-2">Testimonials</a>
              <hr className="border-gray-700 my-2" />
              <button 
                onClick={() => { setMobileMenuOpen(false); window.location.href = '/user/login'; }}
                className="bg-sky-400 hover:bg-sky-500 text-white px-6 py-3 rounded-full font-medium transition-all w-full"
              >
                Login
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); window.location.href = '/user/signup'; }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-full font-medium transition-all w-full"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Video */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            webkit-playsinline="true"
            className="absolute top-0 left-0 w-full h-full object-cover"
            style={{ 
              minWidth: '100%', 
              minHeight: '100%',
              width: 'auto',
              height: 'auto'
            }}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
        </div>

      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose <span className="text-blue-500">BULL4X</span>?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We provide everything you need to succeed in the financial markets
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 mb-4 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Trusted by Traders <span className="text-blue-500">Worldwide</span>
              </h2>
              <p className="text-gray-400 mb-8">
                Join thousands of successful traders who have chosen BULL4X as their preferred trading platform. 
                Our commitment to excellence and innovation sets us apart.
              </p>
              <ul className="space-y-4">
                {['Regulated & Licensed', 'Segregated Client Funds', 'Negative Balance Protection', 'Free Demo Account'].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              What Our <span className="text-blue-500">Traders</span> Say
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Real stories from real traders who have achieved success with BULL4X
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Start Your Trading Journey?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join BULL4X today and get access to world-class trading tools, 
            educational resources, and 24/7 support.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-400 via-teal-400 to-cyan-400 rounded-full bg-[length:400%_100%] animate-rainbow blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <button 
                onClick={() => window.location.href = '/user/signup'}
                className="relative bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 bg-[length:200%_100%] animate-gradient-x text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105"
              >
                Create Free Account
              </button>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 via-cyan-400 via-blue-400 to-teal-400 rounded-full bg-[length:400%_100%] animate-rainbow blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <button 
                onClick={() => window.location.href = '/user/login'}
                className="relative bg-gradient-to-r from-teal-500 via-blue-500 to-cyan-500 bg-[length:200%_100%] animate-gradient-x text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src={logo} alt="BULL4X" className="h-10 object-contain mb-4" />
              <p className="text-gray-400 text-sm">
                Your trusted partner in forex and crypto trading. Trade with confidence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Trading</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Forex Trading</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Crypto Trading</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Copy Trading</a></li>
                <li><a href="#" className="hover:text-white transition-colors">IB Program</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/legal/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="/legal/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/legal/risk-disclosure" className="hover:text-white transition-colors">Risk Disclosure</a></li>
                <li><a href="/legal/ib-agreement" className="hover:text-white transition-colors">IB Agreement</a></li>
                <li><a href="/legal/funding-rules" className="hover:text-white transition-colors">Funding Rules</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-gray-300">BULL4X</strong> (previously known as UC Markets - ucmarkets.com) is the trading name of BULL4X LLC, which is Registered in Saint Vincent and the Grenadines through registration number 3766 LLC 2024.
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-gray-300">Risk Warning:</strong> Trading in securities involves significant risk. Prices may fluctuate and securities can become entirely valueless. You may incur losses that exceed your potential profits, and in some cases, losses may exceed the amount you have deposited. Securities, futures, options, and contracts for differences are complex financial instruments and are not suitable for all investors. Engaging in such transactions requires a sound understanding of the associated risks. Please read and ensure you fully understand our Risk Disclosure. Our leverage is dynamic and may change at any time. Such changes may affect your positions and margin requirements. You are responsible for monitoring your positions and maintaining sufficient margin at all times.
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-gray-300">Restricted Countries:</strong> BULL4X LLC does not provide services for residents of certain countries such as the United States of America, Canada, New Zealand, Iran and North Korea (Democratic People's Republic of Korea) or a country where such distribution or use would be contrary to local law or regulation.
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400 leading-relaxed">
                You must be 18 years old, or of legal age as determined in your country. Upon registering an account with BULL4X LLC, you acknowledge that you are registering at your own free will, without solicitation on behalf of BULL4X LLC. BULL4X LLC does not direct its website and services to any individual in any country in which the use of its website and services are prohibited by local laws or regulations. When accessing this website from a country in which its use may or may not be prohibited, it is the user's responsibility to ensure that any use of the website or services adheres to local laws or regulations. BULL4X LLC does not affirm that the information on its website is suitable for all jurisdictions.
              </p>
            </div>
            
            <div className="text-center pt-4">
              <p className="text-xs text-gray-500"> 2026 BULL4X LLC. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  )
}

export default HomePage