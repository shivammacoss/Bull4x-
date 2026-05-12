// ============================================
// BULL4X - Risk Disclosure Page
// ============================================

import {
  FiAlertTriangle, FiAlertOctagon, FiBookOpen, FiBarChart2,
  FiLayers, FiSliders, FiDroplet, FiWifi, FiDollarSign,
  FiMessageCircle, FiClock, FiUserCheck, FiCheckCircle,
} from 'react-icons/fi'
import MarketTicker from '../../components/MarketTicker'
import {
  LegalPageShell, LegalHero, LegalBody, SectionCard, Bullet,
  HighlightBanner, FeatureGrid, ContactCard,
} from '../../../components/LegalAtoms'

const riskFactors = [
  {
    title: 'Market Volatility',
    desc: 'Financial markets can be highly volatile. Prices can move rapidly and unpredictably, resulting in significant gains or losses within short periods.',
  },
  {
    title: 'Leverage Risks',
    desc: 'Leveraged trading amplifies both profits and losses. A small adverse price movement can result in losses exceeding your initial deposit.',
  },
  {
    title: 'Margin Requirements',
    desc: 'You must maintain sufficient margin in your account. Failure to meet margin calls may result in the automatic closure of your positions.',
  },
  {
    title: 'Liquidity Risks',
    desc: 'Under certain market conditions, it may be difficult or impossible to execute orders at the desired price, particularly during major news events.',
  },
  {
    title: 'Technology Risks',
    desc: 'Electronic trading systems are subject to technical failures, internet disruptions, and other technology-related risks that may affect order execution.',
  },
  {
    title: 'Currency Risk',
    desc: 'If your account currency differs from the instrument currency, exchange rate fluctuations may affect your profit and loss.',
  },
]

const sections = [
  { id: 'intro',          no: '01', title: 'Introduction' },
  { id: 'risk-factors',   no: '02', title: 'Key Risk Factors' },
  { id: 'no-advice',      no: '03', title: 'No Investment Advice' },
  { id: 'past',           no: '04', title: 'Past Performance' },
  { id: 'suitability',    no: '05', title: 'Suitability' },
  { id: 'acknowledgement',no: '06', title: 'Acknowledgement' },
  { id: 'contact',        no: '07', title: 'Contact Us' },
]

function RiskDisclosure() {
  return (
    <LegalPageShell>
      {/* Marketing site ticker stays at top */}
      <div className="pt-16 md:pt-18">
        <MarketTicker />
      </div>

      <LegalHero
        icon={FiAlertTriangle}
        badge="Legal · Risk"
        title="Risk"
        highlight="Disclosure"
        subtitle="Trading leveraged financial products carries a high level of risk and may not be suitable for all investors. Please read this disclosure carefully before trading."
        updated="January 2025"
        effective="Read in full before opening an account"
      />

      <LegalBody sections={sections}>
        <HighlightBanner icon={FiAlertOctagon} tone="warn" title="Important risk warning">
          Trading leveraged financial products carries a high level of risk and may not
          be suitable for all investors. <span className="text-white font-semibold">You
          may lose more than your initial investment.</span> BULL4X does not guarantee
          profits and does not provide investment advice. Before trading, ensure you
          fully understand the risks involved.
        </HighlightBanner>

        <SectionCard id="intro" no="01" icon={FiBookOpen} title="Introduction">
          <p>
            This Risk Disclosure Statement is provided to you by BULL4X in accordance
            with our regulatory obligations. It is intended to inform you of the risks
            associated with trading leveraged financial instruments including but not
            limited to Forex, CFDs, indices, commodities, stocks, and cryptocurrencies.
          </p>
          <p>
            This document does not disclose all risks associated with trading. You
            should not trade unless you understand the nature of the products you are
            trading and the extent of your exposure to risk.
          </p>
        </SectionCard>

        <SectionCard id="risk-factors" no="02" icon={FiBarChart2} title="Key Risk Factors">
          <p>
            Trading involves numerous risk factors. The most significant ones are
            outlined below — but this is not an exhaustive list.
          </p>
          <FeatureGrid items={riskFactors} />
        </SectionCard>

        <SectionCard id="no-advice" no="03" icon={FiMessageCircle} title="No Investment Advice">
          <p>
            BULL4X does not provide investment advice. Any information, analysis, or
            trading signals provided through our platforms or communications are for
            informational purposes only and should not be construed as investment
            advice. You are solely responsible for your trading decisions.
          </p>
        </SectionCard>

        <SectionCard id="past" no="04" icon={FiClock} title="Past Performance">
          <p>
            Past performance of any financial instrument is not indicative of future
            results. Historical data and performance records should not be relied upon
            as a guarantee of future performance.
          </p>
        </SectionCard>

        <SectionCard id="suitability" no="05" icon={FiUserCheck} title="Suitability">
          <p>
            Before trading, you should carefully consider your investment objectives,
            level of experience, and risk appetite. If you are unsure whether trading is
            appropriate for you, we recommend seeking independent financial advice from
            a qualified professional.
          </p>
        </SectionCard>

        <SectionCard id="acknowledgement" no="06" icon={FiCheckCircle} title="Acknowledgement">
          <p>
            By opening an account with BULL4X, you acknowledge that you have read,
            understood, and accepted this Risk Disclosure Statement. You confirm that
            you are aware of the risks involved in trading leveraged financial products.
          </p>
        </SectionCard>

        <ContactCard
          sectionNo="07"
          title="Need to know more?"
          description="Our team can answer questions about trading risk, leverage, margin, or our risk-management tools."
          primaryLabel="Open Account"
          primaryLink="/accounts"
          secondaryLabel="Contact Us"
          secondaryLink="/contact"
        />
      </LegalBody>
    </LegalPageShell>
  )
}

export default RiskDisclosure
