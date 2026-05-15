import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  X, Mail, ChevronDown, Search, Eye, EyeOff, RefreshCw, ArrowLeft,
  ArrowRight, Loader2, User, Phone, MapPin, Lock,
  TrendingUp, Shield, Zap, Globe, CheckCircle2
} from 'lucide-react'
import { signup } from '../api/auth'
import { API_URL } from '../config/api'
import logo from '../assets/logo.png'
import * as Yup from 'yup'
import toast from 'react-hot-toast'

const signupSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]+$/, 'Phone number must contain only digits')
    .min(10, 'Phone number must be at least 10 digits')
    .required('Phone number is required'),
  address: Yup.string()
    .min(5, 'Address must be at least 5 characters')
    .required('Address is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
})

const countries = [
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+977', name: 'Nepal', flag: '🇳🇵' },
]

const Signup = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get('ref')
  const [activeTab, setActiveTab] = useState('signup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(countries[3])
  const dropdownRef = useRef(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [otpRequired, setOtpRequired] = useState(false)
  const [otpStep, setOtpStep] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    phone: '',
    countryCode: '+91',
    address: '',
    password: ''
  })
  
  // Detect mobile view
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.includes(countrySearch)
  )

  const handleCountrySelect = (country) => {
    setSelectedCountry(country)
    setFormData({ ...formData, countryCode: country.code })
    setShowCountryDropdown(false)
    setCountrySearch('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError('')
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' })
    }
  }

  // Check if OTP is required on mount
  useEffect(() => {
    const checkOtpSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/otp-settings`)
        const data = await res.json()
        if (data.success) {
          setOtpRequired(data.otpEnabled)
        }
      } catch (error) {
        console.error('Error checking OTP settings:', error)
      }
    }
    checkOtpSettings()
  }, [])

  // Send OTP
  const handleSendOtp = async () => {
    if (!formData.email || !formData.firstName) {
      setError('Please enter your name and email first')
      return
    }

    setSendingOtp(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, firstName: formData.firstName })
      })
      const data = await res.json()

      if (data.success) {
        if (data.otpRequired) {
          setOtpStep(true)
          setOtpSent(true)
        } else {
          // OTP not required, proceed with signup
          setOtpVerified(true)
        }
      } else {
        setError(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      setError('Error sending OTP')
    }
    setSendingOtp(false)
  }

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setVerifyingOtp(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      })
      const data = await res.json()

      if (data.success) {
        setOtpVerified(true)
        setOtpStep(false)
      } else {
        setError(data.message || 'Invalid OTP')
      }
    } catch (error) {
      setError('Error verifying OTP')
    }
    setVerifyingOtp(false)
  }

  // Resend OTP
  const handleResendOtp = async () => {
    setOtp('')
    await handleSendOtp()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})
    
    try {
      // Validate form data with Yup
      await signupSchema.validate(formData, { abortEarly: false })
      
      // If OTP is required and not verified, send OTP and show verification screen
      if (otpRequired && !otpVerified) {
        
        // Send OTP
        const res = await fetch(`${API_URL}/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, firstName: formData.firstName })
        })
        const data = await res.json()
        
        if (data.success) {
          setOtpStep(true)
          setOtpSent(true)
        } else {
          setError(data.message || 'Failed to send OTP')
        }
        setLoading(false)
        return
      }

      // Create account (OTP verified or not required)
      const signupData = {
        ...formData,
        referralCode: referralCode || undefined,
        otpVerified: otpVerified
      }
      
      const response = await signup(signupData)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      // Also call register-referral API for backward compatibility
      if (referralCode && response.user?._id) {
        try {
          await fetch(`${API_URL}/ib/register-referral`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: response.user._id,
              referralCode: referralCode
            })
          })
          console.log('Referral registered:', referralCode)
        } catch (refError) {
          console.error('Error registering referral:', refError)
        }
      }
      
      toast.success('Account created successfully! Welcome to BULL4X.')
      // Redirect to mobile view on mobile devices
      if (isMobile) {
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

  // After OTP is verified, auto-submit the form
  useEffect(() => {
    if (otpVerified && otpStep === false) {
      // Trigger form submission
      const submitForm = async () => {
        setLoading(true)
        try {
          const signupData = {
            ...formData,
            referralCode: referralCode || undefined,
            otpVerified: true
          }
          
          const response = await signup(signupData)
          localStorage.setItem('token', response.token)
          localStorage.setItem('user', JSON.stringify(response.user))
          
          toast.success('Account created successfully! Welcome to BULL4X.')
          if (isMobile) {
            navigate('/mobile')
          } else {
            navigate('/dashboard')
          }
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      submitForm()
    }
  }, [otpVerified])

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background — gold mesh + grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#D9A136]/20 via-[#D9A136]/8 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#F0C96F]/15 via-[#D9A136]/8 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-[#b8892a]/10 via-transparent to-transparent blur-3xl" />
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
              <span className="text-[#F0C96F] text-xs font-medium tracking-wider uppercase">Join 50,000+ Traders</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-5 tracking-tight">
              Your gateway to{' '}
              <span className="bg-gradient-to-r from-[#F0C96F] via-[#D9A136] to-[#b8892a] bg-clip-text text-transparent">
                global markets
              </span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">
              Open a free account in 2 minutes. No deposit required to start. Trade forex, crypto, indices, commodities and stocks — all from one platform.
            </p>

            {/* Why join */}
            <div className="space-y-3 max-w-md">
              {[
                'Instant account activation — no waiting',
                'Free demo account with $10,000 virtual funds',
                'Tight spreads from 0.0 pips on ECN accounts',
                'Bank-grade security & segregated funds',
              ].map((reason) => (
                <div key={reason} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#D9A136]/15 border border-[#D9A136]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={12} className="text-[#D9A136]" />
                  </div>
                  <span className="text-gray-300 text-sm">{reason}</span>
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
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 py-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="flex lg:hidden justify-center mb-8">
              <img src={logo} alt="BULL4X" className="h-14 object-contain" />
            </div>

            {/* Card */}
            <div className="relative">
              {/* Gold glow behind card */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#D9A136]/30 via-transparent to-[#F0C96F]/20 rounded-3xl blur-xl opacity-50" />

              <div className="relative bg-black/60 backdrop-blur-xl border border-[#D9A136]/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
                {/* Tabs */}
                <div className="relative flex bg-black/40 rounded-full p-1 w-full mb-7 border border-[#D9A136]/10">
                  <button
                    onClick={() => setActiveTab('signup')}
                    className={`flex-1 px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                      activeTab === 'signup'
                        ? 'bg-gradient-to-r from-[#D9A136] to-[#F0C96F] text-black shadow-lg shadow-[#D9A136]/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Sign up
                  </button>
                  <Link
                    to="/user/login"
                    className="flex-1 text-center px-6 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                </div>

                {/* Heading */}
                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
                    {otpStep ? (
                      <>Verify your <span className="bg-gradient-to-r from-[#F0C96F] to-[#D9A136] bg-clip-text text-transparent">email</span></>
                    ) : (
                      <>Create your <span className="bg-gradient-to-r from-[#F0C96F] to-[#D9A136] bg-clip-text text-transparent">account</span></>
                    )}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {otpStep ? 'Enter the 6-digit code we sent you.' : 'Open a free trading account in under 2 minutes.'}
                  </p>
                </div>

                {/* OTP Verification Step */}
                {otpStep ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => { setOtpStep(false); setOtp(''); setError('') }}
                      className="inline-flex items-center gap-2 text-gray-400 hover:text-[#D9A136] text-sm transition-colors"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>

                    <div className="p-3 rounded-lg bg-[#D9A136]/5 border border-[#D9A136]/20">
                      <p className="text-gray-300 text-sm">
                        OTP sent to <span className="text-[#F0C96F] font-medium">{formData.email}</span>
                      </p>
                    </div>

                    <input
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                      maxLength={6}
                      className="w-full bg-black/40 border border-[#D9A136]/15 focus:border-[#D9A136]/60 focus:ring-2 focus:ring-[#D9A136]/20 rounded-xl px-4 py-4 text-white text-center text-3xl tracking-[0.5em] placeholder-gray-700 focus:outline-none transition-all font-mono"
                    />

                    {error && (
                      <div className="px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otp.length !== 6}
                      className="group w-full bg-gradient-to-r from-[#D9A136] to-[#F0C96F] hover:from-[#F0C96F] hover:to-[#D9A136] text-black font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D9A136]/25 hover:shadow-[#D9A136]/40 flex items-center justify-center gap-2"
                    >
                      {verifyingOtp ? (
                        <><Loader2 size={18} className="animate-spin" /> Verifying...</>
                      ) : (
                        <>Verify OTP <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </button>

                    <button
                      onClick={handleResendOtp}
                      disabled={sendingOtp}
                      className="w-full text-gray-400 hover:text-[#D9A136] text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {sendingOtp ? <><RefreshCw size={14} className="animate-spin" /> Sending...</> : "Didn't receive? Resend OTP"}
                    </button>
                  </div>
                ) : (
                  /* Form */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <div className="relative group">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D9A136] transition-colors pointer-events-none" />
                        <input
                          type="text"
                          name="firstName"
                          placeholder="John Smith"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`w-full bg-black/40 border rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:bg-black/60 transition-all ${
                            fieldErrors.firstName
                              ? 'border-red-500/50 focus:border-red-500'
                              : 'border-[#D9A136]/15 focus:border-[#D9A136]/60 focus:ring-2 focus:ring-[#D9A136]/20'
                          }`}
                        />
                      </div>
                      {fieldErrors.firstName && <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldErrors.firstName}</p>}
                    </div>

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

                    {/* Phone with country code */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Phone Number
                      </label>
                      <div className="flex relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className={`flex items-center gap-1.5 sm:gap-2 bg-black/40 border rounded-l-xl px-3 py-3 border-r-0 hover:bg-black/60 transition-colors min-w-[80px] sm:min-w-[100px] ${
                            fieldErrors.phone ? 'border-red-500/50' : 'border-[#D9A136]/15'
                          }`}
                        >
                          <span className="text-base sm:text-lg">{selectedCountry.flag}</span>
                          <span className="text-gray-300 text-xs sm:text-sm hidden sm:inline">{selectedCountry.code}</span>
                          <ChevronDown size={14} className="text-gray-500 ml-auto sm:ml-0" />
                        </button>

                        {/* Country Dropdown */}
                        {showCountryDropdown && (
                          <div className="absolute top-full left-0 mt-2 w-72 bg-black/95 backdrop-blur-xl border border-[#D9A136]/20 rounded-xl shadow-2xl z-50 max-h-72 overflow-hidden">
                            <div className="p-2 border-b border-[#D9A136]/10">
                              <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                  type="text"
                                  placeholder="Search country..."
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                  className="w-full bg-black/40 border border-[#D9A136]/15 focus:border-[#D9A136]/50 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="max-h-52 overflow-y-auto">
                              {filteredCountries.map((country, index) => (
                                <button
                                  key={`${country.code}-${index}`}
                                  type="button"
                                  onClick={() => handleCountrySelect(country)}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#D9A136]/10 transition-colors text-left"
                                >
                                  <span className="text-lg">{country.flag}</span>
                                  <span className="text-white text-sm flex-1 truncate">{country.name}</span>
                                  <span className="text-gray-400 text-sm">{country.code}</span>
                                </button>
                              ))}
                              {filteredCountries.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-3">No countries found</p>
                              )}
                            </div>
                          </div>
                        )}

                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`flex-1 bg-black/40 border rounded-r-xl px-3 sm:px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:bg-black/60 transition-all min-w-0 ${
                            fieldErrors.phone
                              ? 'border-red-500/50 focus:border-red-500'
                              : 'border-[#D9A136]/15 focus:border-[#D9A136]/60 focus:ring-2 focus:ring-[#D9A136]/20'
                          }`}
                        />
                      </div>
                      {fieldErrors.phone && <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldErrors.phone}</p>}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Address
                      </label>
                      <div className="relative group">
                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D9A136] transition-colors pointer-events-none" />
                        <input
                          type="text"
                          name="address"
                          placeholder="City, Country"
                          value={formData.address}
                          onChange={handleChange}
                          className={`w-full bg-black/40 border rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:bg-black/60 transition-all ${
                            fieldErrors.address
                              ? 'border-red-500/50 focus:border-red-500'
                              : 'border-[#D9A136]/15 focus:border-[#D9A136]/60 focus:ring-2 focus:ring-[#D9A136]/20'
                          }`}
                        />
                      </div>
                      {fieldErrors.address && <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldErrors.address}</p>}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Password
                      </label>
                      <div className="relative group">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D9A136] transition-colors pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          placeholder="At least 6 characters"
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
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Terms */}
                <p className="text-center text-gray-500 text-xs mt-6 leading-relaxed">
                  By creating an account, you agree to our{' '}
                  <Link to="/legal/terms" className="text-[#D9A136] hover:text-[#F0C96F] transition-colors">Terms</Link>
                  {' '}and{' '}
                  <Link to="/legal/privacy" className="text-[#D9A136] hover:text-[#F0C96F] transition-colors">Privacy Policy</Link>.
                </p>
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

export default Signup
