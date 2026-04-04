import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, Mail, Shield, UserCog, Lock, Eye, EyeOff } from 'lucide-react'
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
    : 'Enter your credentials to continue'

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-cyan-500/20 via-blue-500/20 to-transparent rounded-full blur-3xl" />

      <div className="relative bg-dark-700 rounded-2xl p-6 sm:p-8 w-full max-w-md border border-gray-800 mx-4 sm:mx-0">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 w-8 h-8 bg-dark-600 rounded-full flex items-center justify-center hover:bg-dark-500 transition-colors"
        >
          <X size={16} className="text-gray-400" />
        </button>

        <div className="flex justify-center mb-6">
          <img src={logo} alt="Unicap" className="h-12 object-contain" />
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            {portalBadge}
          </div>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-dark-600 rounded-lg">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
              !isEmployeePortal
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield size={16} />
            Super Admin
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin-employee')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
              isEmployeePortal
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserCog size={16} />
            Employee
          </button>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-2">{title}</h1>
        <p className="text-gray-500 text-sm mb-6">{subtitle}</p>

        <form onSubmit={isEmployeePortal ? handleEmployeeSubmit : handleAdminSubmit} className="space-y-4" noValidate>
          <div>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                autoComplete="username"
                className="w-full bg-dark-600 border border-gray-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                autoComplete="current-password"
                className="w-full bg-dark-600 border border-gray-700 rounded-lg pl-11 pr-11 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className={`w-full text-white font-medium py-3 rounded-lg transition-colors mt-2 disabled:opacity-50 ${
              isEmployeePortal
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          {isEmployeePortal ? (
            <>
              Not an employee?{' '}
              <button type="button" onClick={() => navigate('/user/login')} className="text-white hover:underline">
                User Login
              </button>
            </>
          ) : (
            <>
              Not an admin?{' '}
              <button type="button" onClick={() => navigate('/user/login')} className="text-white hover:underline">
                User Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
