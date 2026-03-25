import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import logoImage from '../../assets/logo.png'

const navLinks = [
  { name: 'Home', href: '#hero' },
  { name: 'Forex', href: '#forex' },
  { name: 'Funding', href: '#funding' },
  { name: 'About Us', href: '#about' },
  { name: 'Contact', href: '#contact' },
]

export default function Navigation({ scrollY = 0 }) {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isScrolled = scrollY > 50

  const handleNavClick = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(href)
    }
    setIsMenuOpen(false)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img src={logoImage} alt="Unicap" className="h-10 w-auto" />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate('/user/login')}
              className="px-4 py-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/user/signup')}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all text-sm"
            >
              Get Started
            </button>
          </div>

          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-white/10">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.name}
              </button>
            ))}
            <div className="pt-4 space-y-2 border-t border-white/10">
              <button
                onClick={() => { navigate('/user/login'); setIsMenuOpen(false) }}
                className="block w-full text-center px-4 py-3 text-white/80 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => { navigate('/user/signup'); setIsMenuOpen(false) }}
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
