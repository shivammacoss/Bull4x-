import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import MobileTradingApp from './pages/MobileTradingApp'
import Account from './pages/Account'
import WalletPage from './pages/WalletPage'
import OrderBook from './pages/OrderBook'
import TradingPage from './pages/TradingPage'
import CopyTradePage from './pages/CopyTradePage'
import IBPage from './pages/IBPage'
import ProfilePage from './pages/ProfilePage'
import SupportPage from './pages/SupportPage'
import InstructionsPage from './pages/InstructionsPage'
import AdminLogin from './pages/AdminLogin'
import AdminOverview from './pages/AdminOverview'
import AdminUserManagement from './pages/AdminUserManagement'
import AdminAccounts from './pages/AdminAccounts'
import AdminAccountTypes from './pages/AdminAccountTypes'
import AdminTransactions from './pages/AdminTransactions'
import AdminPaymentMethods from './pages/AdminPaymentMethods'
import AdminTradeManagement from './pages/AdminTradeManagement'
import AdminFundManagement from './pages/AdminFundManagement'
import AdminBankSettings from './pages/AdminBankSettings'
import AdminIBManagement from './pages/AdminIBManagement'
import AdminForexCharges from './pages/AdminForexCharges'
import AdminIndianCharges from './pages/AdminIndianCharges'
import AdminCopyTrade from './pages/AdminCopyTrade'
import AdminPropFirm from './pages/AdminPropFirm'
import AdminManagement from './pages/AdminManagement'
import AdminKYC from './pages/AdminKYC'
import AdminSupport from './pages/AdminSupport'
import BuyChallengePage from './pages/BuyChallengePage'
import ChallengeDashboardPage from './pages/ChallengeDashboardPage'
import AdminPropTrading from './pages/AdminPropTrading'
import AdminEarnings from './pages/AdminEarnings'
import ForgotPassword from './pages/ForgotPassword'
import AdminThemeSettings from './pages/AdminThemeSettings'
import BrandedLogin from './pages/BrandedLogin'
import BrandedSignup from './pages/BrandedSignup'
import AdminEmailTemplates from './pages/AdminEmailTemplates'
import AdminBonusManagement from './pages/AdminBonusManagement'
import AdminBannerManagement from './pages/AdminBannerManagement'
import Bull4xWebsiteLayout from './components/Bull4xWebsiteLayout'
import Bull4xHome from './bull4xLanding/pages/Home'
import Bull4xTrading from './bull4xLanding/pages/Trading'
import Bull4xPlatforms from './bull4xLanding/pages/Platforms'
import Bull4xAccounts from './bull4xLanding/pages/Accounts'
import Bull4xPricing from './bull4xLanding/pages/Pricing'
import Bull4xToolsResearch from './bull4xLanding/pages/ToolsResearch'
import Bull4xEducation from './bull4xLanding/pages/Education'
import Bull4xAbout from './bull4xLanding/pages/About'
import Bull4xContact from './bull4xLanding/pages/Contact'
import Bull4xDemoAccount from './bull4xLanding/pages/DemoAccount'
import Bull4xPrivacyPolicy from './bull4xLanding/pages/legal/PrivacyPolicy'
import Bull4xTermsConditions from './bull4xLanding/pages/legal/TermsConditions'
import Bull4xRiskDisclosure from './bull4xLanding/pages/legal/RiskDisclosure'
import Bull4xAmlPolicy from './bull4xLanding/pages/legal/AmlPolicy'
import AdminProfile from './pages/AdminProfile'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import AccountDeletion from './pages/AccountDeletion'
// Website pages temporarily disabled - using simplified homepage
// import StandardAccountPage from './website/src/pages/StandardAccountPage'
// import ProAccountPage from './website/src/pages/ProAccountPage'
// import EcnAccountPage from './website/src/pages/EcnAccountPage'
// import StarterFundPage from './website/src/pages/funding/StarterFundPage'
// import GrowthFundPage from './website/src/pages/funding/GrowthFundPage'
// import ProFundPage from './website/src/pages/funding/ProFundPage'
// import EliteFundPage from './website/src/pages/funding/EliteFundPage'
// import PrimeFundPage from './website/src/pages/funding/PrimeFundPage'
// import CustomPlanPage from './website/src/pages/funding/CustomPlanPage'
// import ExclusivePlanPage from './website/src/pages/funding/ExclusivePlanPage'
// import IBProgramPage from './website/src/pages/IBProgramPage'
// import CopyTradingPage from './website/src/pages/CopyTradingPage'
// import FundingsPage from './website/src/pages/FundingsPage'
import FundingCartPage from './pages/FundingCartPage'
import PDFViewerPage from './pages/PDFViewerPage'
// import WebsiteLayout from './components/WebsiteLayout'
// import { TermsAndConditionsPage, PrivacyPolicyPage, RiskDisclosurePage, IBagreementPage, FundingRulesPage } from './website/src/pages/legal'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Bull4xWebsiteLayout />}>
          <Route path="/" element={<Bull4xHome />} />
          <Route path="/trading" element={<Bull4xTrading />} />
          <Route path="/platforms" element={<Bull4xPlatforms />} />
          <Route path="/accounts" element={<Bull4xAccounts />} />
          <Route path="/pricing" element={<Bull4xPricing />} />
          <Route path="/tools-research" element={<Bull4xToolsResearch />} />
          <Route path="/education" element={<Bull4xEducation />} />
          <Route path="/about" element={<Bull4xAbout />} />
          <Route path="/contact" element={<Bull4xContact />} />
          <Route path="/demo-account" element={<Bull4xDemoAccount />} />
          <Route path="/legal/privacy-policy" element={<Bull4xPrivacyPolicy />} />
          <Route path="/legal/terms-and-conditions" element={<Bull4xTermsConditions />} />
          <Route path="/legal/risk-disclosure" element={<Bull4xRiskDisclosure />} />
          <Route path="/legal/aml-policy" element={<Bull4xAmlPolicy />} />
        </Route>
        <Route path="/login" element={<Navigate to="/user/login" replace />} />
        <Route path="/signup" element={<Navigate to="/user/signup" replace />} />
        <Route path="/user/signup" element={<Signup />} />
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mobile" element={<MobileTradingApp />} />
        <Route path="/account" element={<Account />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/orders" element={<OrderBook />} />
        <Route path="/trade/:accountId" element={<TradingPage />} />
        <Route path="/copytrade" element={<CopyTradePage />} />
        <Route path="/ib" element={<IBPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/instructions" element={<InstructionsPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminOverview />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/accounts" element={<AdminAccounts />} />
        <Route path="/admin/account-types" element={<AdminAccountTypes />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
        <Route path="/admin/payment-methods" element={<AdminPaymentMethods />} />
        <Route path="/admin/trades" element={<AdminTradeManagement />} />
        <Route path="/admin/funds" element={<AdminFundManagement />} />
        <Route path="/admin/bank-settings" element={<AdminBankSettings />} />
        <Route path="/admin/ib-management" element={<AdminIBManagement />} />
        <Route path="/admin/forex-charges" element={<AdminForexCharges />} />
        <Route path="/admin/indian-charges" element={<AdminIndianCharges />} />
        <Route path="/admin/copy-trade" element={<AdminCopyTrade />} />
        <Route path="/admin/prop-firm" element={<AdminPropFirm />} />
        <Route path="/admin/admin-management" element={<AdminManagement />} />
        <Route path="/admin/kyc" element={<AdminKYC />} />
        <Route path="/admin/support" element={<AdminSupport />} />
        <Route path="/admin/prop-trading" element={<AdminPropTrading />} />
        <Route path="/admin/earnings" element={<AdminEarnings />} />
        <Route path="/admin/theme" element={<AdminThemeSettings />} />
        <Route path="/admin/email-templates" element={<AdminEmailTemplates />} />
        <Route path="/admin/bonus-management" element={<AdminBonusManagement />} />
        <Route path="/admin/banners" element={<AdminBannerManagement />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin-employee" element={<AdminLogin />} />
        <Route path="/employee/login" element={<AdminLogin />} />
        <Route path="/buy-challenge" element={<BuyChallengePage />} />
        <Route path="/challenge-dashboard" element={<ChallengeDashboardPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/account-deletion" element={<AccountDeletion />} />
        {/* Website Sub-Pages - temporarily redirect to buy-challenge */}
        <Route path="/funding/*" element={<Navigate to="/buy-challenge" replace />} />
        <Route path="/ib-program" element={<Navigate to="/ib" replace />} />
        <Route path="/copy-trading" element={<Navigate to="/copytrade" replace />} />
        <Route path="/fundings" element={<Navigate to="/buy-challenge" replace />} />
        <Route path="/cart" element={<FundingCartPage />} />
        {/* Legal Pages — bull4x layout serves /legal/* for marketing; keep app-only redirects */}
        <Route path="/legal/ib-agreement" element={<Navigate to="/terms-of-service" replace />} />
        <Route path="/legal/funding-rules" element={<Navigate to="/terms-of-service" replace />} />
        <Route path="/:slug/login" element={<BrandedLogin />} />
        <Route path="/:slug/signup" element={<BrandedSignup />} />
      </Routes>
    </Router>
  )
}

export default App
