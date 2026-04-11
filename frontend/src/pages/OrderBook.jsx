import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  User,
  Wallet,
  Users,
  Copy,
  UserCircle,
  HelpCircle,
  FileText,
  LogOut,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Home,
  BookOpen,
  History,
  Activity,
  Sun,
  Moon,
  Globe,
  Settings
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { API_URL } from '../config/api'
import priceStreamService from '../services/priceStream'
import logoImage from '../assets/logo.png'
import LanguageDropdown from '../components/LanguageDropdown'
import UserHeader from '../components/UserHeader'
import { useLockDocumentScroll } from '../hooks/useLockDocumentScroll'
import toast from 'react-hot-toast'

const OrderBook = () => {
  useLockDocumentScroll()
  const navigate = useNavigate()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { t } = useTranslation()
  const [activeMenu, setActiveMenu] = useState('Orders')
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('positions') // positions, history, pending
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [accounts, setAccounts] = useState([])
  const [openTrades, setOpenTrades] = useState([])
  const [closedTrades, setClosedTrades] = useState([])
  const [pendingOrders, setPendingOrders] = useState([])
  const [livePrices, setLivePrices] = useState({})
  const [historyFilter, setHistoryFilter] = useState('all') // all, today, week, month, year
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const menuItems = [
    { name: 'Dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Account', label: t('nav.account'), icon: User, path: '/account' },
    { name: 'Wallet', label: t('nav.wallet'), icon: Wallet, path: '/wallet' },
    { name: 'Orders', label: t('nav.orders'), icon: BookOpen, path: '/orders' },
    { name: 'IB', label: t('nav.ib'), icon: Users, path: '/ib' },
    { name: 'Copytrade', label: t('nav.copytrade'), icon: Copy, path: '/copytrade' },
    { name: 'Profile', label: t('nav.profile'), icon: UserCircle, path: '/profile' },
    { name: 'Support', label: t('nav.support'), icon: HelpCircle, path: '/support' },
  ]

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (user._id) {
      fetchAccounts()
    }
  }, [user._id])

  useEffect(() => {
    if (accounts.length > 0) {
      fetchAllTrades()
    }
  }, [accounts, selectedAccount])

  // Subscribe to real-time WebSocket prices
  useEffect(() => {
    const unsubscribe = priceStreamService.subscribe('orderbook', (prices) => {
      setLivePrices(prices)
    })
    
    return () => unsubscribe()
  }, [])

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_URL}/trading-accounts/user/${user._id}`)
      const data = await res.json()
      setAccounts(data.accounts || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const fetchAllTrades = async () => {
    setLoading(true)
    try {
      const accountsToFetch = selectedAccount === 'all' 
        ? accounts 
        : accounts.filter(a => a._id === selectedAccount)

      let allOpen = []
      let allClosed = []
      let allPending = []

      for (const account of accountsToFetch) {
        // Fetch open trades
        const openRes = await fetch(`${API_URL}/trade/open/${account._id}`)
        const openData = await openRes.json()
        if (openData.success && openData.trades) {
          allOpen = [...allOpen, ...openData.trades.map(t => ({ ...t, accountName: account.accountId }))]
        }

        // Fetch closed trades (history)
        const historyRes = await fetch(`${API_URL}/trade/history/${account._id}`)
        const historyData = await historyRes.json()
        if (historyData.success && historyData.trades) {
          allClosed = [...allClosed, ...historyData.trades.map(t => ({ ...t, accountName: account.accountId }))]
        }

        // Fetch pending orders
        const pendingRes = await fetch(`${API_URL}/trade/pending/${account._id}`)
        const pendingData = await pendingRes.json()
        if (pendingData.success && pendingData.trades) {
          allPending = [...allPending, ...pendingData.trades.map(o => ({ ...o, accountName: account.accountId }))]
        }
      }

      setOpenTrades(allOpen)
      setClosedTrades(allClosed.sort((a, b) => new Date(b.closedAt) - new Date(a.closedAt)))
      setPendingOrders(allPending)
    } catch (error) {
      console.error('Error fetching trades:', error)
    }
    setLoading(false)
  }

  const calculateFloatingPnl = (trade) => {
    const prices = livePrices[trade.symbol]
    if (!prices || !prices.bid) return 0
    
    const currentPrice = trade.side === 'BUY' ? prices.bid : prices.ask
    if (!currentPrice) return 0
    
    const contractSize = trade.contractSize || getContractSize(trade.symbol)
    const pnl = trade.side === 'BUY'
      ? (currentPrice - trade.openPrice) * trade.quantity * contractSize
      : (trade.openPrice - currentPrice) * trade.quantity * contractSize
    
    return pnl - (trade.commission || 0) - (trade.swap || 0)
  }

  const getContractSize = (symbol) => {
    if (symbol === 'XAUUSD') return 100
    if (symbol === 'XAGUSD') return 5000
    if (['BTCUSD', 'ETHUSD'].includes(symbol)) return 1
    return 100000
  }

  const getTotalPnl = () => {
    return openTrades.reduce((sum, trade) => sum + calculateFloatingPnl(trade), 0)
  }

  const getHistoryTotalPnl = () => {
    return getFilteredHistory().reduce((sum, trade) => sum + (trade.realizedPnl || 0), 0)
  }

  const getFilteredHistory = () => {
    const now = new Date()
    return closedTrades.filter(trade => {
      if (historyFilter === 'all') return true
      const tradeDate = new Date(trade.closedAt)
      if (historyFilter === 'today') {
        return tradeDate.toDateString() === now.toDateString()
      }
      if (historyFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return tradeDate >= weekAgo
      }
      if (historyFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return tradeDate >= monthAgo
      }
      if (historyFilter === 'year') {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        return tradeDate >= yearAgo
      }
      return true
    })
  }

  const getPaginatedHistory = () => {
    const filtered = getFilteredHistory()
    const startIndex = (currentPage - 1) * itemsPerPage
    return filtered.slice(startIndex, startIndex + itemsPerPage)
  }

  const totalPages = Math.ceil(getFilteredHistory().length / itemsPerPage)

  const downloadCSV = (data, filename) => {
    const headers = ['Date', 'Account', 'Symbol', 'Side', 'Quantity', 'Open Price', 'Close Price', 'P&L', 'Status']
    const rows = data.map(trade => [
      new Date(trade.closedAt || trade.openedAt || trade.createdAt).toLocaleString(),
      trade.accountName || 'N/A',
      trade.symbol,
      trade.side,
      trade.quantity,
      trade.openPrice?.toFixed(5),
      trade.closePrice?.toFixed(5) || '-',
      (trade.realizedPnl || calculateFloatingPnl(trade)).toFixed(2),
      trade.status
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const handleCloseTrade = async (trade) => {
    if (!confirm(`Close ${trade.side} ${trade.quantity} ${trade.symbol} position?`)) return
    
    try {
      const currentPrice = livePrices[trade.symbol]?.[trade.side === 'BUY' ? 'bid' : 'ask']
      if (!currentPrice) {
        toast.error('Unable to get current price. Please try again.')
        return
      }

      const res = await fetch(`${API_URL}/trade/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeId: trade._id,
          closePrice: currentPrice
        })
      })
      const data = await res.json()
      
      if (res.ok && data.success) {
        toast.success(`Trade closed! P&L: $${data.trade?.realizedPnl?.toFixed(2) || '0.00'}`)
        fetchAllTrades()
      } else {
        toast.error(data.message || 'Failed to close trade')
      }
    } catch (error) {
      console.error('Close trade error:', error)
      toast.error('Error closing trade')
    }
  }

  const handleCancelOrder = async (order) => {
    if (!confirm(`Cancel pending ${order.side} ${order.quantity} ${order.symbol} order?`)) return
    
    try {
      const res = await fetch(`${API_URL}/trade/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId: order._id })
      })
      const data = await res.json()
      
      if (res.ok && data.success) {
        toast.success('Order cancelled successfully')
        fetchAllTrades()
      } else {
        toast.error(data.message || 'Failed to cancel order')
      }
    } catch (error) {
      console.error('Cancel order error:', error)
      toast.error('Error cancelling order')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/user/login')
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-col overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-dark-900' : 'bg-gray-100'}`}>
      {/* Mobile Header */}
      {isMobile && (
        <header className={`fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center gap-4 ${isDarkMode ? 'bg-dark-800 border-b border-gray-800' : 'bg-white border-b border-gray-200'}`}>
          <button onClick={() => navigate('/mobile')} className={`p-2 -ml-2 rounded-lg ${isDarkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-100'}`}>
            <ArrowLeft size={22} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
          </button>
          <h1 className={`font-semibold text-lg flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order Book</h1>
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${isDarkMode ? 'text-yellow-400 hover:bg-dark-700' : 'text-blue-500 hover:bg-gray-100'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => navigate('/mobile')} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-100'}`}>
            <Home size={20} className="text-gray-400" />
          </button>
        </header>
      )}

      {/* Full Width Header - Desktop Only */}
      {!isMobile && (
        <div className="w-full shrink-0 relative border-b bg-gradient-to-r from-dark-800 via-dark-900 to-dark-800 border-gray-800">
          <div className="flex items-center justify-between px-6 py-3">
            <img src={logoImage} alt="BULL4X" className="h-8 w-auto object-contain" />
            <UserHeader />
          </div>
        </div>
      )}

      {/* Main Layout - Sidebar + Content */}
      <div className={`flex-1 flex min-h-0 overflow-hidden ${isMobile ? 'flex-col' : ''}`}>
        {/* Sidebar - Desktop Only */}
        {!isMobile && (
          <aside 
            className={`${sidebarExpanded ? 'w-48' : 'w-16'} ${isDarkMode ? 'bg-dark-900 border-gray-800' : 'bg-white border-gray-200'} border-r flex flex-col shrink-0 min-h-0 overflow-hidden transition-all duration-300`}
            onMouseEnter={() => setSidebarExpanded(true)}
            onMouseLeave={() => setSidebarExpanded(false)}
          >
            <nav className="hide-scrollbar flex-1 min-h-0 overflow-y-auto px-2 pt-4">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  activeMenu === item.name 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                    : isDarkMode ? 'text-gray-400 hover:text-white hover:bg-dark-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {sidebarExpanded && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>
          <div className={`p-2 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-dark-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
              <LogOut size={18} />
              {sidebarExpanded && <span className="text-sm">{t('nav.logout')}</span>}
            </button>
          </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={`hide-scrollbar flex-1 min-h-0 overflow-y-auto ${isMobile ? 'pt-14' : ''}`}>
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
          {/* Order History Heading */}
          <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order History</h1>
          
          {/* Account Filter & Stats */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-4 gap-4'} mb-4`}>
            {/* Account Selector */}
            <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-dark-800 border-gray-800' : 'bg-white border-gray-200'}`}>
              <label className={`block text-xs mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>{t('orders.selectAccount')}</label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 text-sm ${isDarkMode ? 'bg-dark-700 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border`}
              >
                <option value="all">{t('orders.allAccounts')}</option>
                {accounts.map(acc => (
                  <option key={acc._id} value={acc._id}>{acc.accountId}</option>
                ))}
              </select>
            </div>

            {/* Open Positions Count */}
            <div className={`${isDarkMode ? 'bg-dark-800 border-gray-800' : 'bg-white border-gray-200 shadow-sm'} rounded-xl p-4 border`}>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>{t('orders.openPositions')}</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{openTrades.length}</p>
            </div>

            {/* Floating P&L */}
            <div className={`${isDarkMode ? 'bg-dark-800 border-gray-800' : 'bg-white border-gray-200 shadow-sm'} rounded-xl p-4 border`}>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>{t('orders.floatingPnl')}</p>
              <p className={`text-2xl font-bold ${getTotalPnl() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {getTotalPnl() >= 0 ? '+' : ''}${getTotalPnl().toFixed(2)}
              </p>
            </div>

            {/* Total Closed P&L */}
            <div className={`${isDarkMode ? 'bg-dark-800 border-gray-800' : 'bg-white border-gray-200 shadow-sm'} rounded-xl p-4 border`}>
              <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>{t('orders.realizedPnl')}</p>
              <p className={`text-2xl font-bold ${getHistoryTotalPnl() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {getHistoryTotalPnl() >= 0 ? '+' : ''}${getHistoryTotalPnl().toFixed(2)}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className={`${isDarkMode ? 'bg-dark-800 border-gray-800' : 'bg-white border-gray-200 shadow-sm'} rounded-xl border overflow-hidden`}>
            <div className={`flex border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <button
                onClick={() => setActiveTab('positions')}
                className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
                  activeTab === 'positions' ? 'bg-accent-green/10 text-accent-green border-b-2 border-accent-green' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Activity size={16} /> {t('orders.positions')} ({openTrades.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
                  activeTab === 'history' ? 'bg-accent-green/10 text-accent-green border-b-2 border-accent-green' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <History size={16} /> {t('orders.history')} ({closedTrades.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
                  activeTab === 'pending' ? 'bg-accent-green/10 text-accent-green border-b-2 border-accent-green' : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Clock size={16} /> {t('orders.pending')} ({pendingOrders.length})
              </button>
            </div>

            {/* Tab Actions */}
            <div className={`p-3 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <button
                onClick={fetchAllTrades}
                className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
              <button
                onClick={() => downloadCSV(activeTab === 'positions' ? openTrades : closedTrades, activeTab)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${isDarkMode ? 'bg-dark-700 hover:bg-dark-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              >
                <Download size={14} /> Download CSV
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw size={24} className="text-gray-500 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Positions Tab */}
                {activeTab === 'positions' && (
                  openTrades.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity size={48} className="text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500">No open positions</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Account</th>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Symbol</th>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Side</th>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Qty</th>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Open Price</th>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Current</th>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">P&L</th>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">SL/TP</th>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {openTrades.map((trade) => {
                          const pnl = calculateFloatingPnl(trade)
                          const currentPrice = livePrices[trade.symbol]?.[trade.side === 'BUY' ? 'bid' : 'ask']
                          return (
                            <tr key={trade._id} className={`border-b ${isDarkMode ? 'border-gray-800 hover:bg-dark-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                              <td className="py-3 px-4 text-gray-400 text-sm">{trade.accountName}</td>
                              <td className={`py-3 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{trade.symbol}</td>
                              <td className="py-3 px-4">
                                <span className={`flex items-center gap-1 ${trade.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                                  {trade.side === 'BUY' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                  {trade.side}
                                </span>
                              </td>
                              <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{trade.quantity}</td>
                              <td className="py-3 px-4 text-gray-400">{trade.openPrice?.toFixed(5)}</td>
                              <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentPrice?.toFixed(5) || '-'}</td>
                              <td className={`py-3 px-4 font-medium ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-gray-400 text-xs">
                                <div>SL: {trade.stopLoss || '-'}</div>
                                <div>TP: {trade.takeProfit || '-'}</div>
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleCloseTrade(trade)}
                                  className="bg-red-500/20 text-red-500 hover:bg-red-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                >
                                  Close
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                  <>
                    {/* Date Filter Buttons */}
                    <div className="flex flex-wrap items-center gap-2 p-3 border-b border-gray-800">
                      {[
                        { key: 'all', label: 'All' },
                        { key: 'today', label: 'Today' },
                        { key: 'week', label: 'This Week' },
                        { key: 'month', label: 'This Month' },
                        { key: 'year', label: 'This Year' }
                      ].map(filter => (
                        <button
                          key={filter.key}
                          onClick={() => { setHistoryFilter(filter.key); setCurrentPage(1) }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            historyFilter === filter.key 
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                              : 'bg-dark-700 text-gray-400 hover:text-white'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                      <span className="ml-auto text-gray-500 text-xs">
                        {getFilteredHistory().length} trades | P&L: <span className={getHistoryTotalPnl() >= 0 ? 'text-green-500' : 'text-red-500'}>${getHistoryTotalPnl().toFixed(2)}</span>
                      </span>
                    </div>

                    {getFilteredHistory().length === 0 ? (
                      <div className="text-center py-12">
                        <History size={48} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500">No trade history for this period</p>
                      </div>
                    ) : (
                      <>
                        <table className="w-full">
                          <thead>
                            <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Date</th>
                              <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Account</th>
                              <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Symbol</th>
                              <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Side</th>
                              <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Qty</th>
                              <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Open</th>
                              <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Close</th>
                              <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">P&L</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPaginatedHistory().map((trade) => (
                              <tr key={trade._id} className={`border-b ${isDarkMode ? 'border-gray-800 hover:bg-dark-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <td className="py-3 px-4 text-gray-400 text-xs">{formatDate(trade.closedAt)}</td>
                                <td className="py-3 px-4 text-gray-400 text-sm">{trade.accountName}</td>
                                <td className={`py-3 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{trade.symbol}</td>
                                <td className="py-3 px-4">
                                  <span className={`flex items-center gap-1 ${trade.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                                    {trade.side === 'BUY' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {trade.side}
                                  </span>
                                </td>
                                <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{trade.quantity}</td>
                                <td className="py-3 px-4 text-gray-400">{trade.openPrice?.toFixed(5)}</td>
                                <td className="py-3 px-4 text-gray-400">{trade.closePrice?.toFixed(5)}</td>
                                <td className={`py-3 px-4 font-medium ${(trade.realizedPnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {(trade.realizedPnl || 0) >= 0 ? '+' : ''}${(trade.realizedPnl || 0).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between p-4 border-t border-gray-800">
                            <span className="text-gray-500 text-sm">
                              Page {currentPage} of {totalPages}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 bg-dark-700 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600"
                              >
                                Previous
                              </button>
                              <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 bg-dark-700 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Pending Tab */}
                {activeTab === 'pending' && (
                  pendingOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock size={48} className="text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500">No pending orders</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Account</th>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Symbol</th>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Type</th>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Side</th>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Qty</th>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Price</th>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Status</th>
                          <th className="text-left text-gray-500 text-xs font-medium py-3 px-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingOrders.map((order) => (
                          <tr key={order._id} className={`border-b ${isDarkMode ? 'border-gray-800 hover:bg-dark-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <td className="py-3 px-4 text-gray-400 text-sm">{order.accountName}</td>
                            <td className={`py-3 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.symbol}</td>
                            <td className="py-3 px-4 text-yellow-500 text-sm">{order.orderType}</td>
                            <td className="py-3 px-4">
                              <span className={`flex items-center gap-1 ${order.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                                {order.side === 'BUY' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {order.side}
                              </span>
                            </td>
                            <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.quantity}</td>
                            <td className="py-3 px-4 text-gray-400">{order.limitPrice?.toFixed(5) || order.stopPrice?.toFixed(5)}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs">
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleCancelOrder(order)}
                                className="bg-red-500/20 text-red-500 hover:bg-red-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}
              </div>
            )}
          </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default OrderBook
