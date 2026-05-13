import {
  Lock, Shield, Database, Share2, Clock, User,
  Users, Link2, RefreshCw, CheckCircle,
} from 'lucide-react'
import {
  LegalPageShell, LegalHero, LegalBody, SectionCard, Bullet,
  HighlightBanner, FeatureGrid, ContactCard,
} from '../components/LegalAtoms'

const sections = [
  { id: 'collect',   no: '01', title: 'Information We Collect' },
  { id: 'use',       no: '02', title: 'How We Use Your Information' },
  { id: 'security',  no: '03', title: 'Data Storage & Security' },
  { id: 'sharing',   no: '04', title: 'Data Sharing & Disclosure' },
  { id: 'retention', no: '05', title: 'Data Retention' },
  { id: 'rights',    no: '06', title: 'Your Rights' },
  { id: 'children',  no: '07', title: "Children's Privacy" },
  { id: 'third',     no: '08', title: 'Third-Party Services' },
  { id: 'updates',   no: '09', title: 'Updates to This Policy' },
  { id: 'contact',   no: '10', title: 'Contact Us' },
]

const PrivacyPolicy = () => (
  <LegalPageShell standalone>
    <LegalHero
      icon={Lock}
      badge="Legal · Privacy"
      title="Privacy"
      highlight="Policy"
      subtitle="How BULL4X collects, uses, and safeguards your information when you use our mobile application and platform."
      updated="February 8, 2026"
    />

    <LegalBody sections={sections}>
      <HighlightBanner icon={Shield} title="Your privacy, our commitment">
        BULL4X ("we," "our," or "us") operates the BULL4X mobile application (the "App").
        This Privacy Policy explains how we collect, use, disclose, and safeguard your
        information when you use our App. By using the App, you agree to the collection
        and use of information in accordance with this policy.
      </HighlightBanner>

      <SectionCard id="collect" no="01" icon={Database} title="Information We Collect">
        <div>
          <h4 className="text-white font-semibold mb-2">1.1 Personal Information</h4>
          <p className="mb-3">When you register for an account, we may collect the following:</p>
          <ul className="space-y-2">
            <Bullet><span className="text-white font-semibold">Identity Information:</span> Full name, date of birth, and government-issued identification documents (for KYC verification purposes).</Bullet>
            <Bullet><span className="text-white font-semibold">Contact Information:</span> Email address and phone number.</Bullet>
            <Bullet><span className="text-white font-semibold">nancial Information:</span> Bank account details, UPI IDs, and payment transaction references for deposit and withdrawal processing.</Bullet>
            <Bullet><span className="text-white font-semibold">Profile Information:</span> Profile photograph (optional).</Bullet>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">1.2 KYC (Know Your Customer) Documents</h4>
          <p className="mb-3">To comply with nancial regulations, we collect identity verification documents including:</p>
          <ul className="space-y-2">
            <Bullet>Government-issued photo ID (front and back images).</Bullet>
            <Bullet>Selfie with document for identity verification.</Bullet>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">1.3 Automatically Collected Information</h4>
          <p className="mb-3">When you use the App, we may automatically collect:</p>
          <ul className="space-y-2">
            <Bullet><span className="text-white font-semibold">Device Information:</span> Device type, operating system version, unique device identifiers.</Bullet>
            <Bullet><span className="text-white font-semibold">Usage Data:</span> App interaction data, features used, and session duration.</Bullet>
            <Bullet><span className="text-white font-semibold">Network Information:</span> IP address and connection type.</Bullet>
          </ul>
        </div>
      </SectionCard>

      <SectionCard id="use" no="02" icon={User} title="How We Use Your Information">
        <p>We use the collected information for the following purposes:</p>
        <ul className="space-y-2">
          <Bullet><span className="text-white font-semibold">Account Management:</span> To create, maintain, and manage your trading account.</Bullet>
          <Bullet><span className="text-white font-semibold">Identity Verification:</span> To verify your identity through KYC processes as required by nancial regulations.</Bullet>
          <Bullet><span className="text-white font-semibold">Transaction Processing:</span> To process deposits, withdrawals, and trading transactions.</Bullet>
          <Bullet><span className="text-white font-semibold">Communication:</span> To send you account-related notifications, transaction confirmations, and important updates.</Bullet>
          <Bullet><span className="text-white font-semibold">Security:</span> To detect, prevent, and address fraud, unauthorized access, and other security issues.</Bullet>
          <Bullet><span className="text-white font-semibold">Improvement:</span> To analyze usage patterns and improve the App's functionality and user experience.</Bullet>
          <Bullet><span className="text-white font-semibold">Legal Compliance:</span> To comply with applicable laws, regulations, and legal processes.</Bullet>
        </ul>
      </SectionCard>

      <SectionCard id="security" no="03" icon={Shield} title="Data Storage & Security">
        <p>We implement industry-standard security measures to protect your personal information:</p>
        <FeatureGrid items={[
          { title: 'SSL/TLS Encryption', desc: 'All data transmissions are encrypted in transit using industry-standard protocols.' },
          { title: 'Password Hashing', desc: 'Sensitive credentials such as passwords are hashed and never stored in plain text.' },
          { title: 'Restricted Access', desc: 'KYC documents and payment screenshots are stored on secure servers with strict access controls.' },
          { title: 'Authentication Controls', desc: 'We use secure authentication mechanisms including session tokens and OTP verification.' },
        ]} />
      </SectionCard>

      <SectionCard id="sharing" no="04" icon={Share2} title="Data Sharing & Disclosure">
        <p>
          We do not sell, trade, or rent your personal information to third parties.
          We may share your information only in the following circumstances:
        </p>
        <ul className="space-y-2">
          <Bullet><span className="text-white font-semibold">Legal Requirements:</span> When required by law, regulation, or legal process.</Bullet>
          <Bullet><span className="text-white font-semibold">Service Providers:</span> With trusted third-party service providers who assist us in operating the App (e.g., payment processors, cloud hosting providers), subject to confidentiality agreements.</Bullet>
          <Bullet><span className="text-white font-semibold">Safety:</span> To protect the rights, property, or safety of BULL4X, our users, or the public.</Bullet>
          <Bullet><span className="text-white font-semibold">Consent:</span> With your explicit consent for any other purpose.</Bullet>
        </ul>
      </SectionCard>

      <SectionCard id="retention" no="05" icon={Clock} title="Data Retention">
        <p>
          We retain your personal information for as long as your account is active or
          as needed to provide you services. We may also retain and use your information
          as necessary to:
        </p>
        <ul className="space-y-2">
          <Bullet>Comply with legal obligations.</Bullet>
          <Bullet>Resolve disputes.</Bullet>
          <Bullet>Enforce our agreements.</Bullet>
        </ul>
        <p className="text-slate-400 text-sm">
          KYC documents are retained as required by applicable nancial regulations.
        </p>
      </SectionCard>

      <SectionCard id="rights" no="06" icon={CheckCircle} title="Your Rights">
        <p>You have the following rights regarding your personal information:</p>
        <ul className="space-y-2">
          <Bullet><span className="text-white font-semibold">Access:</span> Request access to the personal data we hold about you.</Bullet>
          <Bullet><span className="text-white font-semibold">Correction:</span> Request correction of inaccurate or incomplete data.</Bullet>
          <Bullet><span className="text-white font-semibold">Deletion:</span> Request deletion of your personal data, subject to legal retention requirements.</Bullet>
          <Bullet><span className="text-white font-semibold">Portability:</span> Request a copy of your data in a portable format.</Bullet>
          <Bullet><span className="text-white font-semibold">Withdrawal of Consent:</span> Withdraw consent for data processing at any time.</Bullet>
        </ul>
        <p className="text-slate-400 text-sm">
          To exercise any of these rights, please contact us at the email address provided below.
        </p>
      </SectionCard>

      <SectionCard id="children" no="07" icon={Users} title="Children's Privacy">
        <p>
          The App is not intended for use by individuals under the age of 18. We do not
          knowingly collect personal information from children under 18. If we become
          aware that we have collected personal information from a child under 18, we
          will take steps to delete such information promptly.
        </p>
      </SectionCard>

      <SectionCard id="third" no="08" icon={Link2} title="Third-Party Services">
        <p>
          The App may contain links to or integrate with third-party services. We are
          not responsible for the privacy practices of these third parties. We encourage
          you to review the privacy policies of any third-party services you access
          through the App.
        </p>
      </SectionCard>

      <SectionCard id="updates" no="09" icon={RefreshCw} title="Updates to This Privacy Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of
          any changes by posting the new Privacy Policy within the App and updating
          the "Last Updated" date. Your continued use of the App after any changes
          constitutes your acceptance of the updated Privacy Policy.
        </p>
      </SectionCard>

      <ContactCard
        sectionNo="10"
        title="Get in touch"
        description="If you have any questions or concerns about this Privacy Policy or our data practices, our team is here to help."
        primaryLabel="Return to Home"
        primaryLink="/"
        secondaryLabel="Terms of Service"
        secondaryLink="/terms-of-service"
      />
    </LegalBody>
  </LegalPageShell>
)

export default PrivacyPolicy
