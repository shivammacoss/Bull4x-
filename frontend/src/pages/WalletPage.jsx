import { useState, useEffect, useRef } from 'react'
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
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  X,
  Check,
  Clock,
  XCircle,
  Building,
  Smartphone,
  QrCode,
  Trophy,
  ArrowRightLeft,
  Send,
  Download,
  ArrowLeft,
  Home,
  Upload,
  Image,
  BookOpen,
  Sun,
  Moon,
  Gift,
  Globe,
  Settings
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { API_URL } from '../config/api'
import logoImage from '../assets/logo.png'
import cryptoLogo from '../assets/crypto_logo.png'
import LanguageDropdown from '../components/LanguageDropdown'
import UserHeader from '../components/UserHeader'
import { useLockDocumentScroll } from '../hooks/useLockDocumentScroll'

const WalletPage = () => {
  useLockDocumentScroll()
  const navigate = useNavigate()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { t } = useTranslation()
  const [activeMenu, setActiveMenu] = useState('Wallet')
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawPreviewModal, setShowWithdrawPreviewModal] = useState(false)
  const [showWithdrawOtpModal, setShowWithdrawOtpModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawPreviewAccepted, setWithdrawPreviewAccepted] = useState(false)
  const [withdrawOtpCode, setWithdrawOtpCode] = useState('')
  const [sendingWithdrawOtp, setSendingWithdrawOtp] = useState(false)
  const [verifyingWithdrawOtp, setVerifyingWithdrawOtp] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [tradingAccounts, setTradingAccounts] = useState([])
  const [selectedTradingAccount, setSelectedTradingAccount] = useState(null)
  const [transferAmount, setTransferAmount] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [amount, setAmount] = useState('')
  const [transactionRef, setTransactionRef] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [challengeModeEnabled, setChallengeModeEnabled] = useState(false)
  const [currencies, setCurrencies] = useState([])
  const [selectedCurrency, setSelectedCurrency] = useState(null)
  const [localAmount, setLocalAmount] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState(null)
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false)
  const [userBankAccounts, setUserBankAccounts] = useState([])
  const [selectedBankAccount, setSelectedBankAccount] = useState(null)
  const [bonusInfo, setBonusInfo] = useState(null)
  const [calculatingBonus, setCalculatingBonus] = useState(false)
  const fileInputRef = useRef(null)
  // Crypto deposit states
  const [depositMethod, setDepositMethod] = useState('bank') // 'bank' or 'crypto'
  const [cryptoCurrencies, setCryptoCurrencies] = useState([])
  const [selectedCryptoCurrency, setSelectedCryptoCurrency] = useState('USDT')
  const [cryptoAmount, setCryptoAmount] = useState('')
  const [cryptoPaymentData, setCryptoPaymentData] = useState(null)
  const [creatingCryptoPayment, setCreatingCryptoPayment] = useState(false)
  // Crypto withdrawal states
  const [withdrawWalletAddress, setWithdrawWalletAddress] = useState('')
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDT')
  const [withdrawNetwork, setWithdrawNetwork] = useState('TRC20')
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false)
  // Payment agreement checkbox
  const [agreeToPayment, setAgreeToPayment] = useState(false)

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

  // Handle screenshot file selection
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Screenshot must be less than 5MB')
        return
      }
      setScreenshot(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Download transactions as CSV
  const downloadTransactionsCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Method', 'Status', 'Reference']
    const rows = transactions.map(tx => [
      new Date(tx.createdAt).toLocaleString(),
      tx.type,
      tx.amount.toFixed(2),
      tx.paymentMethod || 'Internal',
      tx.status,
      tx.transactionRef || '-'
    ])
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchChallengeStatus()
    if (user._id) {
      fetchWallet()
      fetchTransactions()
      fetchUserBankAccounts()
    }
    fetchPaymentMethods()
    fetchCurrencies()
  }, [user._id])

  const fetchUserBankAccounts = async () => {
    try {
      const res = await fetch(`${API_URL}/payment-methods/user-banks/${user._id}/approved`)
      const data = await res.json()
      setUserBankAccounts(data.accounts || [])
    } catch (error) {
      console.error('Error fetching user bank accounts:', error)
    }
  }

  const fetchTradingAccounts = async () => {
    try {
      const res = await fetch(`${API_URL}/trading-accounts/user/${user._id}`)
      const data = await res.json()
      setTradingAccounts(data.accounts || [])
    } catch (error) {
      console.error('Error fetching trading accounts:', error)
    }
  }

  const handleTransferToAccount = async () => {
    if (!selectedTradingAccount) {
      setError('Please select a trading account')
      return
    }
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (parseFloat(transferAmount) > (wallet?.balance || 0)) {
      setError('Insufficient wallet balance')
      return
    }

    try {
      const res = await fetch(`${API_URL}/trading-accounts/${selectedTradingAccount._id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          amount: parseFloat(transferAmount),
          direction: 'deposit',
          skipPinVerification: true
        })
      })
      const data = await res.json()
      
      if (res.ok) {
        setSuccess('Funds transferred successfully!')
        setShowTransferModal(false)
        setTransferAmount('')
        setSelectedTradingAccount(null)
        setError('')
        fetchWallet()
        fetchTransactions()
        fetchTradingAccounts()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Transfer failed')
      }
    } catch (error) {
      console.error('Transfer error:', error)
      setError('Error transferring funds')
    }
  }

  const fetchCurrencies = async () => {
    try {
      const res = await fetch(`${API_URL}/payment-methods/currencies/active`)
      const data = await res.json()
      setCurrencies(data.currencies || [])
      // Set USD as default if no currencies
      if (!data.currencies || data.currencies.length === 0) {
        setSelectedCurrency({ currency: 'USD', symbol: '$', rateToUSD: 1, markup: 0 })
      }
    } catch (error) {
      console.error('Error fetching currencies:', error)
    }
  }

  // Calculate USD amount from local currency
  const calculateUSDAmount = (localAmt, currency) => {
    if (!currency || currency.currency === 'USD') return localAmt
    const effectiveRate = currency.rateToUSD * (1 + (currency.markup || 0) / 100)
    return localAmt / effectiveRate
  }

  // Calculate local amount from USD
  const calculateLocalAmount = (usdAmt, currency) => {
    if (!currency || currency.currency === 'USD') return usdAmt
    const effectiveRate = currency.rateToUSD * (1 + (currency.markup || 0) / 100)
    return usdAmt * effectiveRate
  }

  const fetchChallengeStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/prop/status`)
      const data = await res.json()
      if (data.success) {
        setChallengeModeEnabled(data.enabled)
      }
    } catch (error) {
      console.error('Error fetching challenge status:', error)
    }
  }

  const calculateBonus = async (amount) => {
    if (!amount || parseFloat(amount) <= 0) {
      setBonusInfo(null)
      return
    }

    setCalculatingBonus(true)
    try {
      // Check if this is user's first deposit by looking at their transaction history
      let isFirstDeposit = false
      try {
        const transactionsRes = await fetch(`${API_URL}/wallet/transactions/${user._id}`)
        const transactionsData = await transactionsRes.json()
        
        if (transactionsData.success && transactionsData.transactions) {
          // Check if user has any approved deposits
          const approvedDeposits = transactionsData.transactions.filter(
            tx => tx.type === 'Deposit' && tx.status === 'Approved'
          )
          isFirstDeposit = approvedDeposits.length === 0
        }
      } catch (error) {
        console.error('Error checking deposit history:', error)
        isFirstDeposit = false // Default to false if we can't check
      }

      const res = await fetch(`${API_URL}/bonus/calculate-bonus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          depositAmount: parseFloat(amount),
          isFirstDeposit
        })
      })

      const data = await res.json()
      if (data.success) {
        setBonusInfo(data.data)
      } else {
        setBonusInfo(null)
      }
    } catch (error) {
      console.error('Error calculating bonus:', error)
      setBonusInfo(null)
    } finally {
      setCalculatingBonus(false)
    }
  }

  const fetchWallet = async () => {
    try {
      const res = await fetch(`${API_URL}/wallet/${user._id}`)
      const data = await res.json()
      setWallet(data.wallet)
    } catch (error) {
      console.error('Error fetching wallet:', error)
    }
  }

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/wallet/transactions/${user._id}`)
      const data = await res.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
    setLoading(false)
  }

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch(`${API_URL}/payment-methods`)
      const data = await res.json()
      setPaymentMethods(data.paymentMethods || [])
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  const handleDeposit = async () => {
    if (!user._id) {
      setError('Please login to make a deposit')
      return
    }
    if (!localAmount || parseFloat(localAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (!selectedPaymentMethod) {
      setError('Please select a payment method')
      return
    }

    // Calculate USD amount from local currency
    const usdAmount = selectedCurrency && selectedCurrency.currency !== 'USD'
      ? calculateUSDAmount(parseFloat(localAmount), selectedCurrency)
      : parseFloat(localAmount)

    try {
      setUploadingScreenshot(true)
      
      // Upload screenshot first if provided
      let screenshotUrl = null
      if (screenshot) {
        const formData = new FormData()
        formData.append('screenshot', screenshot)
        formData.append('userId', user._id)
        
        const uploadRes = await fetch(`${API_URL}/upload/screenshot`, {
          method: 'POST',
          body: formData
        })
        const uploadData = await uploadRes.json()
        if (uploadData.success) {
          screenshotUrl = uploadData.url
        }
      }

      const res = await fetch(`${API_URL}/wallet/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          amount: usdAmount,
          localAmount: parseFloat(localAmount),
          currency: selectedCurrency?.currency || 'USD',
          currencySymbol: selectedCurrency?.symbol || '$',
          exchangeRate: selectedCurrency?.rateToUSD || 1,
          markup: selectedCurrency?.markup || 0,
          paymentMethod: selectedPaymentMethod.type,
          transactionRef,
          screenshot: screenshotUrl || screenshotPreview
        })
      })
      const data = await res.json()
      
      if (res.ok) {
        setSuccess('Deposit request submitted successfully!')
        setShowDepositModal(false)
        setAmount('')
        setLocalAmount('')
        setTransactionRef('')
        setSelectedPaymentMethod(null)
        setSelectedCurrency(null)
        setScreenshot(null)
        setScreenshotPreview(null)
        fetchWallet()
        fetchTransactions()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to create deposit')
      }
    } catch (error) {
      console.error('Deposit error:', error)
      setError('Error submitting deposit. Please try again.')
    } finally {
      setUploadingScreenshot(false)
    }
  }

  const resetWithdrawFlow = () => {
    setShowWithdrawPreviewModal(false)
    setShowWithdrawOtpModal(false)
    setShowWithdrawModal(false)
    setWithdrawPreviewAccepted(false)
    setWithdrawOtpCode('')
    setAmount('')
    setWithdrawWalletAddress('')
    setWithdrawCurrency('USDT')
    setWithdrawNetwork('TRC20')
    setError('')
  }

  const validateWithdrawForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return false
    }
    if (!withdrawWalletAddress?.trim()) {
      setError('Please enter your crypto wallet address')
      return false
    }
    if (wallet && parseFloat(amount) > wallet.balance) {
      setError('Insufficient balance')
      return false
    }
    if (parseFloat(amount) < 10) {
      setError('Minimum withdrawal is $10')
      return false
    }
    return true
  }

  const handleContinueToWithdrawPreview = () => {
    setError('')
    if (!validateWithdrawForm()) return
    setWithdrawPreviewAccepted(false)
    setShowWithdrawModal(false)
    setShowWithdrawPreviewModal(true)
  }

  const handleSendWithdrawOtp = async () => {
    if (!withdrawPreviewAccepted) {
      setError('Please confirm that the previewed details are correct')
      return
    }
    if (!user._id) {
      setError('Please login to continue')
      return
    }
    setSendingWithdrawOtp(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/wallet/send-withdrawal-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id })
      })
      const data = await res.json()
      if (data.success) {
        setShowWithdrawPreviewModal(false)
        setShowWithdrawOtpModal(true)
        setWithdrawOtpCode('')
      } else {
        setError(data.message || 'Could not send OTP')
      }
    } catch (e) {
      console.error(e)
      setError('Failed to send OTP. Please try again.')
    } finally {
      setSendingWithdrawOtp(false)
    }
  }

  const submitWithdrawalWithToken = async (token) => {
    if (!validateWithdrawForm()) return false
    setSubmittingWithdraw(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/oxapay/create-withdrawal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          amount: parseFloat(amount),
          walletAddress: withdrawWalletAddress.trim(),
          currency: withdrawCurrency,
          network: withdrawNetwork,
          withdrawalToken: token
        })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Withdrawal request submitted successfully! It will be processed within 24 hours.')
        resetWithdrawFlow()
        fetchWallet()
        fetchTransactions()
        setTimeout(() => setSuccess(''), 5000)
        return true
      }
      setError(data.message || 'Failed to submit withdrawal')
      return false
    } catch (error) {
      console.error('Withdrawal error:', error)
      setError('Error submitting withdrawal: ' + error.message)
      return false
    } finally {
      setSubmittingWithdraw(false)
    }
  }

  const handleVerifyWithdrawOtp = async () => {
    if (!withdrawOtpCode || withdrawOtpCode.trim().length < 4) {
      setError('Please enter the OTP from your email')
      return
    }
    if (!user._id) return
    setVerifyingWithdrawOtp(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/wallet/verify-withdrawal-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, otp: withdrawOtpCode.trim() })
      })
      const data = await res.json()
      if (data.success && data.withdrawalToken) {
        setWithdrawOtpCode('')
        await submitWithdrawalWithToken(data.withdrawalToken)
      } else {
        setError(data.message || 'Invalid OTP')
      }
    } catch (e) {
      console.error(e)
      setError('Could not verify OTP')
    } finally {
      setVerifyingWithdrawOtp(false)
    }
  }

  // Fetch crypto currencies from OxaPay
  const fetchCryptoCurrencies = async () => {
    try {
      const res = await fetch(`${API_URL}/oxapay/currencies`)
      const data = await res.json()
      if (data.success && data.currencies) {
        setCryptoCurrencies(data.currencies)
      }
    } catch (error) {
      console.error('Error fetching crypto currencies:', error)
      // Default currencies if API fails
      setCryptoCurrencies(['USDT', 'BTC', 'ETH', 'LTC', 'TRX', 'BNB'])
    }
  }

  // Create crypto payment
  const handleCryptoDeposit = async () => {
    if (!cryptoAmount || parseFloat(cryptoAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (parseFloat(cryptoAmount) < 10) {
      setError('Minimum deposit is $10')
      return
    }

    setCreatingCryptoPayment(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/oxapay/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          amount: parseFloat(cryptoAmount)
        })
      })

      const data = await res.json()

      if (data.success) {
        setCryptoPaymentData(data)
        setSuccess('Payment created! Complete the payment using the link below.')
      } else {
        setError(data.message || 'Failed to create crypto payment')
      }
    } catch (error) {
      console.error('Crypto payment error:', error)
      setError('Error creating crypto payment. Please try again.')
    } finally {
      setCreatingCryptoPayment(false)
    }
  }

  // Check crypto payment status
  const checkCryptoPaymentStatus = async () => {
    if (!cryptoPaymentData?.trackId) return

    try {
      const res = await fetch(`${API_URL}/oxapay/check-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: cryptoPaymentData.trackId })
      })

      const data = await res.json()

      if (data.success) {
        if (data.status === 'Paid') {
          setSuccess('Payment confirmed! Funds added to your wallet.')
          setShowCryptoModal(false)
          setCryptoPaymentData(null)
          setCryptoAmount('')
          fetchWallet()
          fetchTransactions()
        } else if (data.status === 'Expired' || data.status === 'Failed') {
          setError(`Payment ${data.status.toLowerCase()}. Please try again.`)
          setCryptoPaymentData(null)
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/user/login')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': 
      case 'Completed': 
        return <Check size={16} className="text-green-500" />
      case 'Rejected': return <XCircle size={16} className="text-red-500" />
      default: return <Clock size={16} className="text-yellow-500" />
    }
  }

  const getPaymentIcon = (type) => {
    switch (type) {
      case 'Bank Transfer': return <Building size={18} />
      case 'UPI': return <Smartphone size={18} />
      case 'QR Code': return <QrCode size={18} />
      default: return <Wallet size={18} />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
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
          <h1 className={`font-semibold text-lg flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Wallet</h1>
          <button onClick={toggleDarkMode} className={`p-2 rounded-lg ${isDarkMode ? 'text-yellow-400 hover:bg-dark-700' : 'text-blue-500 hover:bg-gray-100'}`}>
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
        {/* Collapsible Sidebar - Hidden on Mobile */}
        {!isMobile && (
          <aside 
            className={`${sidebarExpanded ? 'w-48' : 'w-16'} ${isDarkMode ? 'bg-dark-900 border-gray-800' : 'bg-white border-gray-200'} border-r flex flex-col shrink-0 min-h-0 overflow-hidden transition-all duration-300 ease-in-out`}
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
                title={!sidebarExpanded ? item.label : ''}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {sidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
              </button>
            ))}
          </nav>
          <div className={`p-2 border-t shrink-0 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <button 
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-dark-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              title={!sidebarExpanded ? t('nav.logout') : ''}
            >
              <LogOut size={18} className="flex-shrink-0" />
              {sidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">{t('nav.logout')}</span>}
            </button>
          </div>
          </aside>
        )}

        {/* Main Content - Scrollable */}
        <main className={`hide-scrollbar flex-1 min-h-0 overflow-y-auto ${isMobile ? 'pt-14' : ''}`}>
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-500 flex items-center gap-2 text-sm">
              <Check size={18} /> {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Wallet Balance Card */}
          <div className={`${isDarkMode ? 'bg-dark-800 border-gray-800' : 'bg-white border-gray-200 shadow-sm'} rounded-xl ${isMobile ? 'p-4' : 'p-6'} border mb-4`}>
            <div className={`${isMobile ? '' : 'flex items-center justify-between'}`}>
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>{t('wallet.balance')}</p>
                <p className={`font-bold ${isMobile ? 'text-2xl' : 'text-4xl'} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${wallet?.balance?.toLocaleString() || '0.00'}</p>
                <div className={`flex ${isMobile ? 'gap-4' : 'gap-6'} mt-3`}>
                  <div>
                    <p className="text-gray-500 text-xs">{t('wallet.pendingDeposits')}</p>
                    <p className="text-yellow-500 font-medium text-sm">${wallet?.pendingDeposits?.toLocaleString() || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">{t('wallet.pendingWithdrawals')}</p>
                    <p className="text-orange-500 font-medium text-sm">${wallet?.pendingWithdrawals?.toLocaleString() || '0.00'}</p>
                  </div>
                </div>
              </div>
              <div className={`flex gap-2 ${isMobile ? 'mt-4' : ''}`}>
                <button
                  onClick={() => {
                    fetchTradingAccounts()
                    setShowTransferModal(true)
                    setError('')
                  }}
                  className={`flex items-center gap-2 font-medium ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} rounded-lg transition-colors border ${isDarkMode ? 'bg-dark-700 text-white hover:bg-dark-600 border-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-gray-300'}`}
                >
                  <ArrowRightLeft size={isMobile ? 16 : 20} /> Transfer
                </button>
                <button
                  onClick={() => {
                    setShowDepositModal(true)
                    setError('')
                  }}
                  className={`flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} rounded-lg hover:bg-accent-green/90 transition-colors`}
                >
                  <ArrowDownCircle size={isMobile ? 16 : 20} /> {t('wallet.deposit')}
                </button>
                <button
                  onClick={() => {
                    setWithdrawPreviewAccepted(false)
                    setWithdrawOtpCode('')
                    setShowWithdrawPreviewModal(false)
                    setShowWithdrawOtpModal(false)
                    setShowWithdrawModal(true)
                    setError('')
                  }}
                  className={`flex items-center gap-2 font-medium ${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} rounded-lg transition-colors border ${isDarkMode ? 'bg-dark-700 text-white hover:bg-dark-600 border-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-gray-300'}`}
                >
                  <ArrowUpCircle size={isMobile ? 16 : 20} /> {t('wallet.withdraw')}
                </button>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className={`${isDarkMode ? 'bg-dark-800 border-gray-800' : 'bg-white border-gray-200 shadow-sm'} rounded-xl ${isMobile ? 'p-4' : 'p-5'} border`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('wallet.transactions')}</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={downloadTransactionsCSV}
                  disabled={transactions.length === 0}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 ${isDarkMode ? 'bg-dark-700 hover:bg-dark-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                >
                  <Download size={14} /> Download
                </button>
                <button 
                  onClick={fetchTransactions}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-100'}`}
                >
                  <RefreshCw size={18} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw size={24} className="text-gray-500 animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <Wallet size={48} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Type</th>
                      <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Amount</th>
                      <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Bonus</th>
                      <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Total</th>
                      <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Method</th>
                      <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Status</th>
                      <th className="text-left text-gray-500 text-sm font-medium py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id} className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {tx.type === 'Deposit' && <ArrowDownCircle size={18} className="text-green-500" />}
                            {tx.type === 'Withdrawal' && <ArrowUpCircle size={18} className="text-red-500" />}
                            {tx.type === 'Transfer_To_Account' && <Send size={18} className="text-blue-500" />}
                            {tx.type === 'Transfer_From_Account' && <Download size={18} className="text-purple-500" />}
                            {tx.type === 'Account_Transfer_Out' && <ArrowUpCircle size={18} className="text-orange-500" />}
                            {tx.type === 'Account_Transfer_In' && <ArrowDownCircle size={18} className="text-teal-500" />}
                            {tx.type === 'Challenge_Purchase' && <ArrowUpCircle size={18} className="text-yellow-500" />}
                            {tx.type === 'Admin_Fund_Add' && <Gift size={18} className="text-emerald-500" />}
                            {tx.type === 'Admin_Credit_Add' && <Gift size={18} className="text-cyan-500" />}
                            {tx.type === 'Admin_Credit_Remove' && <ArrowUpCircle size={18} className="text-pink-500" />}
                            <div>
                              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                                {tx.type === 'Transfer_To_Account' ? 'To Trading Account' : 
                                 tx.type === 'Transfer_From_Account' ? 'From Trading Account' : 
                                 tx.type === 'Account_Transfer_Out' ? 'Account Transfer (Out)' :
                                 tx.type === 'Account_Transfer_In' ? 'Account Transfer (In)' :
                                 tx.type === 'Challenge_Purchase' ? 'Challenge Purchase' :
                                 tx.type === 'Admin_Fund_Add' ? 'Admin Fund Addition' :
                                 tx.type === 'Admin_Credit_Add' ? 'Admin Credit Addition' :
                                 tx.type === 'Admin_Credit_Remove' ? 'Admin Credit Removal' :
                                 tx.type}
                              </span>
                              {tx.tradingAccountName && (
                                <p className="text-gray-500 text-xs">{tx.tradingAccountName}</p>
                              )}
                              {tx.type === 'Account_Transfer_Out' && tx.toTradingAccountName && (
                                <p className="text-gray-500 text-xs">→ {tx.toTradingAccountName}</p>
                              )}
                              {tx.type === 'Account_Transfer_In' && tx.fromTradingAccountName && (
                                <p className="text-gray-500 text-xs">← {tx.fromTradingAccountName}</p>
                              )}
                              {tx.type === 'Challenge_Purchase' && tx.description && (
                                <p className="text-gray-500 text-xs">{tx.description}</p>
                              )}
                              {(tx.type === 'Admin_Fund_Add' || tx.type === 'Admin_Credit_Add' || tx.type === 'Admin_Credit_Remove') && tx.description && (
                                <p className="text-gray-500 text-xs">{tx.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={`py-4 px-4 font-medium ${
                          tx.type === 'Deposit' || tx.type === 'Transfer_From_Account' || tx.type === 'Account_Transfer_In' || tx.type === 'Admin_Fund_Add' || tx.type === 'Admin_Credit_Add' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {tx.type === 'Deposit' || tx.type === 'Transfer_From_Account' || tx.type === 'Account_Transfer_In' || tx.type === 'Admin_Fund_Add' || tx.type === 'Admin_Credit_Add' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          {tx.type === 'Deposit' ? (
                            tx.bonusAmount && tx.bonusAmount > 0 ? (
                              <span className="text-green-500 font-medium">+${tx.bonusAmount.toLocaleString()}</span>
                            ) : (
                              <span className="text-gray-500">$0</span>
                            )
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {tx.type === 'Deposit' ? (
                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              ${(tx.totalAmount || (tx.amount + (tx.bonusAmount || 0))).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-400">
                          {tx.type === 'Transfer_To_Account' || tx.type === 'Transfer_From_Account' || tx.type === 'Account_Transfer_Out' || tx.type === 'Account_Transfer_In' ? 'Internal' : tx.paymentMethod}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(tx.status)}
                            <span className={`${
                              tx.status === 'Approved' || tx.status === 'Completed' ? 'text-green-500' :
                              tx.status === 'Rejected' ? 'text-red-500' :
                              'text-yellow-500'
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-sm">{formatDate(tx.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </div>
        </main>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-4 sm:p-6 w-full max-w-lg border min-h-[500px] max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-300'}`}>
            <div className="flex items-center justify-end mb-4">
              <button 
                onClick={() => {
                  setShowDepositModal(false)
                  setAmount('')
                  setTransactionRef('')
                  setSelectedPaymentMethod(null)
                  setDepositMethod('bank')
                  setCryptoAmount('')
                  setCryptoPaymentData(null)
                  setError('')
                }}
                className={isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Crypto Logo - Full Width */}
            {!cryptoPaymentData && (
              <div className="mb-4">
                <img src={cryptoLogo} alt="BULL4X Crypto" className="w-full h-32 object-cover rounded-lg" />
              </div>
            )}

            {/* Crypto Info Banner */}
            {!cryptoPaymentData && (
              <div className="mb-4 p-4 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                <div className="flex items-center justify-between mb-3">
                  <img src="/crypto/btc.svg" alt="BTC" className="w-10 h-10" />
                  <img src="/crypto/eth.svg" alt="ETH" className="w-10 h-10" />
                  <img src="/crypto/usdt.svg" alt="USDT" className="w-10 h-10" />
                  <img src="/crypto/ltc.svg" alt="LTC" className="w-10 h-10" />
                  <img src="/crypto/bnb.svg" alt="BNB" className="w-10 h-10" />
                  <img src="/crypto/sol.svg" alt="SOL" className="w-10 h-10" />
                </div>
                <p className="text-blue-400 text-sm text-center">
                  Pay with Bitcoin, Ethereum, USDT, and 100+ cryptocurrencies via OxaPay
                </p>
              </div>
            )}

            {/* Crypto Content */}
            {!cryptoPaymentData ? (
                  <>
                    {/* Amount Input */}
                    <div className="mb-4">
                      <label className="block text-gray-400 text-sm mb-2">Amount (USD)</label>
                      <input
                        type="number"
                        value={cryptoAmount}
                        onChange={(e) => setCryptoAmount(e.target.value)}
                        placeholder="Minimum $10"
                        className={`w-full rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-orange-500 border ${isDarkMode ? 'bg-dark-700 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                      />
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowDepositModal(false)
                          setCryptoAmount('')
                          setDepositMethod('bank')
                          setError('')
                        }}
                        className={`flex-1 py-3 rounded-lg transition-colors ${isDarkMode ? 'bg-dark-700 text-white hover:bg-dark-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCryptoDeposit}
                        disabled={creatingCryptoPayment || !cryptoAmount}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {creatingCryptoPayment ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" /> Creating...
                          </>
                        ) : (
                          'Pay with Crypto'
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Payment Created - Show Payment Details */}
                    <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-100'}`}>
                      <div className="text-center mb-4">
                        <p className="text-green-500 font-medium mb-2">Payment Created Successfully!</p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${cryptoAmount} USD
                        </p>
                        <p className="text-gray-400 text-sm">Pay with {cryptoPaymentData.currency}</p>
                      </div>

                      <div className="space-y-3 text-sm">
                        {cryptoPaymentData.address && (
                          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-dark-600' : 'bg-white'}`}>
                            <p className="text-gray-400 text-xs mb-1">Wallet Address</p>
                            <p className={`font-mono text-xs break-all ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {cryptoPaymentData.address}
                            </p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(cryptoPaymentData.address)
                                setSuccess('Address copied!')
                                setTimeout(() => setSuccess(''), 2000)
                              }}
                              className="mt-2 text-orange-500 text-xs flex items-center gap-1 hover:text-orange-400"
                            >
                              <Copy size={12} /> Copy Address
                            </button>
                          </div>
                        )}

                        {cryptoPaymentData.network && (
                          <p className="text-gray-400">
                            Network: <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{cryptoPaymentData.network}</span>
                          </p>
                        )}

                        <p className="text-gray-400">
                          Track ID: <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{cryptoPaymentData.trackId}</span>
                        </p>
                      </div>
                    </div>

                    {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}
                    {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                    {/* Agreement Checkbox */}
                    <div className="mb-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeToPayment}
                          onChange={(e) => setAgreeToPayment(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="text-gray-400 text-sm">
                          I agree to the payment terms and confirm that I am making this deposit voluntarily. I understand that crypto transactions are irreversible.
                        </span>
                      </label>
                    </div>

                    <div className="flex flex-col gap-3">
                      {cryptoPaymentData.payLink && (
                        <a
                          href={agreeToPayment ? cryptoPaymentData.payLink : '#'}
                          target={agreeToPayment ? "_blank" : undefined}
                          rel={agreeToPayment ? "noopener noreferrer" : undefined}
                          onClick={(e) => {
                            if (!agreeToPayment) {
                              e.preventDefault()
                            }
                          }}
                          className={`w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-medium py-3 rounded-lg text-center ${agreeToPayment ? 'hover:opacity-90 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                        >
                          Proceed to Payment
                        </a>
                      )}

                      <button
                        onClick={() => {
                          setCryptoPaymentData(null)
                          setCryptoAmount('')
                          setError('')
                        }}
                        className="text-gray-400 text-sm hover:text-gray-300"
                      >
                        Create New Payment
                      </button>
                    </div>
                  </>
                )}
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-4 sm:p-6 w-full max-w-md border ${isDarkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-300'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Transfer to Trading Account</h3>
              <button 
                onClick={() => {
                  setShowTransferModal(false)
                  setTransferAmount('')
                  setSelectedTradingAccount(null)
                  setError('')
                }}
                className={isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Wallet Balance */}
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Main Wallet Balance:</span>
                <span className="text-green-500 font-medium">${wallet?.balance?.toLocaleString() || '0.00'}</span>
              </div>
            </div>

            {/* Select Trading Account */}
            <div className="mb-4">
              <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select Trading Account</label>
              {tradingAccounts.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {tradingAccounts.map(account => (
                    <div 
                      key={account._id}
                      onClick={() => setSelectedTradingAccount(account)}
                      className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                        selectedTradingAccount?._id === account._id 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : isDarkMode ? 'border-gray-700 bg-dark-700 hover:border-gray-600' : 'border-gray-300 bg-gray-100 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{account.accountId}</p>
                          <p className="text-gray-500 text-xs">{account.accountTypeId?.name || 'Standard'}</p>
                        </div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${account.balance?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No trading accounts found</p>
              )}
            </div>

            {/* Transfer Amount */}
            <div className="mb-4">
              <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transfer Amount (USD)</label>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Enter amount"
                className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-dark-700 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} focus:outline-none focus:border-blue-500`}
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTransferModal(false)
                  setTransferAmount('')
                  setSelectedTradingAccount(null)
                  setError('')
                }}
                className={`flex-1 py-3 rounded-lg transition-colors ${isDarkMode ? 'bg-dark-700 text-white hover:bg-dark-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleTransferToAccount}
                disabled={!selectedTradingAccount || !transferAmount}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw — Step 1: enter amount, asset, network, address */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-4 sm:p-6 w-full max-w-lg border max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-300'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Withdraw Funds</h3>
              <button
                type="button"
                onClick={() => resetWithdrawFlow()}
                className={isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <img src={cryptoLogo} alt="Crypto Withdrawal" className="w-full h-32 object-cover rounded-lg" />
            </div>

            <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-dark-700' : 'bg-gray-100'}`}>
              <p className="text-gray-400 text-sm">Available Balance</p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${wallet?.balance?.toLocaleString() || '0.00'}</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Amount (Min: $10)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="10"
                className={`w-full rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-accent-green border ${isDarkMode ? 'bg-dark-700 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Cryptocurrency</label>
              <select
                value={withdrawCurrency}
                onChange={(e) => setWithdrawCurrency(e.target.value)}
                className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-accent-green border ${isDarkMode ? 'bg-dark-700 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              >
                <option value="USDT">USDT (Tether)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
                <option value="LTC">LTC (Litecoin)</option>
                <option value="TRX">TRX (Tron)</option>
                <option value="BNB">BNB (Binance Coin)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Network</label>
              <select
                value={withdrawNetwork}
                onChange={(e) => setWithdrawNetwork(e.target.value)}
                className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-accent-green border ${isDarkMode ? 'bg-dark-700 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              >
                {withdrawCurrency === 'USDT' && (
                  <>
                    <option value="TRC20">TRC20 (Tron)</option>
                    <option value="ERC20">ERC20 (Ethereum)</option>
                    <option value="BEP20">BEP20 (BSC)</option>
                  </>
                )}
                {withdrawCurrency === 'BTC' && <option value="BTC">Bitcoin Network</option>}
                {withdrawCurrency === 'ETH' && <option value="ERC20">ERC20 (Ethereum)</option>}
                {withdrawCurrency === 'LTC' && <option value="LTC">Litecoin Network</option>}
                {withdrawCurrency === 'TRX' && <option value="TRC20">TRC20 (Tron)</option>}
                {withdrawCurrency === 'BNB' && <option value="BEP20">BEP20 (BSC)</option>}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Wallet Address</label>
              <input
                type="text"
                value={withdrawWalletAddress}
                onChange={(e) => setWithdrawWalletAddress(e.target.value)}
                placeholder="Enter your crypto wallet address"
                className={`w-full rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-accent-green border ${isDarkMode ? 'bg-dark-700 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              />
              <p className="text-yellow-500 text-xs mt-2">⚠️ Make sure the wallet address matches the selected network</p>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => resetWithdrawFlow()}
                className={`flex-1 py-3 rounded-lg transition-colors ${isDarkMode ? 'bg-dark-700 text-white hover:bg-dark-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleContinueToWithdrawPreview}
                disabled={!amount || !withdrawWalletAddress?.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw — Step 2: preview → send OTP to logged-in user email */}
      {showWithdrawPreviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-4 sm:p-6 w-full max-w-lg border max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-300'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Review withdrawal</h3>
              <button
                type="button"
                onClick={() => {
                  setShowWithdrawPreviewModal(false)
                  setWithdrawPreviewAccepted(false)
                  setShowWithdrawModal(true)
                  setError('')
                }}
                className={isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
              >
                <X size={20} />
              </button>
            </div>

            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Please confirm everything below. After you continue, a one-time code will be sent to the email on your account.
            </p>

            <div className={`space-y-3 mb-4 p-4 rounded-lg border ${isDarkMode ? 'bg-dark-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-500">Amount</span>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${parseFloat(amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-500">Asset</span>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{withdrawCurrency}</span>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-500">Network</span>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{withdrawNetwork}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500 block mb-1">Destination address</span>
                <span className={`font-mono text-xs break-all ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{withdrawWalletAddress}</span>
              </div>
              {user.email && (
                <div className="flex justify-between gap-4 text-sm pt-2 border-t border-gray-600/30">
                  <span className="text-gray-500">OTP will be sent to</span>
                  <span className={`text-right break-all ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>{user.email}</span>
                </div>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={withdrawPreviewAccepted}
                onChange={(e) => setWithdrawPreviewAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                I confirm the amount, network, and wallet address are correct. I understand that wrong details may result in loss of funds.
              </span>
            </label>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowWithdrawPreviewModal(false)
                  setWithdrawPreviewAccepted(false)
                  setShowWithdrawModal(true)
                  setError('')
                }}
                className={`flex-1 py-3 rounded-lg transition-colors ${isDarkMode ? 'bg-dark-700 text-white hover:bg-dark-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSendWithdrawOtp}
                disabled={sendingWithdrawOtp || !withdrawPreviewAccepted}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {sendingWithdrawOtp ? 'Sending…' : 'Send OTP to email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw — Step 3: email OTP → auto-submit withdrawal */}
      {showWithdrawOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-4 sm:p-6 w-full max-w-md border ${isDarkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-300'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Verify your email</h3>
              <button
                type="button"
                onClick={() => {
                  setShowWithdrawOtpModal(false)
                  setWithdrawPreviewAccepted(false)
                  setShowWithdrawPreviewModal(true)
                  setWithdrawOtpCode('')
                  setError('')
                }}
                className={isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
              >
                <X size={20} />
              </button>
            </div>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Enter the one-time code sent to <span className="font-medium">{user.email || 'your registered email'}</span>. Your withdrawal will be submitted automatically after verification.
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={withdrawOtpCode}
              onChange={(e) => setWithdrawOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="6-digit code"
              className={`w-full rounded-lg px-4 py-3 mb-4 border text-center text-lg tracking-widest ${isDarkMode ? 'bg-dark-700 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleVerifyWithdrawOtp}
                disabled={verifyingWithdrawOtp || submittingWithdraw || withdrawOtpCode.length < 4}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {verifyingWithdrawOtp || submittingWithdraw ? 'Processing…' : 'Verify & submit withdrawal'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowWithdrawOtpModal(false)
                  setWithdrawPreviewAccepted(false)
                  setShowWithdrawPreviewModal(true)
                  setWithdrawOtpCode('')
                  setError('')
                }}
                className={`text-sm py-2 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                ← Back to preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default WalletPage
