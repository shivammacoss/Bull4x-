// ============================================
// BULL4X - AML Policy Page
// ============================================

import {
  Shield, BookOpen, UserCheck, Activity, Flag,
  FileText, Lock, Award,
} from 'lucide-react'
import MarketTicker from '../../components/MarketTicker'
import {
  LegalPageShell, LegalHero, LegalBody, SectionCard, Bullet,
  HighlightBanner, FeatureGrid, FlagList, ContactCard,
} from '../../../components/LegalAtoms'

const kycRequirements = [
  { title: 'Government-Issued Photo ID', desc: 'Valid passport, national identity card, or driver\'s license — clear photo of both sides where applicable.' },
  { title: 'Proof of Address', desc: 'Utility bill, bank statement, or official document dated within the last 3 months.' },
  { title: 'Source of Funds', desc: 'Documentation confirming the legitimate origin of funds used for trading (e.g. salary slip, business records).' },
  { title: 'Enhanced Due Diligence', desc: 'Additional documentation may be required for high-risk clients or large transactions, including business activity verification.' },
]

const redFlags = [
  'Unusually large cash deposits or withdrawals.',
  "Transactions inconsistent with the client's stated profile.",
  'Requests to transfer funds to unrelated third parties.',
  'Reluctance to provide required identification documents.',
  'Multiple accounts with similar trading patterns.',
  'Transactions from high-risk jurisdictions.',
]

const sections = [
  { id: 'intro',         no: '01', title: 'Introduction' },
  { id: 'kyc',           no: '02', title: 'Know Your Customer (KYC)' },
  { id: 'monitoring',    no: '03', title: 'Transaction Monitoring' },
  { id: 'red-flags',     no: '04', title: 'Suspicious Activity Indicators' },
  { id: 'reporting',     no: '05', title: 'Reporting Obligations' },
  { id: 'restrictions',  no: '06', title: 'Account Restrictions' },
  { id: 'training',      no: '07', title: 'Employee Training' },
  { id: 'contact',       no: '08', title: 'Contact Us' },
]

function AmlPolicy() {
  return (
    <LegalPageShell>
      {/* Marketing site ticker stays at top */}
      <div className="pt-16 md:pt-18">
        <MarketTicker />
      </div>

      <LegalHero
        icon={Shield}
        badge="Legal · AML"
        title="AML"
        highlight="Policy"
        subtitle="BULL4X strictly follows Anti-Money Laundering (AML) regulations and is committed to preventing nancial crime across all operations."
        updated="January 2025"
      />

      <LegalBody sections={sections}>
        <HighlightBanner icon={Shield} title="Zero tolerance for nancial crime">
          BULL4X maintains a <span className="text-white font-semibold">zero-tolerance
          policy</span> toward money laundering, terrorist nancing, and other nancial
          crimes. We are committed to full compliance with all applicable AML laws and
          regulations. Any suspicious activity will be reported to relevant authorities
          in accordance with applicable laws.
        </HighlightBanner>

        <SectionCard id="intro" no="01" icon={BookOpen} title="Introduction">
          <p>
            This Anti-Money Laundering (AML) Policy outlines the procedures and controls
            implemented by BULL4X to prevent, detect, and report money laundering and
            terrorist nancing activities. This policy applies to all clients,
            employees, and business relationships.
          </p>
        </SectionCard>

        <SectionCard id="kyc" no="02" icon={UserCheck} title="Know Your Customer (KYC)">
          <p>
            All clients are required to complete our KYC verification process before
            trading. We require the following documentation:
          </p>
          <FeatureGrid items={kycRequirements} />
        </SectionCard>

        <SectionCard id="monitoring" no="03" icon={Activity} title="Transaction Monitoring">
          <p>
            We continuously monitor all client transactions for suspicious activity. Our
            compliance team reviews transactions that deviate from normal patterns or
            that exceed defined thresholds. Automated systems flag unusual activity for
            manual review by our compliance officers.
          </p>
        </SectionCard>

        <SectionCard id="red-flags" no="04" icon={Flag} title="Suspicious Activity Indicators">
          <p>
            The following are examples of activities that may trigger enhanced scrutiny
            or reporting:
          </p>
          <FlagList items={redFlags} />
        </SectionCard>

        <SectionCard id="reporting" no="05" icon={FileText} title="Reporting Obligations">
          <p>
            Where we have reasonable grounds to suspect money laundering or terrorist
            nancing, we are legally obligated to le a Suspicious Activity Report
            (SAR) with the relevant nancial intelligence unit. We are prohibited by
            law from disclosing to the client that a report has been made ("tipping
            off").
          </p>
        </SectionCard>

        <SectionCard id="restrictions" no="06" icon={Lock} title="Account Restrictions">
          <p>
            We reserve the right to restrict, suspend, or terminate any account where we
            have concerns about AML compliance. In such cases, we may freeze funds
            pending investigation and cooperate fully with law enforcement and
            regulatory authorities.
          </p>
          <ul className="space-y-2">
            <Bullet>Suspending trading or withdrawals pending review.</Bullet>
            <Bullet>Requesting additional KYC or source-of-funds documentation.</Bullet>
            <Bullet>Terminating the relationship in line with regulatory guidance.</Bullet>
          </ul>
        </SectionCard>

        <SectionCard id="training" no="07" icon={Award} title="Employee Training">
          <p>
            All BULL4X employees receive regular AML training to ensure they can
            identify and report suspicious activity. Our compliance team undergoes
            specialized training and stays current with evolving AML regulations and
            best practices.
          </p>
        </SectionCard>

        <ContactCard
          sectionNo="08"
          title="Compliance & AML enquiries"
          description="Our compliance team handles all AML-related queries. Reach out for clarification on KYC, source-of-funds requirements, or to report a concern."
          primaryLabel="Contact Compliance"
          primaryLink="/contact"
          secondaryLabel="Open Account"
          secondaryLink="/accounts"
        />
      </LegalBody>
    </LegalPageShell>
  )
}

export default AmlPolicy
