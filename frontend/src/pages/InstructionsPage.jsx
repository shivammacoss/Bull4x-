import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, User, Wallet, Users, Copy, UserCircle, HelpCircle, FileText, LogOut,
  ChevronDown, ChevronRight, BookOpen, PlayCircle, DollarSign, TrendingUp, Shield, Settings, Trophy,
  ArrowLeft, Home, Sun, Moon, Globe
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { API_URL } from '../config/api'
import logoImage from '../assets/logo.png'
import LanguageDropdown from '../components/LanguageDropdown'
import UserHeader from '../components/UserHeader'
import { useLockDocumentScroll } from '../hooks/useLockDocumentScroll'

const InstructionsPage = () => {
  useLockDocumentScroll()
  const navigate = useNavigate()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { t } = useTranslation()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [expandedSection, setExpandedSection] = useState('getting-started')
  const [challengeModeEnabled, setChallengeModeEnabled] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchChallengeStatus()
  }, [])

  const fetchChallengeStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/prop/status`)
      const data = await res.json()
      if (data.success) setChallengeModeEnabled(data.enabled)
    } catch (error) {}
  }

  const menuItems = [
    { name: 'Dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Account', label: t('nav.account'), icon: User, path: '/account' },
    { name: 'Wallet', label: t('nav.wallet'), icon: Wallet, path: '/wallet' },
    { name: 'Orders', label: t('nav.orders'), icon: FileText, path: '/orders' },
    { name: 'IB', label: t('nav.ib'), icon: Users, path: '/ib' },
    { name: 'Copytrade', label: t('nav.copytrade'), icon: Copy, path: '/copytrade' },
    { name: 'Profile', label: t('nav.profile'), icon: UserCircle, path: '/profile' },
    { name: 'Support', label: t('nav.support'), icon: HelpCircle, path: '/support' },
    { name: 'Instructions', label: t('nav.instructions'), icon: FileText, path: '/instructions' },
  ]

  const sections = [
    {
      id: 'getting-started',
      title: t('instructions.gettingStarted'),
      icon: PlayCircle,
      content: [
        { title: t('instructions.createAccount'), text: t('instructions.createAccountDesc') },
        { title: t('instructions.completeKyc'), text: t('instructions.completeKycDesc') },
        { title: t('instructions.createTradingAccount'), text: t('instructions.createTradingAccountDesc') },
        { title: t('instructions.fundAccount'), text: t('instructions.fundAccountDesc') },
      ]
    },
    {
      id: 'deposits',
      title: t('instructions.depositsWithdrawals'),
      icon: DollarSign,
      content: [
        { title: t('instructions.makingDeposit'), text: t('instructions.makingDepositDesc') },
        { title: t('instructions.depositProcessing'), text: t('instructions.depositProcessingDesc') },
        { title: t('instructions.makingWithdrawal'), text: t('instructions.makingWithdrawalDesc') },
        { title: t('instructions.withdrawalProcessing'), text: t('instructions.withdrawalProcessingDesc') },
      ]
    },
    {
      id: 'trading',
      title: t('instructions.trading'),
      icon: TrendingUp,
      content: [
        { title: t('instructions.openingTrade'), text: t('instructions.openingTradeDesc') },
        { title: t('instructions.pendingOrders'), text: t('instructions.pendingOrdersDesc') },
        { title: t('instructions.slTp'), text: t('instructions.slTpDesc') },
        { title: t('instructions.closingTrade'), text: t('instructions.closingTradeDesc') },
        { title: t('instructions.understandingMargin'), text: t('instructions.understandingMarginDesc') },
      ]
    },
    {
      id: 'copy-trading',
      title: t('instructions.copyTrading'),
      icon: Copy,
      content: [
        { title: t('instructions.whatIsCopyTrading'), text: t('instructions.whatIsCopyTradingDesc') },
        { title: t('instructions.followingMaster'), text: t('instructions.followingMasterDesc') },
        { title: t('instructions.copySettings'), text: t('instructions.copySettingsDesc') },
        { title: t('instructions.commission'), text: t('instructions.commissionDesc') },
        { title: t('instructions.managingSubscriptions'), text: t('instructions.managingSubscriptionsDesc') },
      ]
    },
    {
      id: 'ib-program',
      title: t('instructions.ibProgram'),
      icon: Users,
      content: [
        { title: t('instructions.whatIsIb'), text: t('instructions.whatIsIbDesc') },
        { title: t('instructions.becomingIb'), text: t('instructions.becomingIbDesc') },
        { title: t('instructions.referralLink'), text: t('instructions.referralLinkDesc') },
        { title: t('instructions.commissionStructure'), text: t('instructions.commissionStructureDesc') },
        { title: t('instructions.withdrawingCommission'), text: t('instructions.withdrawingCommissionDesc') },
      ]
    },
    {
      id: 'security',
      title: t('instructions.security'),
      icon: Shield,
      content: [
        { title: t('instructions.passwordSecurity'), text: t('instructions.passwordSecurityDesc') },
        { title: t('instructions.twoFactorAuth'), text: t('instructions.twoFactorAuthDesc') },
        { title: t('instructions.tradingPin'), text: t('instructions.tradingPinDesc') },
        { title: t('instructions.suspiciousActivity'), text: t('instructions.suspiciousActivityDesc') },
      ]
    },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/user/login')
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <div className={`flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-col overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-dark-900' : 'bg-gray-100'}`}>
      {/* Mobile Header */}
      {isMobile && (
        <header className={`fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center gap-4 ${isDarkMode ? 'bg-dark-800 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
          <button onClick={() => navigate('/mobile')} className={`p-2 -ml-2 rounded-lg ${isDarkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-100'}`}>
            <ArrowLeft size={22} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
          </button>
          <h1 className={`font-semibold text-lg flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Instructions</h1>
          <button onClick={toggleDarkMode} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-100'}`}>
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
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
            <img src={logoImage} alt="Unicap" className="h-8 w-auto object-contain" />
            <UserHeader />
          </div>
        </div>
      )}

      {/* Main Layout - Sidebar + Content */}
      <div className={`flex-1 flex min-h-0 overflow-hidden ${isMobile ? 'flex-col' : ''}`}>
        {/* Sidebar - Hidden on Mobile */}
        {!isMobile && (
          <aside 
            className={`${sidebarExpanded ? 'w-48' : 'w-16'} flex flex-col shrink-0 min-h-0 overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-dark-900 border-gray-800' : 'bg-white border-gray-200'} border-r`}
            onMouseEnter={() => setSidebarExpanded(true)}
            onMouseLeave={() => setSidebarExpanded(false)}
          >
            <nav className="hide-scrollbar flex-1 min-h-0 overflow-y-auto px-2 pt-4">
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                    item.name === 'Instructions' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : isDarkMode ? 'text-gray-400 hover:text-white hover:bg-dark-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
          <div className={`${isMobile ? 'p-4' : 'p-6'} flex justify-center`}>
          <div className={isMobile ? 'w-full' : 'max-w-4xl w-full'}>
            {/* Welcome Banner */}
            <div className={`bg-gradient-to-r from-accent-green/20 to-blue-500/20 rounded-xl ${isMobile ? 'p-4' : 'p-6'} mb-4 border border-accent-green/30`}>
              <div className={`flex items-center ${isMobile ? 'gap-3' : 'gap-4'}`}>
                <div className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} bg-accent-green/30 rounded-full flex items-center justify-center`}>
                  <BookOpen size={isMobile ? 20 : 28} className="text-accent-green" />
                </div>
                <div>
                  <h2 className={`font-bold text-white ${isMobile ? 'text-base' : 'text-xl'}`}>{t('instructions.welcome')}</h2>
                  <p className={`text-gray-400 ${isMobile ? 'text-xs' : ''}`}>{t('instructions.learnHow')}</p>
                </div>
              </div>
            </div>

            {/* Accordion Sections */}
            <div className={`space-y-${isMobile ? '2' : '4'}`}>
              {sections.map(section => (
                <div key={section.id} className={`${isDarkMode ? 'bg-dark-800 border-gray-800' : 'bg-white border-gray-200 shadow-sm'} rounded-xl border overflow-hidden`}>
                  <button
                    onClick={() => setExpandedSection(expandedSection === section.id ? '' : section.id)}
                    className={`w-full flex items-center justify-between ${isMobile ? 'p-3' : 'p-5'} transition-colors ${isDarkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`flex items-center ${isMobile ? 'gap-3' : 'gap-4'}`}>
                      <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-accent-green/20 rounded-lg flex items-center justify-center`}>
                        <section.icon size={isMobile ? 16 : 20} className="text-accent-green" />
                      </div>
                      <span className={`font-semibold ${isMobile ? 'text-sm' : ''} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{section.title}</span>
                    </div>
                    {expandedSection === section.id ? (
                      <ChevronDown size={isMobile ? 16 : 20} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={isMobile ? 16 : 20} className="text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSection === section.id && (
                    <div className={`${isMobile ? 'px-3 pb-3' : 'px-5 pb-5'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className={`pt-3 space-y-${isMobile ? '2' : '4'}`}>
                        {section.content.map((item, idx) => (
                          <div key={idx} className="flex gap-4">
                            <div className="w-6 h-6 bg-accent-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-accent-green text-xs font-bold">{idx + 1}</span>
                            </div>
                            <div>
                              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Support */}
            <div className={`${isDarkMode ? 'bg-dark-800 border-gray-800' : 'bg-white border-gray-200 shadow-sm'} rounded-xl p-6 border mt-6`}>
              <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Need More Help?</h3>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                If you couldn't find what you're looking for, our support team is here to help.
              </p>
              <button
                onClick={() => navigate('/support')}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-accent-green/90"
              >
                Contact Support
              </button>
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default InstructionsPage
