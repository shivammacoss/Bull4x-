import { useNavigate } from 'react-router-dom'
import { Mail, Phone, MapPin, Twitter, Linkedin, Instagram, Send } from 'lucide-react'
import logoImage from '../../assets/logo.png'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-[#060a10] border-t border-white/5">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <img src={logoImage} alt="BULL4X" className="h-10 w-auto mb-6" />
            <p className="text-white/50 mb-6 max-w-sm leading-relaxed">
              Your trusted partner in global trading. Access forex, crypto, indices, and commodities with professional tools and funded accounts.
            </p>
            {/* Social links */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all">
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><button onClick={() => navigate('/user/login')} className="text-white/50 hover:text-white transition-colors">Login</button></li>
              <li><button onClick={() => navigate('/user/signup')} className="text-white/50 hover:text-white transition-colors">Sign Up</button></li>
              <li><button onClick={() => navigate('/buy-challenge')} className="text-white/50 hover:text-white transition-colors">Get Funded</button></li>
              <li><button onClick={() => navigate('/ib')} className="text-white/50 hover:text-white transition-colors">IB Program</button></li>
              <li><button onClick={() => navigate('/copytrade')} className="text-white/50 hover:text-white transition-colors">Copy Trading</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><button onClick={() => navigate('/privacy-policy')} className="text-white/50 hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/terms-of-service')} className="text-white/50 hover:text-white transition-colors">Terms of Service</button></li>
              <li><button onClick={() => navigate('/terms-of-service')} className="text-white/50 hover:text-white transition-colors">Risk Disclosure</button></li>
              <li><button onClick={() => navigate('/account-deletion')} className="text-white/50 hover:text-white transition-colors">Account Deletion</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white/50">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>support@bull4x.com</span>
              </li>
              <li className="flex items-center gap-3 text-white/50">
                <Phone className="w-5 h-5 text-blue-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3 text-white/50">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>123 Trading Street, Financial District</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">
              © {new Date().getFullYear()} BULL4X. All rights reserved.
            </p>
            <p className="text-white/30 text-xs text-center md:text-right max-w-2xl">
              Trading involves significant risk. Past performance is not indicative of future results. Only trade with capital you can afford to lose.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
