import {
  FileText, UserCheck, UserPlus, Activity, AlertTriangle,
  CreditCard, Slash, Cpu, XCircle, AlertOctagon,
  Eye, Edit, Globe,
} from 'lucide-react'
import {
  LegalPageShell, LegalHero, LegalBody, SectionCard, Bullet,
  HighlightBanner, ContactCard,
} from '../components/LegalAtoms'

const sections = [
  { id: 'eligibility', no: '01', title: 'Eligibility' },
  { id: 'registration', no: '02', title: 'Account Registration' },
  { id: 'services', no: '03', title: 'Services Provided' },
  { id: 'risk', no: '04', title: 'Risk Disclosure' },
  { id: 'deposits', no: '05', title: 'Deposits & Withdrawals' },
  { id: 'prohibited', no: '06', title: 'Prohibited Activities' },
  { id: 'ip', no: '07', title: 'Intellectual Property' },
  { id: 'suspension', no: '08', title: 'Account Suspension & Termination' },
  { id: 'liability', no: '09', title: 'Limitation of Liability' },
  { id: 'warranties', no: '10', title: 'Disclaimer of Warranties' },
  { id: 'modifications', no: '11', title: 'Modifications to Terms' },
  { id: 'law', no: '12', title: 'Governing Law' },
  { id: 'contact', no: '13', title: 'Contact Us' },
]

const TermsOfService = () => (
  <LegalPageShell standalone>
    <LegalHero
      icon={FileText}
      badge="Legal · Terms"
      title="Terms of"
      highlight="Service"
      subtitle="The agreement that governs your access to and use of the BULL4X mobile application and related services."
      updated="February 8, 2026"
    />

    <LegalBody sections={sections}>
      <HighlightBanner icon={FileText} title="Welcome to BULL4X">
        These Terms of Service ("Terms") govern your access to and use of the BULL4X
        mobile application ("App") and related services. By downloading, installing,
        or using the App, you agree to be bound by these Terms. If you do not agree,
        please do not use the App.
      </HighlightBanner>

      <SectionCard id="eligibility" no="01" icon={UserCheck} title="Eligibility">
        <ul className="space-y-2">
          <Bullet>You must be at least 18 years of age to use the App.</Bullet>
          <Bullet>You must provide accurate, complete, and current information during registration.</Bullet>
          <Bullet>You must complete the KYC (Know Your Customer) verification process as required.</Bullet>
          <Bullet>You are responsible for maintaining the confidentiality of your account credentials.</Bullet>
        </ul>
      </SectionCard>

      <SectionCard id="registration" no="02" icon={UserPlus} title="Account Registration">
        <p>To access the trading features of the App, you must create an account by providing:</p>
        <ul className="space-y-2">
          <Bullet>A valid email address.</Bullet>
          <Bullet>A secure password.</Bullet>
          <Bullet>Your full legal name.</Bullet>
          <Bullet>Identity verification documents (KYC).</Bullet>
        </ul>
        <p>
          You are solely responsible for all activities that occur under your account.
          You must notify us immediately of any unauthorized use of your account.
        </p>
      </SectionCard>

      <SectionCard id="services" no="03" icon={Activity} title="Services Provided">
        <p>BULL4X provides a trading platform that allows users to:</p>
        <ul className="space-y-2">
          <Bullet>View real-time market data and price quotes for various nancial instruments including Forex, Commodities, Indices, and Cryptocurrencies.</Bullet>
          <Bullet>Execute simulated or live trades based on market conditions.</Bullet>
          <Bullet>Manage trading accounts, including deposits and withdrawals.</Bullet>
          <Bullet>Access trading history and portfolio information.</Bullet>
        </ul>
      </SectionCard>

      <SectionCard id="risk" no="04" icon={AlertTriangle} title="Risk Disclosure">
        <HighlightBanner icon={AlertOctagon} tone="warn" title="High-risk activity">
          Trading in nancial instruments involves substantial risk of loss and is not
          suitable for all investors. You should carefully consider whether trading is
          suitable for you in light of your nancial condition.
        </HighlightBanner>
        <p className="mt-4">Key risks include:</p>
        <ul className="space-y-2">
          <Bullet>You may sustain a total loss of the funds deposited with us.</Bullet>
          <Bullet>Market conditions may change rapidly and unpredictably.</Bullet>
          <Bullet>Past performance is not indicative of future results.</Bullet>
          <Bullet>Leverage can amplify both gains and losses.</Bullet>
        </ul>
        <p className="text-slate-400 text-sm">
          You acknowledge that you are fully aware of and accept the risks associated with
          trading nancial instruments.
        </p>
      </SectionCard>

      <SectionCard id="deposits" no="05" icon={CreditCard} title="Deposits & Withdrawals">
        <ul className="space-y-2">
          <Bullet>Deposits and withdrawals are processed through the payment methods available in the App.</Bullet>
          <Bullet>All deposit requests are subject to verification and approval.</Bullet>
          <Bullet>Withdrawal requests are processed within a reasonable timeframe, subject to verification.</Bullet>
          <Bullet>We reserve the right to request additional verification for large transactions.</Bullet>
          <Bullet>You are responsible for providing accurate payment information and transaction references.</Bullet>
        </ul>
      </SectionCard>

      <SectionCard id="prohibited" no="06" icon={Slash} title="Prohibited Activities">
        <p>You agree not to:</p>
        <ul className="space-y-2">
          <Bullet>Use the App for any illegal or unauthorized purpose.</Bullet>
          <Bullet>Attempt to manipulate market prices or engage in fraudulent trading activities.</Bullet>
          <Bullet>Use automated systems, bots, or scripts to interact with the App without authorization.</Bullet>
          <Bullet>Provide false or misleading information during registration or KYC verification.</Bullet>
          <Bullet>Share your account credentials with any third party.</Bullet>
          <Bullet>Attempt to reverse-engineer, decompile, or disassemble the App.</Bullet>
          <Bullet>Use the App to launder money or nance illegal activities.</Bullet>
        </ul>
      </SectionCard>

      <SectionCard id="ip" no="07" icon={Cpu} title="Intellectual Property">
        <p>
          All content, features, and functionality of the App, including but not limited
          to text, graphics, logos, icons, images, and software, are the exclusive
          property of BULL4X and are protected by intellectual property laws. You may
          not reproduce, distribute, modify, or create derivative works without our prior
          written consent.
        </p>
      </SectionCard>

      <SectionCard id="suspension" no="08" icon={XCircle} title="Account Suspension & Termination">
        <p>We reserve the right to suspend or terminate your account at any time if:</p>
        <ul className="space-y-2">
          <Bullet>You violate these Terms of Service.</Bullet>
          <Bullet>We suspect fraudulent or illegal activity on your account.</Bullet>
          <Bullet>You fail to complete required KYC verification.</Bullet>
          <Bullet>Required by law or regulatory authorities.</Bullet>
        </ul>
      </SectionCard>

      <SectionCard id="liability" no="09" icon={AlertOctagon} title="Limitation of Liability">
        <p>To the maximum extent permitted by law:</p>
        <ul className="space-y-2">
          <Bullet>BULL4X shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the App.</Bullet>
          <Bullet>We are not responsible for any trading losses incurred through the use of the App.</Bullet>
          <Bullet>We do not guarantee uninterrupted or error-free operation of the App.</Bullet>
          <Bullet>We are not liable for any losses resulting from system failures, network issues, or force majeure events.</Bullet>
        </ul>
      </SectionCard>

      <SectionCard id="warranties" no="10" icon={Eye} title="Disclaimer of Warranties">
        <p>
          The App is provided "as is" and "as available" without warranties of any kind,
          either express or implied. We do not warrant that the App will be
          uninterrupted, timely, secure, or error-free.
        </p>
      </SectionCard>

      <SectionCard id="modifications" no="11" icon={Edit} title="Modifications to Terms">
        <p>
          We reserve the right to modify these Terms at any time. Changes will be
          effective immediately upon posting within the App. Your continued use of the
          App after any modifications constitutes acceptance of the updated Terms.
        </p>
      </SectionCard>

      <SectionCard id="law" no="12" icon={Globe} title="Governing Law">
        <p>
          These Terms shall be governed by and construed in accordance with the
          applicable laws. Any disputes arising from these Terms shall be resolved
          through appropriate legal channels.
        </p>
      </SectionCard>

      <ContactCard
        sectionNo="13"
        title="Questions about these Terms?"
        description="If you have any questions about these Terms of Service, our team is here to help clarify them."
        primaryLabel="Return to Home"
        primaryLink="/"
        secondaryLabel="Privacy Policy"
        secondaryLink="/privacy-policy"
      />
    </LegalBody>
  </LegalPageShell>
)

export default TermsOfService
