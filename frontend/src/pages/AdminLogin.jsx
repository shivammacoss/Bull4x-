import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Mail, Shield, UserCog, KeyRound } from 'lucide-react'
import { API_URL } from '../config/api'
import logo from '../assets/logo.png'
import toast from 'react-hot-toast'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [showOtpScreen, setShowOtpScreen] = useState(false)
  const [otp, setOtp] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('Email is required')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch(`${API_URL}/admin-mgmt/send-login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      
      if (data.success) {
        setShowOtpScreen(true)
        toast.success('OTP sent to your email!')
      } else {
        setError(data.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch(`${API_URL}/admin-mgmt/verify-login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      const data = await res.json()
      
      if (data.success) {
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminUser', JSON.stringify(data.admin))
        toast.success('Admin login successful!')
        navigate('/admin/dashboard')
      } else {
        setError(data.message || 'Invalid OTP')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  const handleResendOtp = async () => {
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch(`${API_URL}/admin-mgmt/send-login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success('OTP resent to your email!')
      } else {
        setError(data.message || 'Failed to resend OTP')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-cyan-500/20 via-blue-500/20 to-transparent rounded-full blur-3xl" />
      
      <div className="relative bg-dark-700 rounded-2xl p-6 sm:p-8 w-full max-w-md border border-gray-800 mx-4 sm:mx-0">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 w-8 h-8 bg-dark-600 rounded-full flex items-center justify-center hover:bg-dark-500 transition-colors"
        >
          <X size={16} className="text-gray-400" />
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Unicap" className="h-12 object-contain" />
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            Super Admin Portal
          </div>
        </div>

        {/* Login Type Toggle - Navigate to different pages */}
        <div className="flex gap-2 mb-6 p-1 bg-dark-600 rounded-lg">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
          >
            <Shield size={16} />
            Super Admin
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin-employee')}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors text-gray-400 hover:text-white"
          >
            <UserCog size={16} />
            Employee
          </button>
        </div>

        {!showOtpScreen ? (
          <>
            <h1 className="text-2xl font-semibold text-white mb-2">Super Admin Login</h1>
            <p className="text-gray-500 text-sm mb-6">Enter your email to receive OTP</p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="w-full bg-dark-600 border border-gray-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full text-white font-medium py-3 rounded-lg transition-colors mt-2 disabled:opacity-50 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-white mb-2">Verify OTP</h1>
            <p className="text-gray-500 text-sm mb-6">Enter the 6-digit OTP sent to {email}</p>

            <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
              <div>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-dark-600 border border-gray-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-center text-xl tracking-widest"
                    maxLength={6}
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full text-white font-medium py-3 rounded-lg transition-colors mt-2 disabled:opacity-50 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => { setShowOtpScreen(false); setOtp(''); setError(''); }}
                className="text-gray-400 hover:text-white text-sm"
              >
                ← Back
              </button>
              <button
                onClick={handleResendOtp}
                disabled={loading}
                className="text-blue-400 hover:text-blue-300 text-sm disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          </>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Not an admin?{' '}
          <button onClick={() => navigate('/user/login')} className="text-white hover:underline">
            User Login
          </button>
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
