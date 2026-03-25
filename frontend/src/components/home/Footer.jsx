import { useNavigate } from 'react-router-dom'
import logoImage from '../../assets/logo.png'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-gray-900 border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <img src={logoImage} alt="Unicap" className="h-10 w-auto mb-4" />
            <p className="text-white/60 text-sm">
              Your trusted partner in global trading and investment.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/user/login')} className="text-white/60 hover:text-white text-sm transition-colors">Login</button></li>
              <li><button onClick={() => navigate('/user/signup')} className="text-white/60 hover:text-white text-sm transition-colors">Sign Up</button></li>
              <li><button onClick={() => navigate('/buy-challenge')} className="text-white/60 hover:text-white text-sm transition-colors">Get Funded</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/privacy-policy')} className="text-white/60 hover:text-white text-sm transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/terms-of-service')} className="text-white/60 hover:text-white text-sm transition-colors">Terms of Service</button></li>
              <li><button onClick={() => navigate('/legal/risk-disclosure')} className="text-white/60 hover:text-white text-sm transition-colors">Risk Disclosure</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-white/60 text-sm">
              <li>support@unicapmarkets.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Unicap Markets. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
