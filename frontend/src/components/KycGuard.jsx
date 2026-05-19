import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'
import KycGateModal from './KycGateModal'

/**
 * Wraps protected routes and forces KYC completion before allowing access
 * to anything other than /profile (where the user can submit their KYC).
 *
 * Behavior:
 *  - Reads logged-in user from localStorage
 *  - Fetches KYC status from /kyc/status/:userId on mount and on path change
 *  - If status === 'approved'  → renders the route freely
 *  - If on /profile             → renders silently (user is already where they need to be)
 *  - Otherwise                  → blocks UI with a forced modal that only navigates to /profile
 */
const KycGuard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [kycStatus, setKycStatus] = useState(undefined) // undefined = still loading

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
  })()

  useEffect(() => {
    let cancelled = false
    if (!user._id) { setKycStatus(null); return () => {} }

    fetch(`${API_URL}/kyc/status/${user._id}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setKycStatus(data?.kyc?.status || null) })
      .catch(() => { if (!cancelled) setKycStatus(null) })

    return () => { cancelled = true }
  }, [user._id, location.pathname])

  // Still resolving KYC — show a minimal loading state so nothing flashes through.
  if (kycStatus === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#D9A136] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isApproved = kycStatus === 'approved'
  const isProfilePage = location.pathname === '/profile'

  // Approved OR on profile → full access
  if (isApproved || isProfilePage) {
    return <Outlet />
  }

  // Not approved AND not on profile → block with forced modal
  return (
    <>
      <Outlet />
      <KycGateModal
        open={true}
        forced
        action="accessApp"
        kycStatus={kycStatus}
        onClose={() => navigate('/profile')}
      />
    </>
  )
}

export default KycGuard
