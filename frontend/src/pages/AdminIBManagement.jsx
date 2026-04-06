import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { API_URL } from '../config/api'
import toast from 'react-hot-toast'
import { 
  UserCog,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Percent,
  Check,
  X,
  RefreshCw,
  Settings,
  ChevronDown,
  ArrowRightLeft,
  UserPlus,
  Award,
  Trophy,
  Crown,
  Target
} from 'lucide-react'

const AdminIBManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('ibs') // ibs, network, applications, ...
  const [ibs, setIbs] = useState([])
  const [applications, setApplications] = useState([])
  const [plans, setPlans] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedIB, setSelectedIB] = useState(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  
  // Referral Transfer states
  const [allUsers, setAllUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [targetIB, setTargetIB] = useState('')
  const [transferLoading, setTransferLoading] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  
  // IB Levels states
  const [ibLevels, setIbLevels] = useState([])
  const [showLevelModal, setShowLevelModal] = useState(false)
  const [editingLevel, setEditingLevel] = useState(null)
  
  // IB Details Modal states
  const [showIBModal, setShowIBModal] = useState(false)
  const [viewingIB, setViewingIB] = useState(null)
  const [ibDetailTierId, setIbDetailTierId] = useState('')
  const [savingIB, setSavingIB] = useState(false)

  // IB network: filter by IB, hierarchy scope, detach
  const [filterIbId, setFilterIbId] = useState('')
  const [networkScope, setNetworkScope] = useState('downline') // direct | downline
  const [networkSearch, setNetworkSearch] = useState('')
  const [networkUsers, setNetworkUsers] = useState([])
  const [networkLoading, setNetworkLoading] = useState(false)
  const [selectedNetworkIds, setSelectedNetworkIds] = useState([])
  const [moveTargetIb, setMoveTargetIb] = useState('')
  const [networkActionLoading, setNetworkActionLoading] = useState(false)

  const [commissionGrouped, setCommissionGrouped] = useState([])
  const [commissionAccountTypes, setCommissionAccountTypes] = useState([])
  const [commissionEditTypeId, setCommissionEditTypeId] = useState(null)
  const [commissionLevelsDraft, setCommissionLevelsDraft] = useState([])
  const [savingCommission, setSavingCommission] = useState(false)

  useEffect(() => {
    fetchDashboard()
    fetchIBs()
    fetchApplications()
    fetchPlans()
    fetchSettings()
    fetchAllUsers()
    fetchIBLevels()

    // Auto-refresh every 10 seconds
    const refreshInterval = setInterval(() => {
      fetchDashboard()
      fetchIBs()
      fetchApplications()
    }, 10000)

    return () => clearInterval(refreshInterval)
  }, [])

  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`)
      const data = await res.json()
      setAllUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleTransferReferrals = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user to transfer')
      return
    }
    if (!targetIB) {
      toast.error('Please select a target IB')
      return
    }

    setTransferLoading(true)
    try {
      const res = await fetch(`${API_URL}/ib/admin/transfer-referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedUsers,
          targetIBId: targetIB
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message || `Transferred ${data.transferredCount} user(s)`)
        if (data.errors?.length) {
          data.errors.slice(0, 5).forEach((e) => toast.error(String(e.message || e)))
          if (data.errors.length > 5) toast.error(`…and ${data.errors.length - 5} more errors`)
        }
        setSelectedUsers([])
        setTargetIB('')
        fetchAllUsers()
        fetchIBs()
      } else {
        toast.error(data.message || 'Failed to transfer referrals')
      }
    } catch (error) {
      console.error('Error transferring referrals:', error)
      toast.error('Failed to transfer referrals')
    }
    setTransferLoading(false)
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    const filteredUserIds = filteredUsers.map(u => u._id)
    setSelectedUsers(filteredUserIds)
  }

  const deselectAllUsers = () => {
    setSelectedUsers([])
  }

  const filteredUsers = allUsers.filter(user => 
    user.firstName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user._id?.includes(userSearchTerm)
  )

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/ib/admin/dashboard`)
      const data = await res.json()
      // Handle both old format (data.dashboard) and new format (data.stats)
      if (data.stats) {
        setDashboard({
          ibs: { total: data.stats.totalIBs, active: data.stats.activeIBs, pending: data.stats.pendingIBs },
          referrals: { total: 0 },
          commissions: { 
            total: { totalCommission: data.stats.totalCommissionPaid || 0 },
            today: { totalCommission: 0 }
          },
          withdrawals: { pending: { totalPending: 0, count: 0 } }
        })
      } else if (data.dashboard) {
        setDashboard(data.dashboard)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    }
  }

  const fetchIBs = async () => {
    try {
      const res = await fetch(`${API_URL}/ib/admin/all`)
      const data = await res.json()
      setIbs(data.ibs || [])
    } catch (error) {
      console.error('Error fetching IBs:', error)
    }
    setLoading(false)
  }

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_URL}/ib/admin/pending`)
      const data = await res.json()
      let rows = []
      if (data.applications && data.applications.length > 0) {
        rows = data.applications.map((a) => ({
          kind: 'application',
          _id: a._id,
          userId: a.userId?._id || a.userId,
          firstName: a.userId?.firstName,
          lastName: a.userId?.lastName,
          email: a.userId?.email,
          createdAt: a.appliedAt || a.createdAt,
          referredByIb: a.referredByIbUserId
        }))
      } else {
        rows = (data.pending || []).map((u) => ({
          kind: 'legacy',
          _id: u._id,
          userId: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          createdAt: u.createdAt,
          referredByIb: null
        }))
      }
      setApplications(rows)
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }

  const fetchCommissionConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/ib/admin/commission-config`)
      const data = await res.json()
      if (data.success) {
        setCommissionGrouped(data.configs || [])
        setCommissionAccountTypes(data.accountTypes || [])
        const first = data.configs?.[0]
        if (first?.accountType?._id) {
          setCommissionEditTypeId(first.accountType._id)
          setCommissionLevelsDraft(
            (first.levels || []).map((l) => ({
              level: l.level,
              commissionPercent: l.commissionPercent,
              isActive: l.isActive !== false
            }))
          )
        } else if (data.accountTypes?.[0]?._id) {
          setCommissionEditTypeId(data.accountTypes[0]._id)
          setCommissionLevelsDraft([])
        }
      }
    } catch (e) {
      console.error('Error fetching commission config:', e)
    }
  }

  useEffect(() => {
    if (activeTab === 'commission') fetchCommissionConfig()
  }, [activeTab])

  const fetchNetworkUsers = async () => {
    setNetworkLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterIbId) {
        params.set('ibId', filterIbId)
        params.set('scope', networkScope)
      }
      if (networkSearch.trim()) params.set('search', networkSearch.trim())
      const res = await fetch(`${API_URL}/ib/admin/referred-users?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setNetworkUsers(data.users || [])
        setSelectedNetworkIds([])
      } else {
        toast.error(data.message || 'Failed to load network')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to load IB network')
    }
    setNetworkLoading(false)
  }

  useEffect(() => {
    if (activeTab === 'network') fetchNetworkUsers()
  }, [activeTab, filterIbId, networkScope])

  const handleDetachNetwork = async (userIds) => {
    if (!userIds?.length) return
    if (!confirm(`Remove ${userIds.length} user(s) from their IB (unlink only)?`)) return
    setNetworkActionLoading(true)
    try {
      const res = await fetch(`${API_URL}/ib/admin/detach-referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message || 'Detached')
        fetchNetworkUsers()
        fetchAllUsers()
        fetchIBs()
      } else {
        toast.error(data.message || 'Detach failed')
      }
    } catch (e) {
      toast.error('Detach failed')
    }
    setNetworkActionLoading(false)
  }

  const handleMoveNetworkUsers = async () => {
    if (!selectedNetworkIds.length) {
      toast.error('Select at least one user')
      return
    }
    if (!moveTargetIb) {
      toast.error('Select target IB')
      return
    }
    setNetworkActionLoading(true)
    try {
      const res = await fetch(`${API_URL}/ib/admin/transfer-referrals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedNetworkIds, targetIBId: moveTargetIb })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message || 'Moved')
        if (data.errors?.length) {
          data.errors.forEach((e) => toast.error(`${e.userId}: ${e.message}`))
        }
        setMoveTargetIb('')
        fetchNetworkUsers()
        fetchAllUsers()
        fetchIBs()
      } else {
        toast.error(data.message || 'Move failed')
      }
    } catch (e) {
      toast.error('Move failed')
    }
    setNetworkActionLoading(false)
  }

  const toggleNetworkSelect = (id) => {
    setSelectedNetworkIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const selectCommissionAccountType = (typeId) => {
    setCommissionEditTypeId(typeId)
    const g = commissionGrouped.find(
      (c) => String(c.accountType._id) === String(typeId)
    )
    setCommissionLevelsDraft(
      (g?.levels || []).map((l) => ({
        level: l.level,
        commissionPercent: l.commissionPercent,
        isActive: l.isActive !== false
      }))
    )
  }

  const saveCommissionConfig = async () => {
    if (!commissionEditTypeId) return
    setSavingCommission(true)
    try {
      const res = await fetch(`${API_URL}/ib/admin/commission-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountTypeId: commissionEditTypeId,
          levels: commissionLevelsDraft
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Commission configuration saved (applies to new trades only)')
        fetchCommissionConfig()
      } else {
        toast.error(data.message || 'Save failed')
      }
    } catch (e) {
      toast.error('Failed to save commission config')
    }
    setSavingCommission(false)
  }

  const addCommissionLevelRow = () => {
    const next =
      commissionLevelsDraft.length > 0
        ? Math.max(...commissionLevelsDraft.map((l) => l.level)) + 1
        : 1
    setCommissionLevelsDraft([
      ...commissionLevelsDraft,
      { level: next, commissionPercent: 1, isActive: true }
    ])
  }

  const updateCommissionLevel = (idx, field, value) => {
    setCommissionLevelsDraft((prev) => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], [field]: value }
      return copy
    })
  }

  const removeCommissionLevel = (idx) => {
    setCommissionLevelsDraft((prev) => prev.filter((_, i) => i !== idx))
  }

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_URL}/ib/admin/plans`)
      const data = await res.json()
      setPlans(data.plans || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/ib/admin/settings`)
      const data = await res.json()
      if (data.settings) setSettings(data.settings)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const fetchIBLevels = async () => {
    try {
      const res = await fetch(`${API_URL}/ib/admin/levels`)
      const data = await res.json()
      setIbLevels(data.levels || [])
    } catch (error) {
      console.error('Error fetching IB levels:', error)
    }
  }

  const handleSaveLevel = async (levelData) => {
    try {
      const url = editingLevel 
        ? `${API_URL}/ib/admin/levels/${editingLevel._id}`
        : `${API_URL}/ib/admin/levels`
      const method = editingLevel ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(levelData)
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingLevel ? 'Level updated!' : 'Level created!')
        setShowLevelModal(false)
        setEditingLevel(null)
        fetchIBLevels()
      } else {
        toast.error(data.message || 'Failed to save level')
      }
    } catch (error) {
      console.error('Error saving level:', error)
      toast.error('Failed to save level')
    }
  }

  const handleDeleteLevel = async (levelId) => {
    if (!confirm('Are you sure you want to delete this level?')) return
    
    try {
      const res = await fetch(`${API_URL}/ib/admin/levels/${levelId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Level deleted!')
        fetchIBLevels()
      } else {
        toast.error(data.message || 'Failed to delete level')
      }
    } catch (error) {
      console.error('Error deleting level:', error)
      toast.error('Failed to delete level')
    }
  }

  const handleApprove = async (userId, planId = null, ibLevelId = null) => {
    try {
      const res = await fetch(`${API_URL}/ib/admin/approve/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(planId ? { planId } : {}),
          ...(ibLevelId ? { ibLevelId } : {})
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('IB approved successfully!')
        fetchApplications()
        fetchIBs()
        fetchDashboard()
      } else {
        toast.error(data.message || 'Failed to approve')
      }
    } catch (error) {
      console.error('Error approving:', error)
      toast.error('Failed to approve IB')
    }
  }

  const handleReject = async (userId) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return

    try {
      const res = await fetch(`${API_URL}/ib/admin/reject/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('IB application rejected')
        fetchApplications()
        fetchDashboard()
      } else {
        toast.error(data.message || 'Failed to reject')
      }
    } catch (error) {
      console.error('Error rejecting:', error)
      toast.error('Failed to reject IB application')
    }
  }

  const handleBlock = async (userId) => {
    const reason = prompt('Enter block reason:')
    if (!reason) return

    try {
      const res = await fetch(`${API_URL}/ib/admin/block/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('IB blocked')
        fetchIBs()
        fetchDashboard()
      }
    } catch (error) {
      console.error('Error blocking:', error)
    }
  }

  const handleSuspend = async (ibId) => {
    if (!confirm('Are you sure you want to suspend this IB?')) return

    try {
      const res = await fetch(`${API_URL}/ib/admin/suspend/${ibId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: 'admin' })
      })
      const data = await res.json()
      if (data.ibUser) {
        toast.success('IB suspended')
        fetchIBs()
      }
    } catch (error) {
      console.error('Error suspending:', error)
    }
  }

  const handleViewIB = (ib) => {
    setViewingIB(ib)
    const tiers = [...(ibLevels || [])].filter((l) => l.isActive !== false).sort((a, b) => (a.order || 0) - (b.order || 0))
    const current = ib.ibLevelId?._id || ib.ibLevelId
    setIbDetailTierId(current ? String(current) : tiers[0]?._id ? String(tiers[0]._id) : '')
    setShowIBModal(true)
  }

  const handleSaveIBDetails = async () => {
    if (!viewingIB) return
    if (!ibDetailTierId) {
      toast.error('Select an IB tier')
      return
    }
    setSavingIB(true)
    
    try {
      const res = await fetch(`${API_URL}/ib/admin/update/${viewingIB._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ibLevelId: ibDetailTierId
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('IB updated successfully!')
        setShowIBModal(false)
        setViewingIB(null)
        fetchIBs()
      } else {
        toast.error(data.message || 'Failed to update IB')
      }
    } catch (error) {
      console.error('Error updating IB:', error)
      toast.error('Failed to update IB')
    }
    setSavingIB(false)
  }

  const handleSavePlan = async (planData) => {
    try {
      const url = editingPlan 
        ? `${API_URL}/ib/admin/plans/${editingPlan._id}`
        : `${API_URL}/ib/admin/plans`
      const method = editingPlan ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      })
      const data = await res.json()
      if (data.success || data.plan) {
        toast.success(editingPlan ? 'Plan updated!' : 'Plan created!')
        setShowPlanModal(false)
        setEditingPlan(null)
        fetchPlans()
      } else {
        toast.error(data.message || 'Failed to save plan')
      }
    } catch (error) {
      console.error('Error saving plan:', error)
      toast.error('Failed to save plan')
    }
  }

  const handleUpdateSettings = async (newSettings) => {
    try {
      const res = await fetch(`${API_URL}/ib/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })
      const data = await res.json()
      if (data.settings) {
        setSettings(data.settings)
        toast.success('Settings updated!')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
    }
  }

  const filteredIBs = ibs.filter(ib => 
    ib.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ib.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ib.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const uniqueIbPlans = Array.from(new Map((plans || []).map((p) => [String(p._id), p])).values())
  const sortedIbTiers = [...(ibLevels || [])]
    .filter((l) => l.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <AdminLayout title="IB Management" subtitle="Manage Introducing Brokers and partners">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-800 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <UserCog size={18} className="text-blue-500" />
            <p className="text-gray-500 text-sm">Total IBs</p>
          </div>
          <p className="text-white text-2xl font-bold">{dashboard?.ibs?.total || 0}</p>
          <p className="text-yellow-500 text-xs mt-1">{dashboard?.ibs?.pending || 0} pending</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-green-500" />
            <p className="text-gray-500 text-sm">Total Referrals</p>
          </div>
          <p className="text-white text-2xl font-bold">{dashboard?.referrals?.total || 0}</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-purple-500" />
            <p className="text-gray-500 text-sm">Total Commissions</p>
          </div>
          <p className="text-white text-2xl font-bold">${(dashboard?.commissions?.total?.totalCommission || 0).toFixed(2)}</p>
          <p className="text-green-500 text-xs mt-1">Today: ${(dashboard?.commissions?.today?.totalCommission || 0).toFixed(2)}</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-orange-500" />
            <p className="text-gray-500 text-sm">Pending Withdrawals</p>
          </div>
          <p className="text-white text-2xl font-bold">${(dashboard?.withdrawals?.pending?.totalPending || 0).toFixed(2)}</p>
          <p className="text-gray-500 text-xs mt-1">{dashboard?.withdrawals?.pending?.count || 0} requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'ibs', label: 'Active IBs', count: dashboard?.ibs?.active },
          { id: 'network', label: 'IB & users' },
          { id: 'applications', label: 'Applications', count: applications.length },
          { id: 'commission', label: 'Commission %' },
          { id: 'levels', label: 'IB Levels', count: ibLevels.length, icon: Award },
          { id: 'transfer', label: 'Referral Transfer', icon: ArrowRightLeft },
          { id: 'settings', label: 'Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-dark-800 text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active IBs Tab */}
      {activeTab === 'ibs' && (
        <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 border-b border-gray-800">
            <h2 className="text-white font-semibold text-lg">Active IB Partners</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search IBs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 bg-dark-700 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
                />
              </div>
              <button 
                onClick={() => { fetchIBs(); fetchDashboard(); }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredIBs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No IBs found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">IB Partner</th>
                    <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Referral Code</th>
                    <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Plan</th>
                    <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Direct refs</th>
                    <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Upline IB</th>
                    <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Earnings</th>
                    <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Status</th>
                    <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIBs.map((ib) => (
                    <tr key={ib._id} className="border-b border-gray-800 hover:bg-dark-700/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <span className="text-blue-500 font-medium">{ib.firstName?.charAt(0) || '?'}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{ib.firstName} {ib.lastName || ''}</p>
                            <p className="text-gray-500 text-sm">{ib.email}</p>
                            {ib.parentIBId && (
                              <p className="text-gray-600 text-xs mt-0.5">
                                Under: {ib.parentIBId.firstName || 'IB'}{' '}
                                <span className="text-gray-500 font-mono">{ib.parentIBId.referralCode || ''}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-white font-mono">{ib.referralCode || '-'}</td>
                      <td className="py-4 px-4 text-white">{ib.ibPlanId?.name || 'Default'}</td>
                      <td className="py-4 px-4 text-white">{ib.directReferralCount ?? ib.ibLevel ?? 0}</td>
                      <td className="py-4 px-4 text-gray-400 text-sm">
                        {ib.parentIBId
                          ? `${ib.parentIBId.firstName || ''} (${ib.parentIBId.referralCode || '—'})`
                          : '—'}
                      </td>
                      <td className="py-4 px-4 text-green-500 font-medium">-</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ib.ibStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : 
                          ib.ibStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                          ib.ibStatus === 'BLOCKED' ? 'bg-red-500/20 text-red-500' :
                          'bg-gray-500/20 text-gray-500'
                        }`}>
                          {ib.ibStatus || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleViewIB(ib)}
                            className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-white"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleViewIB(ib)}
                            className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-blue-500"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          {ib.ibStatus === 'ACTIVE' && (
                            <button 
                              onClick={() => handleBlock(ib._id)}
                              className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                              title="Block"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* IB hierarchy: view users per IB, filter, move, detach */}
      {activeTab === 'network' && (
        <div className="space-y-4">
          <div className="bg-dark-800 rounded-xl border border-gray-800 p-4 sm:p-5">
            <h2 className="text-white font-semibold text-lg mb-1">IB network & referred users</h2>
            <p className="text-gray-500 text-sm mb-4">
              Hierarchy uses <span className="text-gray-400">parent IB</span> on each user. Filter by IB to see direct referrals or the full downline tree; move or unlink users here. Users with <span className="text-gray-400">no IB yet</span> appear in the <span className="text-gray-400">Referral Transfer</span> tab.
            </p>
            <div className="flex flex-col lg:flex-row flex-wrap gap-3 items-stretch lg:items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-gray-500 text-xs block mb-1">Filter by IB</label>
                <select
                  value={filterIbId}
                  onChange={(e) => {
                    setFilterIbId(e.target.value)
                    if (!e.target.value) setNetworkScope('downline')
                  }}
                  className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">All users with an IB (any upline)</option>
                  {ibs.filter((ib) => ib.ibStatus === 'ACTIVE').map((ib) => (
                    <option key={ib._id} value={ib._id}>
                      {ib.firstName} — {ib.email} ({ib.referralCode || 'no code'})
                    </option>
                  ))}
                </select>
              </div>
              {filterIbId && (
                <div>
                  <label className="text-gray-500 text-xs block mb-1">Scope</label>
                  <select
                    value={networkScope}
                    onChange={(e) => setNetworkScope(e.target.value)}
                    className="w-full lg:w-48 bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="downline">Full downline (all levels)</option>
                    <option value="direct">Direct only (level 1)</option>
                  </select>
                </div>
              )}
              <div className="flex-1 min-w-[180px]">
                <label className="text-gray-500 text-xs block mb-1">Search name / email</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={networkSearch}
                    onChange={(e) => setNetworkSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchNetworkUsers()}
                    placeholder="Search…"
                    className="flex-1 bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={fetchNetworkUsers}
                    disabled={networkLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center border-t border-gray-800 pt-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-gray-500 text-xs block mb-1">Move selected to IB</label>
                <select
                  value={moveTargetIb}
                  onChange={(e) => setMoveTargetIb(e.target.value)}
                  className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">— Choose target IB —</option>
                  {ibs.filter((ib) => ib.ibStatus === 'ACTIVE').map((ib) => (
                    <option key={ib._id} value={ib._id}>
                      {ib.firstName} ({ib.referralCode || ib.email})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleMoveNetworkUsers}
                disabled={networkActionLoading || !selectedNetworkIds.length || !moveTargetIb}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 disabled:opacity-50 sm:self-end"
              >
                {networkActionLoading ? '…' : `Move ${selectedNetworkIds.length || ''} selected`}
              </button>
              <button
                type="button"
                onClick={() => handleDetachNetwork(selectedNetworkIds)}
                disabled={networkActionLoading || !selectedNetworkIds.length}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/40 rounded-lg text-sm hover:bg-red-500/30 disabled:opacity-50 sm:self-end"
              >
                Unlink selected from IB
              </button>
            </div>
          </div>

          <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden">
            {networkLoading ? (
              <div className="p-8 text-center text-gray-500">Loading…</div>
            ) : networkUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No users match this filter</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-500 text-sm font-medium py-3 px-3 w-10">
                        <input
                          type="checkbox"
                          aria-label="Select all"
                          checked={
                            networkUsers.length > 0 &&
                            selectedNetworkIds.length === networkUsers.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedNetworkIds(networkUsers.map((u) => u._id))
                            } else {
                              setSelectedNetworkIds([])
                            }
                          }}
                        />
                      </th>
                      <th className="text-left text-gray-500 text-sm font-medium py-3 px-3">User</th>
                      <th className="text-left text-gray-500 text-sm font-medium py-3 px-3">Role</th>
                      {filterIbId && networkScope === 'downline' && (
                        <th className="text-left text-gray-500 text-sm font-medium py-3 px-3">Depth</th>
                      )}
                      <th className="text-left text-gray-500 text-sm font-medium py-3 px-3">Parent / upline IB</th>
                      <th className="text-left text-gray-500 text-sm font-medium py-3 px-3">Ref code</th>
                      <th className="text-right text-gray-500 text-sm font-medium py-3 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {networkUsers.map((u) => (
                      <tr key={u._id} className="border-b border-gray-800 hover:bg-dark-700/50">
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={selectedNetworkIds.includes(u._id)}
                            onChange={() => toggleNetworkSelect(u._id)}
                          />
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-white text-sm font-medium">{u.firstName}</p>
                          <p className="text-gray-500 text-xs">{u.email}</p>
                        </td>
                        <td className="py-3 px-3">
                          {u.isIB ? (
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">IB</span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-600 text-gray-300">User</span>
                          )}
                        </td>
                        {filterIbId && networkScope === 'downline' && (
                          <td className="py-3 px-3 text-gray-400 text-sm">{u.depth ?? '—'}</td>
                        )}
                        <td className="py-3 px-3 text-sm">
                          {u.parentIB ? (
                            <span className="text-gray-300">
                              {u.parentIB.firstName} <span className="text-gray-500">{u.parentIB.referralCode}</span>
                            </span>
                          ) : u.parentIBId && typeof u.parentIBId === 'object' ? (
                            <span className="text-gray-300">
                              {u.parentIBId.firstName}{' '}
                              <span className="text-gray-500">{u.parentIBId.referralCode}</span>
                            </span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-gray-500 font-mono text-xs">{u.referredBy || '—'}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDetachNetwork([u._id])}
                            disabled={networkActionLoading}
                            className="text-xs text-red-400 hover:underline disabled:opacity-50"
                          >
                            Unlink
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-800">
            <h2 className="text-white font-semibold text-lg">Pending Applications</h2>
            <p className="text-gray-500 text-sm mt-1">
              Choose the <span className="text-gray-400">IB tier</span> (your 5 levels) and optionally a{' '}
              <span className="text-gray-400">commission plan</span> from the database. Leave plan on “Auto” if you only use defaults.
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No pending applications</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="p-4 sm:p-5 hover:bg-dark-700/25 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 shrink-0 bg-yellow-500/15 border border-yellow-500/25 rounded-full flex items-center justify-center">
                        <span className="text-yellow-400 font-semibold text-lg">
                          {app.firstName?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-base">
                          {app.firstName} {app.lastName || ''}
                        </p>
                        <p className="text-gray-400 text-sm truncate">{app.email}</p>
                        <p className="text-gray-600 text-xs mt-1">
                          Applied {new Date(app.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </p>
                        {app.referredByIb ? (
                          <p className="text-gray-500 text-xs mt-2">
                            Referred by{' '}
                            <span className="text-blue-400">
                              {app.referredByIb.referralCode || app.referredByIb.email}
                            </span>
                            <span className="text-gray-600"> · {app.referredByIb.firstName || 'IB'}</span>
                          </p>
                        ) : (
                          <p className="text-gray-600 text-xs mt-2">Organic signup (no referral code)</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-700/90 bg-dark-900/50 p-4 space-y-4 lg:w-full lg:max-w-md xl:max-w-lg shrink-0">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                        On approval
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor={`tier-${app._id}`}
                            className="block text-xs font-medium text-gray-400"
                          >
                            IB tier
                          </label>
                          <select
                            className="w-full bg-dark-800 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50"
                            id={`tier-${app._id}`}
                            key={`tier-${app._id}-${sortedIbTiers[0]?._id || 'none'}`}
                            defaultValue={sortedIbTiers[0]?._id || ''}
                          >
                            {sortedIbTiers.length === 0 ? (
                              <option value="" disabled>
                                Add tiers in IB Levels tab
                              </option>
                            ) : (
                              sortedIbTiers.map((lvl) => (
                                <option key={lvl._id} value={lvl._id}>
                                  {lvl.name} · tier {lvl.order}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor={`plan-${app._id}`}
                            className="block text-xs font-medium text-gray-400"
                          >
                            Commission plan
                          </label>
                          <select
                            className="w-full bg-dark-800 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50"
                            id={`plan-${app._id}`}
                            defaultValue=""
                          >
                            <option value="">Auto (default plan)</option>
                            {uniqueIbPlans.map((plan) => (
                              <option key={plan._id} value={plan._id}>
                                {plan.name}
                                {plan.maxLevels != null ? ` · ${plan.maxLevels} levels` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {uniqueIbPlans.length === 0 && (
                        <p className="text-xs text-amber-400/90 leading-relaxed bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                          No extra commission plans saved yet — approval will attach the system default plan. Add named plans via API or DB if you need more.
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 justify-end pt-1 border-t border-gray-800">
                        <button
                          type="button"
                          onClick={() => handleReject(app.userId)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                        >
                          <X size={16} /> Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const tierSel = document.getElementById(`tier-${app._id}`)
                            const planSel = document.getElementById(`plan-${app._id}`)
                            if (sortedIbTiers.length > 0 && !tierSel?.value) {
                              toast.error('Select an IB tier')
                              return
                            }
                            const ibLevelId = tierSel?.value || null
                            const planRaw = planSel?.value
                            const planId = planRaw && String(planRaw).length > 0 ? planRaw : null
                            handleApprove(app.userId, planId, ibLevelId)
                          }}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-500 shadow-sm shadow-green-900/20 transition-colors"
                        >
                          <Check size={16} /> Approve
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Multi-level commission % by account type (trader-relative upline) */}
      {activeTab === 'commission' && (
        <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden p-4 sm:p-6 space-y-6">
          <div>
            <h2 className="text-white font-semibold text-lg">IB commission by account type</h2>
            <p className="text-gray-500 text-sm mt-1">
              Level 1 = direct referrer; each level is a % of gross trade commission. Total must be under 100%; each level ≤ the previous. Changes apply to new trades only.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <label className="text-gray-400 text-sm">Account type</label>
            <select
              className="bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white"
              value={commissionEditTypeId || ''}
              onChange={(e) => selectCommissionAccountType(e.target.value)}
            >
              {commissionAccountTypes.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addCommissionLevelRow}
              className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600"
            >
              + Add level
            </button>
            <button
              type="button"
              onClick={saveCommissionConfig}
              disabled={savingCommission || !commissionEditTypeId}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {savingCommission ? 'Saving…' : 'Save configuration'}
            </button>
          </div>
          <div className="space-y-3">
            {[...commissionLevelsDraft]
              .map((row, i) => ({ row, i }))
              .sort((a, b) => a.row.level - b.row.level)
              .map(({ row, i }) => (
                <div key={`${row.level}-${i}`} className="flex flex-wrap items-center gap-3">
                  <span className="text-gray-500 w-28 text-sm">Level {row.level}</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    className="w-24 bg-dark-700 border border-gray-700 rounded-lg px-2 py-1.5 text-white"
                    value={row.commissionPercent}
                    onChange={(e) =>
                      updateCommissionLevel(i, 'commissionPercent', parseFloat(e.target.value) || 0)
                    }
                  />
                  <span className="text-gray-500 text-sm">%</span>
                  <label className="flex items-center gap-2 text-gray-400 text-sm">
                    <input
                      type="checkbox"
                      checked={row.isActive !== false}
                      onChange={(e) => updateCommissionLevel(i, 'isActive', e.target.checked)}
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    className="text-red-400 text-sm hover:underline"
                    onClick={() => removeCommissionLevel(i)}
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
          <div className="border-t border-gray-700 pt-4 text-sm">
            <p className="text-gray-400">
              Active total:{' '}
              <span className="text-white font-medium">
                {commissionLevelsDraft
                  .filter((l) => l.isActive !== false)
                  .reduce((s, l) => s + Number(l.commissionPercent || 0), 0)
                  .toFixed(2)}
                %
              </span>
              <span className="text-gray-500 ml-2">
                — Platform keeps the remainder (for new trades).
              </span>
            </p>
          </div>
        </div>
      )}

      {/* IB Levels Tab */}
      {activeTab === 'levels' && (
        <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-800">
            <div>
              <h2 className="text-white font-semibold text-lg">IB Levels</h2>
              <p className="text-gray-500 text-sm">Configure level names, referral targets, and commission rates</p>
            </div>
            <button
              onClick={() => { setEditingLevel(null); setShowLevelModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus size={16} /> Add Level
            </button>
          </div>

          {ibLevels.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Award size={48} className="mx-auto mb-4 opacity-50" />
              <p>No IB levels configured</p>
              <button
                onClick={async () => {
                  await fetch(`${API_URL}/ib/admin/init-levels`, { method: 'POST' })
                  fetchIBLevels()
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Initialize Default Levels
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {ibLevels.map((level) => (
                <div key={level._id} className="p-4 hover:bg-dark-700/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${level.color}20` }}
                      >
                        {level.icon === 'crown' ? <Crown size={24} style={{ color: level.color }} /> :
                         level.icon === 'trophy' ? <Trophy size={24} style={{ color: level.color }} /> :
                         <Award size={24} style={{ color: level.color }} />}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg flex items-center gap-2">
                          {level.name}
                          <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                            Order: {level.order}
                          </span>
                          {!level.isActive && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs rounded">Inactive</span>
                          )}
                        </p>
                        <p className="text-gray-500 text-sm">
                          <Target size={12} className="inline mr-1" />
                          {level.referralTarget} referrals required
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingLevel(level); setShowLevelModal(true); }}
                        className="p-2 hover:bg-dark-600 rounded-lg text-gray-400 hover:text-white"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteLevel(level._id)}
                        className="p-2 hover:bg-dark-600 rounded-lg text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Commission Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                    <div className="bg-dark-700 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Commission Rate</p>
                      <p className="text-white font-bold text-lg">
                        {level.commissionType === 'PER_LOT' ? '$' : ''}{level.commissionRate}
                        <span className="text-gray-500 text-xs font-normal">
                          {level.commissionType === 'PERCENT' ? '%' : '/lot'}
                        </span>
                      </p>
                    </div>
                    <div className="bg-dark-700 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Downline L1</p>
                      <p className="text-green-500 font-medium">${level.downlineCommission?.level1 || 0}/lot</p>
                    </div>
                    <div className="bg-dark-700 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Downline L2</p>
                      <p className="text-green-500 font-medium">${level.downlineCommission?.level2 || 0}/lot</p>
                    </div>
                    <div className="bg-dark-700 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Downline L3</p>
                      <p className="text-green-500 font-medium">${level.downlineCommission?.level3 || 0}/lot</p>
                    </div>
                    <div className="bg-dark-700 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Downline L4</p>
                      <p className="text-green-500 font-medium">${level.downlineCommission?.level4 || 0}/lot</p>
                    </div>
                    <div className="bg-dark-700 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Downline L5</p>
                      <p className="text-green-500 font-medium">${level.downlineCommission?.level5 || 0}/lot</p>
                    </div>
                    <div className="bg-dark-700 rounded-lg p-3">
                      <p className="text-gray-500 text-xs">Referral Target</p>
                      <p className="text-purple-500 font-medium">{level.referralTarget}+ refs</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-800">
            <h2 className="text-white font-semibold text-lg">Commission Plans</h2>
            <button
              onClick={() => { setEditingPlan(null); setShowPlanModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus size={16} /> Add Plan
            </button>
          </div>

          <div className="divide-y divide-gray-800">
            {plans.map((plan) => (
              <div key={plan._id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-medium flex items-center gap-2">
                      {plan.name}
                      {plan.isDefault && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 text-xs rounded">Default</span>}
                    </p>
                    <p className="text-gray-500 text-sm">{plan.description}</p>
                  </div>
                  <button
                    onClick={() => { setEditingPlan(plan); setShowPlanModal(true); }}
                    className="p-2 hover:bg-dark-600 rounded-lg text-gray-400 hover:text-white"
                  >
                    <Edit size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                  <div className="bg-dark-700 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Level 1</p>
                    <p className="text-white font-medium">{plan.commissionType === 'PER_LOT' ? '$' : ''}{plan.levelCommissions?.level1 || 0}{plan.commissionType === 'PERCENTAGE' ? '%' : '/lot'}</p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Level 2</p>
                    <p className="text-white font-medium">{plan.commissionType === 'PER_LOT' ? '$' : ''}{plan.levelCommissions?.level2 || 0}{plan.commissionType === 'PERCENTAGE' ? '%' : '/lot'}</p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Level 3</p>
                    <p className="text-white font-medium">{plan.commissionType === 'PER_LOT' ? '$' : ''}{plan.levelCommissions?.level3 || 0}{plan.commissionType === 'PERCENTAGE' ? '%' : '/lot'}</p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Level 4</p>
                    <p className="text-white font-medium">{plan.commissionType === 'PER_LOT' ? '$' : ''}{plan.levelCommissions?.level4 || 0}{plan.commissionType === 'PERCENTAGE' ? '%' : '/lot'}</p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Level 5</p>
                    <p className="text-white font-medium">{plan.commissionType === 'PER_LOT' ? '$' : ''}{plan.levelCommissions?.level5 || 0}{plan.commissionType === 'PERCENTAGE' ? '%' : '/lot'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && settings && (
        <div className="bg-dark-800 rounded-xl border border-gray-800 p-6">
          <h2 className="text-white font-semibold text-lg mb-6">IB System Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">IB System Enabled</p>
                <p className="text-gray-500 text-sm">Enable or disable the entire IB system</p>
              </div>
              <button
                onClick={() => handleUpdateSettings({ isEnabled: !settings.isEnabled })}
                className={`w-12 h-6 rounded-full transition-colors ${settings.isEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.isEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Allow New Applications</p>
                <p className="text-gray-500 text-sm">Allow users to apply as IBs</p>
              </div>
              <button
                onClick={() => handleUpdateSettings({ allowNewApplications: !settings.allowNewApplications })}
                className={`w-12 h-6 rounded-full transition-colors ${settings.allowNewApplications ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.allowNewApplications ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Auto-Approve Applications</p>
                <p className="text-gray-500 text-sm">Automatically approve new IB applications</p>
              </div>
              <button
                onClick={() => handleUpdateSettings({ autoApprove: !settings.autoApprove })}
                className={`w-12 h-6 rounded-full transition-colors ${settings.autoApprove ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.autoApprove ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">KYC Required</p>
                <p className="text-gray-500 text-sm">Require KYC approval to become an IB</p>
              </div>
              <button
                onClick={() => handleUpdateSettings({ ibRequirements: { ...settings.ibRequirements, kycRequired: !settings.ibRequirements?.kycRequired } })}
                className={`w-12 h-6 rounded-full transition-colors ${settings.ibRequirements?.kycRequired ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.ibRequirements?.kycRequired ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Withdrawal Approval Required</p>
                <p className="text-gray-500 text-sm">Require admin approval for IB withdrawals</p>
              </div>
              <button
                onClick={() => handleUpdateSettings({ commissionSettings: { ...settings.commissionSettings, withdrawalApprovalRequired: !settings.commissionSettings?.withdrawalApprovalRequired } })}
                className={`w-12 h-6 rounded-full transition-colors ${settings.commissionSettings?.withdrawalApprovalRequired ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.commissionSettings?.withdrawalApprovalRequired ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div>
              <p className="text-white font-medium mb-2">Minimum Withdrawal Amount</p>
              <input
                type="number"
                value={settings.commissionSettings?.minWithdrawalAmount || 50}
                onChange={(e) => handleUpdateSettings({ commissionSettings: { ...settings.commissionSettings, minWithdrawalAmount: parseFloat(e.target.value) } })}
                className="bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white w-32"
              />
            </div>
          </div>
        </div>
      )}

      {/* Referral Transfer Tab */}
      {activeTab === 'transfer' && (
        <div className="bg-dark-800 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft size={20} className="text-purple-500" />
              <h2 className="text-white font-semibold text-lg">Referral Transfer</h2>
            </div>
            <p className="text-gray-500 text-sm">Transfer users to any IB partner. Select users and choose the target IB.</p>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Target IB Selection */}
            <div className="bg-dark-700 rounded-lg p-4">
              <label className="text-gray-400 text-sm block mb-2">Select Target IB</label>
              <select
                value={targetIB}
                onChange={(e) => setTargetIB(e.target.value)}
                className="w-full bg-dark-600 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">-- Select an IB --</option>
                {ibs.filter(ib => ib.ibStatus === 'ACTIVE').map(ib => (
                  <option key={ib._id} value={ib._id}>
                    {ib.firstName} {ib.lastName} ({ib.email}) - Code: {ib.referralCode || 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            {/* User Search and Selection */}
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Select Users to Transfer</label>
                  <p className="text-gray-500 text-xs">{selectedUsers.length} users selected</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllUsers}
                    className="px-3 py-1.5 bg-blue-500/20 text-blue-500 rounded-lg text-sm hover:bg-blue-500/30"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllUsers}
                    className="px-3 py-1.5 bg-gray-600 text-gray-300 rounded-lg text-sm hover:bg-gray-500"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="relative mb-3">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search users by name, email or ID..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full bg-dark-600 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {filteredUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No users found</p>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user._id}
                      onClick={() => toggleUserSelection(user._id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.includes(user._id)
                          ? 'bg-purple-500/20 border border-purple-500/50'
                          : 'bg-dark-600 border border-transparent hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedUsers.includes(user._id)
                            ? 'bg-purple-500 border-purple-500'
                            : 'border-gray-500'
                        }`}>
                          {selectedUsers.includes(user._id) && <Check size={12} className="text-white" />}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{user.firstName} {user.lastName || ''}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs font-mono">{user._id?.slice(-8)}</p>
                        {user.referredBy && (
                          <p className="text-yellow-500 text-xs">Current IB: {user.referredBy?.slice(-6)}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Transfer Button */}
            <div className="flex justify-end">
              <button
                onClick={handleTransferReferrals}
                disabled={transferLoading || selectedUsers.length === 0 || !targetIB}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                  transferLoading || selectedUsers.length === 0 || !targetIB
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {transferLoading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft size={18} />
                    Transfer {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <PlanModal
          plan={editingPlan}
          onSave={handleSavePlan}
          onClose={() => { setShowPlanModal(false); setEditingPlan(null); }}
        />
      )}

      {/* Level Modal */}
      {showLevelModal && (
        <LevelModal
          level={editingLevel}
          onSave={handleSaveLevel}
          onClose={() => { setShowLevelModal(false); setEditingLevel(null); }}
          existingOrders={ibLevels.map(l => l.order)}
        />
      )}

      {/* IB Details Modal */}
      {showIBModal && (
        <IBDetailsModal
          ib={viewingIB}
          ibTiers={sortedIbTiers}
          selectedTierId={ibDetailTierId}
          setSelectedTierId={setIbDetailTierId}
          onSave={handleSaveIBDetails}
          onClose={() => { setShowIBModal(false); setViewingIB(null); }}
          saving={savingIB}
        />
      )}
    </AdminLayout>
  )
}

// Plan Modal Component
const PlanModal = ({ plan, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    maxLevels: plan?.maxLevels || 3,
    commissionType: plan?.commissionType || 'PER_LOT',
    levelCommissions: plan?.levelCommissions || { level1: 5, level2: 3, level3: 2, level4: 1, level5: 0.5 },
    isDefault: plan?.isDefault || false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold text-lg">{plan ? 'Edit Plan' : 'Create Plan'}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Plan Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1">Commission Type</label>
              <select
                value={formData.commissionType}
                onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="PER_LOT">Per Lot ($)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Max Levels</label>
              <select
                value={formData.maxLevels}
                onChange={(e) => setFormData({ ...formData, maxLevels: parseInt(e.target.value) })}
                className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-2">Level Commissions</label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(level => (
                <div key={level}>
                  <label className="text-gray-500 text-xs">L{level}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.levelCommissions[`level${level}`] || 0}
                    onChange={(e) => setFormData({
                      ...formData,
                      levelCommissions: { ...formData.levelCommissions, [`level${level}`]: parseFloat(e.target.value) }
                    })}
                    className="w-full bg-dark-700 border border-gray-700 rounded-lg px-2 py-1 text-white text-sm"
                    disabled={level > formData.maxLevels}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-gray-400 text-sm">Set as default plan</label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {plan ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Level Modal Component
const LevelModal = ({ level, onSave, onClose, existingOrders }) => {
  const [formData, setFormData] = useState({
    name: level?.name || '',
    order: level?.order || (Math.max(...existingOrders, 0) + 1),
    referralTarget: level?.referralTarget || 0,
    commissionRate: level?.commissionRate || 0,
    commissionType: level?.commissionType || 'PER_LOT',
    downlineCommission: level?.downlineCommission || { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 },
    color: level?.color || '#10B981',
    icon: level?.icon || 'award',
    isActive: level?.isActive !== false
  })

  const colorOptions = [
    { value: '#6B7280', label: 'Gray' },
    { value: '#CD7F32', label: 'Bronze' },
    { value: '#C0C0C0', label: 'Silver' },
    { value: '#FFD700', label: 'Gold' },
    { value: '#E5E4E2', label: 'Platinum' },
    { value: '#10B981', label: 'Green' },
    { value: '#3B82F6', label: 'Blue' },
    { value: '#8B5CF6', label: 'Purple' }
  ]

  const iconOptions = [
    { value: 'user', label: 'User' },
    { value: 'award', label: 'Award' },
    { value: 'trophy', label: 'Trophy' },
    { value: 'crown', label: 'Crown' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold text-lg">{level ? 'Edit IB Level' : 'Create IB Level'}</h3>
          <p className="text-gray-500 text-sm">Configure level settings and commission rates</p>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1">Level Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Bronze, Silver, Gold"
                className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Order *</label>
              <input
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
                required
              />
              <p className="text-gray-600 text-xs mt-1">Lower order = lower level (1 is starter)</p>
            </div>
          </div>

          {/* Referral Target */}
          <div>
            <label className="text-gray-400 text-sm block mb-1">Referral Target</label>
            <input
              type="number"
              min="0"
              value={formData.referralTarget}
              onChange={(e) => setFormData({ ...formData, referralTarget: parseInt(e.target.value) })}
              className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
            <p className="text-gray-600 text-xs mt-1">Number of referrals needed to reach this level (0 for starter level)</p>
          </div>

          {/* Commission Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1">Commission Rate</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
                className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Commission Type</label>
              <select
                value={formData.commissionType}
                onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="PER_LOT">Per Lot ($)</option>
                <option value="PERCENT">Percentage (%)</option>
              </select>
            </div>
          </div>

          {/* Downline Commission Distribution */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Downline Commission Distribution ($/lot)</label>
            <p className="text-gray-600 text-xs mb-3">Set commission rates for each downline level</p>
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map(lvl => (
                <div key={lvl}>
                  <label className="text-gray-500 text-xs block mb-1">Level {lvl}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.downlineCommission[`level${lvl}`] || 0}
                    onChange={(e) => setFormData({
                      ...formData,
                      downlineCommission: { 
                        ...formData.downlineCommission, 
                        [`level${lvl}`]: parseFloat(e.target.value) || 0 
                      }
                    })}
                    className="w-full bg-dark-700 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Appearance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1">Color</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                {colorOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">Icon</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full bg-dark-700 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                {iconOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-gray-400 text-sm">Level is active</label>
          </div>

          {/* Preview */}
          <div className="bg-dark-700 rounded-lg p-4">
            <p className="text-gray-500 text-xs mb-2">Preview</p>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${formData.color}20` }}
              >
                <Award size={20} style={{ color: formData.color }} />
              </div>
              <div>
                <p className="text-white font-medium">{formData.name || 'Level Name'}</p>
                <p className="text-gray-500 text-xs">${formData.commissionRate}/lot • {formData.referralTarget}+ referrals</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {level ? 'Update Level' : 'Create Level'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// IB Details Modal Component
const IBDetailsModal = ({ ib, ibTiers, selectedTierId, setSelectedTierId, onSave, onClose, saving }) => {
  if (!ib) return null

  const tierName = ib.ibLevelId?.name || '—'
  const parent = ib.parentIBId && typeof ib.parentIBId === 'object' ? ib.parentIBId : null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-xl w-full max-w-md border border-gray-700 shadow-xl shadow-black/40">
        <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">IB details</h3>
            <p className="text-gray-500 text-xs mt-0.5">Tier & hierarchy</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[min(80vh,640px)] overflow-y-auto">
          <div className="flex items-start gap-4 bg-dark-700/80 rounded-xl p-4 border border-gray-700/80">
            <div className="w-14 h-14 shrink-0 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/20">
              <span className="text-blue-400 font-bold text-xl">{ib.firstName?.charAt(0) || '?'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-lg leading-tight">{ib.firstName} {ib.lastName || ''}</p>
              <p className="text-gray-400 text-sm truncate">{ib.email}</p>
              <p className="text-gray-500 text-xs mt-2">
                Code{' '}
                <span className="text-blue-400 font-mono">{ib.referralCode || '—'}</span>
              </p>
              {parent && (
                <p className="text-gray-500 text-xs mt-1.5">
                  Under{' '}
                  <span className="text-gray-300">{parent.firstName}</span>{' '}
                  <span className="text-gray-600 font-mono">{parent.referralCode || ''}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-dark-900/60 rounded-lg p-3 text-center border border-gray-800">
              <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Status</p>
              <p className={`text-sm font-semibold ${ib.ibStatus === 'ACTIVE' ? 'text-green-400' : ib.ibStatus === 'BLOCKED' ? 'text-red-400' : 'text-amber-400'}`}>
                {ib.ibStatus || '—'}
              </p>
            </div>
            <div className="bg-dark-900/60 rounded-lg p-3 text-center border border-gray-800">
              <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">IB tier</p>
              <p className="text-sm font-semibold text-white truncate" title={tierName}>
                {tierName}
              </p>
            </div>
            <div className="bg-dark-900/60 rounded-lg p-3 text-center border border-gray-800">
              <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Direct refs</p>
              <p className="text-sm font-semibold text-white">{ib.directReferralCount ?? ib.referralCount ?? 0}</p>
            </div>
          </div>

          <p className="text-gray-600 text-[11px] leading-relaxed">
            <span className="text-gray-500">Chain depth</span> (upline levels):{' '}
            <span className="text-gray-400 font-mono">{ib.ibLevel ?? 0}</span> — separate from reward tier below.
          </p>

          <div className="space-y-2">
            <label htmlFor="ib-modal-tier" className="block text-sm font-medium text-gray-300">
              Reward tier (IB Levels)
            </label>
            <select
              id="ib-modal-tier"
              value={selectedTierId}
              onChange={(e) => setSelectedTierId(e.target.value)}
              className="w-full bg-dark-900 border border-gray-600 rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50"
            >
              {ibTiers.length === 0 ? (
                <option value="">Configure tiers in IB Levels tab</option>
              ) : (
                ibTiers.map((lvl) => (
                  <option key={lvl._id} value={lvl._id}>
                    {lvl.name} · order {lvl.order}
                  </option>
                ))
              )}
            </select>
            <p className="text-gray-500 text-xs">Rates and targets for this tier are edited under IB Levels.</p>
          </div>

          <div className="rounded-lg border border-red-500/25 bg-red-500/5 p-4 space-y-2">
            <p className="text-red-400/90 text-xs font-medium uppercase tracking-wide">Danger zone</p>
            {ib.ibStatus === 'BLOCKED' ? (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_URL}/ib/admin/unblock/${ib._id}`, { method: 'PUT' })
                    const data = await res.json()
                    if (data.success) {
                      toast.success('IB unblocked')
                      onClose()
                    }
                  } catch (e) {
                    toast.error('Failed to unblock')
                  }
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30"
              >
                Unblock IB
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  const reason = prompt('Block reason:')
                  if (!reason) return
                  try {
                    const res = await fetch(`${API_URL}/ib/admin/block/${ib._id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reason })
                    })
                    const data = await res.json()
                    if (data.success) {
                      toast.success('IB blocked')
                      onClose()
                    }
                  } catch (e) {
                    toast.error('Failed to block')
                  }
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium border border-red-500/40 text-red-300 bg-red-500/10 hover:bg-red-500/20"
              >
                Block IB
              </button>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-700 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-dark-700 text-gray-200 hover:bg-dark-600 border border-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !selectedTierId}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save tier'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminIBManagement
