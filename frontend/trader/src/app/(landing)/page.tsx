'use client'

import dynamic from 'next/dynamic'

import TopBanner from '@/landing-new/components/TopBanner'
import Navbar from '@/landing-new/components/Navbar'
import Hero from '@/landing-new/components/Hero'

const AnimatedStatement = dynamic(() => import('@/landing-new/components/AnimatedStatement'), { ssr: false })
const TangibleOutcomes  = dynamic(() => import('@/landing-new/components/TangibleOutcomes'),  { ssr: false })
const EffectiveTrading  = dynamic(() => import('@/landing-new/components/EffectiveTrading'),  { ssr: false })
const MarketAccess      = dynamic(() => import('@/landing-new/components/MarketAccess'),      { ssr: false })
const TradingConditions = dynamic(() => import('@/landing-new/components/TradingConditions'), { ssr: false })
const WhyChooseUs       = dynamic(() => import('@/landing-new/components/WhyChooseUs'),       { ssr: false })
const GlobalSessions    = dynamic(() => import('@/landing-new/components/GlobalSessions'),    { ssr: false })
const HomePricing       = dynamic(() => import('@/landing-new/components/HomePricing'),       { ssr: false })
const ProfitSplit       = dynamic(() => import('@/landing-new/components/ProfitSplit'),       { ssr: false })
const TradingPlatform   = dynamic(() => import('@/landing-new/components/TradingPlatform'),   { ssr: false })
const RiskRules         = dynamic(() => import('@/landing-new/components/RiskRules'),         { ssr: false })
const TraderAcademy     = dynamic(() => import('@/landing-new/components/TraderAcademy'),     { ssr: false })
const TraderCommunity   = dynamic(() => import('@/landing-new/components/TraderCommunity'),   { ssr: false })
const FAQ               = dynamic(() => import('@/landing-new/components/FAQ'),               { ssr: false })
const AccountOpening    = dynamic(() => import('@/landing-new/components/AccountOpening'),    { ssr: false })
const Contact           = dynamic(() => import('@/landing-new/components/Contact'),           { ssr: false })
const ComplianceTrust   = dynamic(() => import('@/landing-new/components/ComplianceTrust'),   { ssr: false })
const Footer            = dynamic(() => import('@/landing-new/components/Footer'),            { ssr: false })

export default function LandingHomePage() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />
      <Hero />

      <AnimatedStatement />
      <TangibleOutcomes />
      <EffectiveTrading />

      <MarketAccess />
      <TradingConditions />
      <WhyChooseUs />
      <GlobalSessions />
      <HomePricing />
      <ProfitSplit />
      <TradingPlatform />
      <RiskRules />
      <TraderAcademy />
      <TraderCommunity />
      <FAQ />
      <AccountOpening />
      <Contact />
      <ComplianceTrust />
      <Footer />
    </div>
  )
}
