import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  X, Mail, Shield, UserCog, Lock, Eye, EyeOff,
  ArrowRight, Loader2, KeyRound, Users, FileCheck, LineChart
} from 'lucide-react'
import { API_URL } from '../config/api'
import logo from '../assets/logo.png'
import toast from 'react-hot-toast'

const EMPLOYEE_PATHS = ['/admin-employee', '/employee/login']

const AdminLogin = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isEmployeePortal = EMPLOYEE_PATHS.includes(location.pathname)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleAdminSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/admin-mgmt/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (data.success) {
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminUser', JSON.stringify(data.admin))
        toast.success('Admin login successful!')
        navigate('/admin/dashboard')
      } else {
        setError(data.message || 'Invalid credentials')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    setError('')

    const trimmedEmail = email.trim()

    try {
      // 1) Real Employee collection (employee-mgmt API)
      const empRes = await fetch(`${API_URL}/employee/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password })
      })
      const empData = await empRes.json()

      if (empData.success && empData.token) {
        localStorage.setItem('employeeToken', empData.token)
        localStorage.setItem('employeeUser', JSON.stringify(empData.employee))
        toast.success('Employee login successful!')
        navigate('/employee/dashboard')
        return
      }

      if (empRes.status === 403 && empData.message) {
        setError(empData.message)
        return
      }

      // 2) Sub-admins created in Employee Management are Admin docs (role ADMIN), not Employee
      const adminRes = await fetch(`${API_URL}/admin-mgmt/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password })
      })
      const adminData = await adminRes.json()

      if (adminData.success && adminData.token) {
        localStorage.setItem('adminToken', adminData.token)
        localStorage.setItem('adminUser', JSON.stringify(adminData.admin))
        toast.success('Signed in successfully!')
        navigate('/admin/dashboard')
        return
      }

      setError(adminData.message || empData.message || 'Invalid credentials')
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const portalBadge = isEmployeePortal ? 'Employee Portal' : 'Super Admin Portal'
  const title = isEmployeePortal ? 'Employee Login' : 'Super Admin Login'
  const subtitle = isEmployeePortal
    ? 'Sign in with email and password. Your admin creates accounts in Employee Management.'
    : 'Sign in to manage the trading platform.'

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
        type="button"
        onClick={() => navigate('/')}
        className="absolute top-5 right-5 z-20 w-10 h-10 bg-white/5 backdrop-blur-md border border-[#D9A136]/20 rounded-full flex items-center justify-center hover:bg-[#D9A136]/10 hover:border-[#D9A136]/40 transition-all"
        aria-label="Close"
      >
        <X size={18} className="text-gray-300" />
      </button>

      <div className="relative z-10 min-h-screen flex">
        {/* LEFT — Branding (desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between p-12 xl:p-16 relative">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="BULL4X" className="h-12 object-contain" />
            <div>
              <p className="text-white font-bold text-lg leading-none tracking-tight">BULL4X</p>
              <p className="text-[#D9A136] text-[10px] uppercase tracking-[0.2em] mt-1">Admin Console</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D9A136]/10 border border-[#D9A136]/30 mb-6">
              <Shield size={12} className="text-[#F0C96F]" />
              <span className="text-[#F0C96F] text-xs font-medium tracking-wider uppercase">Restricted Access · Authorized Personnel Only</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-5 tracking-tight">
              {isEmployeePortal ? (
                <>Operate the platform with{' '}<span className="bg-gradient-to-r from-[#F0C96F] via-[#D9A136] to-[#b8892a] bg-clip-text text-transparent">role-based control</span></>
              ) : (
                <>Manage the platform with{' '}<span className="bg-gradient-to-r from-[#F0C96F] via-[#D9A136] to-[#b8892a] bg-clip-text text-transparent">full oversight</span></>
              )}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">
              {isEmployeePortal
                ? 'Access scoped to your role. Every action is logged for audit and compliance.'
                : 'User management, KYC reviews, trade monitoring, payments — everything in one secure console.'}
            </p>

            {/* Capability pills */}
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {[
                { Icon: Users,     label: 'User Management' },
                { Icon: FileCheck, label: 'KYC Verification' },
                { Icon: LineChart, label: 'Trade Oversight' },
                { Icon: KeyRound,  label: 'Audit-Logged Actions' },
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
            <Link to="/legal/privacy-policy" className="hover:text-[#D9A136] transition-colors">Privacy</Link>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <Link to="/legal/terms-and-conditions" className="hover:text-[#D9A136] transition-colors">Terms</Link>
          </div>
        </div>

        {/* RIGHT — Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-lg">
            {/* Mobile logo */}
            <div className="flex lg:hidden justify-center mb-8">
              <img src={logo} alt="BULL4X" className="h-14 object-contain" />
            </div>

            {/* Card */}
            <div className="relative">
              {/* Gold glow behind card */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#D9A136]/30 via-transparent to-[#F0C96F]/20 rounded-3xl blur-xl opacity-50" />

              <div className="relative bg-black/60 backdrop-blur-xl border border-[#D9A136]/20 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/50">
                {/* Portal badge */}
                <div className="flex justify-center mb-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D9A136]/10 border border-[#D9A136]/30">
                    <Shield size={12} className="text-[#F0C96F]" />
                    <span className="text-[#F0C96F] text-[10px] font-semibold uppercase tracking-[0.18em]">{portalBadge}</span>
                  </div>
                </div>

                {/* Tabs: Super Admin / Employee */}
                <div className="flex bg-black/40 rounded-full p-1 w-full mb-7 border border-[#D9A136]/10">
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      !isEmployeePortal
                        ? 'bg-gradient-to-r from-[#D9A136] to-[#F0C96F] text-black shadow-lg shadow-[#D9A136]/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Shield size={14} />
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin-employee')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      isEmployeePortal
                        ? 'bg-gradient-to-r from-[#D9A136] to-[#F0C96F] text-black shadow-lg shadow-[#D9A136]/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <UserCog size={14} />
                    Employee
                  </button>
                </div>

                {/* Heading */}
                <div className="mb-7">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
                    {isEmployeePortal ? (
                      <>Employee <span className="bg-gradient-to-r from-[#F0C96F] to-[#D9A136] bg-clip-text text-transparent">Login</span></>
                    ) : (
                      <>Super Admin <span className="bg-gradient-to-r from-[#F0C96F] to-[#D9A136] bg-clip-text text-transparent">Login</span></>
                    )}
                  </h1>
                  <p className="text-gray-400 text-sm">{subtitle}</p>
                </div>

                {/* Form */}
                <form onSubmit={isEmployeePortal ? handleEmployeeSubmit : handleAdminSubmit} className="space-y-4" noValidate>
                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D9A136] transition-colors pointer-events-none" />
                      <input
                        type="email"
                        placeholder="admin@bull4x.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError('') }}
                        autoComplete="username"
                        className="w-full bg-black/40 border border-[#D9A136]/15 focus:border-[#D9A136]/60 focus:ring-2 focus:ring-[#D9A136]/20 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:bg-black/60 transition-all"
                      />
                    </div>
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
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError('') }}
                        autoComplete="current-password"
                        className="w-full bg-black/40 border border-[#D9A136]/15 focus:border-[#D9A136]/60 focus:ring-2 focus:ring-[#D9A136]/20 rounded-xl pl-11 pr-12 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:bg-black/60 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#D9A136] transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
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
                    disabled={loading || !email || !password}
                    className="group relative w-full overflow-hidden bg-gradient-to-r from-[#D9A136] to-[#F0C96F] hover:from-[#F0C96F] hover:to-[#D9A136] text-black font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D9A136]/25 hover:shadow-[#D9A136]/40 mt-2 flex items-center justify-center gap-2"
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
                  <span className="text-[11px] text-gray-500 uppercase tracking-wider">Not an admin?</span>
                  <div className="flex-1 h-px bg-[#D9A136]/15" />
                </div>

                {/* User login link */}
                <button
                  type="button"
                  onClick={() => navigate('/user/login')}
                  className="block text-center w-full py-3 rounded-xl border border-[#D9A136]/20 hover:border-[#D9A136]/50 hover:bg-[#D9A136]/5 text-gray-300 hover:text-[#F0C96F] text-sm font-medium transition-all"
                >
                  Go to User Login
                </button>
              </div>
            </div>

            {/* Mobile footer */}
            <div className="flex lg:hidden items-center justify-center gap-3 mt-8 text-[11px] text-gray-500">
              <Link to="/legal/privacy-policy" className="hover:text-[#D9A136] transition-colors">Privacy</Link>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <Link to="/legal/terms-and-conditions" className="hover:text-[#D9A136] transition-colors">Terms</Link>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>© 2026 BULL4X</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
