import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  X, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2,
  TrendingUp, Shield, Zap, Globe
} from 'lucide-react'
import { login } from '../api/auth'
import logo from '../assets/logo.png'
import * as Yup from 'yup'
import toast from 'react-hot-toast'

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
})

const Login = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectAfterLogin = searchParams.get('redirect')
  const [activeTab, setActiveTab] = useState('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  // Detect mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError('')
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})
    
    try {
      // Validate form data with Yup
      await loginSchema.validate(formData, { abortEarly: false })
      
      const response = await login(formData)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      toast.success('Login successful! Welcome back.')
      const safeRedirect =
        redirectAfterLogin &&
        redirectAfterLogin.startsWith('/') &&
        !redirectAfterLogin.startsWith('//')
          ? redirectAfterLogin
          : null
      if (safeRedirect) {
        navigate(safeRedirect)
      } else if (isMobile) {
        navigate('/mobile')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = {}
        err.inner.forEach((e) => {
          errors[e.path] = e.message
        })
        setFieldErrors(errors)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background — gold mesh + grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#D9A136]/20 via-[#D9A136]/8 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#F0C96F]/15 via-[#D9A136]/8 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-[#b8892a]/10 via-transparent to-transparent blur-3xl" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(217,161,54,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(217,161,54,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />
      </div>

      {/* Close button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-5 right-5 z-20 w-10 h-10 bg-white/5 backdrop-blur-md border border-[#D9A136]/20 rounded-full flex items-center justify-center hover:bg-[#D9A136]/10 hover:border-[#D9A136]/40 transition-all"
        aria-label="Close"
      >
        <X size={18} className="text-gray-300" />
      </button>

      <div className="relative z-10 min-h-screen flex">
        {/* LEFT — Branding panel (desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between p-12 xl:p-16 relative">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="BULL4X" className="h-12 object-contain" />
            <div>
              <p className="text-white font-bold text-lg leading-none tracking-tight">BULL4X</p>
              <p className="text-[#D9A136] text-[10px] uppercase tracking-[0.2em] mt-1">Trading Platform</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D9A136]/10 border border-[#D9A136]/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#F0C96F] animate-pulse" />
              <span className="text-[#F0C96F] text-xs font-medium tracking-wider uppercase">Markets Open · Live</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-5 tracking-tight">
              Trade global markets with{' '}
              <span className="bg-gradient-to-r from-[#F0C96F] via-[#D9A136] to-[#b8892a] bg-clip-text text-transparent">
                institutional precision
              </span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">
              60+ instruments across forex, crypto, indices and commodities — with millisecond execution and transparent pricing.
            </p>

            {/* Feature pills */}
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {[
                { Icon: Zap, label: 'Sub-1ms Execution' },
                { Icon: Shield, label: 'Bank-Grade Security' },
                { Icon: TrendingUp, label: 'Raw ECN Spreads' },
                { Icon: Globe, label: 'Global Markets' },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-[#D9A136]/10 backdrop-blur-sm hover:border-[#D9A136]/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#D9A136]/10 border border-[#D9A136]/20 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-[#D9A136]" strokeWidth={2} />
                  </div>
                  <span className="text-gray-300 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>© 2026 BULL4X</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <Link to="/legal/privacy" className="hover:text-[#D9A136] transition-colors">Privacy</Link>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <Link to="/legal/terms" className="hover:text-[#D9A136] transition-colors">Terms</Link>
          </div>
        </div>

        {/* RIGHT — Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="flex lg:hidden justify-center mb-8">
              <img src={logo} alt="BULL4X" className="h-14 object-contain" />
            </div>

            {/* Card */}
            <div className="relative">
              {/* Gold glow behind card */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#D9A136]/30 via-transparent to-[#F0C96F]/20 rounded-3xl blur-xl opacity-50" />

              <div className="relative bg-black/60 backdrop-blur-xl border border-[#D9A136]/20 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/50">
                {/* Tabs */}
                <div className="relative flex bg-black/40 rounded-full p-1 w-full mb-7 border border-[#D9A136]/10">
                  <Link
                    to="/user/signup"
                    className="flex-1 text-center px-6 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Sign up
                  </Link>
                  <button
                    onClick={() => setActiveTab('signin')}
                    className={`flex-1 px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                      activeTab === 'signin'
                        ? 'bg-gradient-to-r from-[#D9A136] to-[#F0C96F] text-black shadow-lg shadow-[#D9A136]/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Sign in
                  </button>
                </div>

                {/* Heading */}
                <div className="mb-7">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
                    Welcome <span className="bg-gradient-to-r from-[#F0C96F] to-[#D9A136] bg-clip-text text-transparent">back</span>
                  </h1>
                  <p className="text-gray-400 text-sm">Sign in to continue trading.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D9A136] transition-colors pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full bg-black/40 border rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:bg-black/60 transition-all ${
                          fieldErrors.email
                            ? 'border-red-500/50 focus:border-red-500'
                            : 'border-[#D9A136]/15 focus:border-[#D9A136]/60 focus:ring-2 focus:ring-[#D9A136]/20'
                        }`}
                      />
                    </div>
                    {fieldErrors.email && <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldErrors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Password
                      </label>
                      <Link
                        to="/user/forgot-password"
                        className="text-[11px] font-medium text-[#D9A136] hover:text-[#F0C96F] transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative group">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D9A136] transition-colors pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full bg-black/40 border rounded-xl pl-11 pr-12 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:bg-black/60 transition-all ${
                          fieldErrors.password
                            ? 'border-red-500/50 focus:border-red-500'
                            : 'border-[#D9A136]/15 focus:border-[#D9A136]/60 focus:ring-2 focus:ring-[#D9A136]/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#D9A136] transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldErrors.password}</p>}
                  </div>

                  {/* Top-level error */}
                  {error && (
                    <div className="px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden bg-gradient-to-r from-[#D9A136] to-[#F0C96F] hover:from-[#F0C96F] hover:to-[#D9A136] text-black font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#D9A136]/25 hover:shadow-[#D9A136]/40 mt-2 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-[#D9A136]/15" />
                  <span className="text-[11px] text-gray-500 uppercase tracking-wider">New here?</span>
                  <div className="flex-1 h-px bg-[#D9A136]/15" />
                </div>

                {/* Sign up CTA */}
                <Link
                  to="/user/signup"
                  className="block text-center w-full py-3 rounded-xl border border-[#D9A136]/20 hover:border-[#D9A136]/50 hover:bg-[#D9A136]/5 text-gray-300 hover:text-[#F0C96F] text-sm font-medium transition-all"
                >
                  Create a free account
                </Link>
              </div>
            </div>

            {/* Mobile footer */}
            <div className="flex lg:hidden items-center justify-center gap-3 mt-8 text-[11px] text-gray-500">
              <Link to="/legal/privacy" className="hover:text-[#D9A136] transition-colors">Privacy</Link>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <Link to="/legal/terms" className="hover:text-[#D9A136] transition-colors">Terms</Link>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>© 2026 BULL4X</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
