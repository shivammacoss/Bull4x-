import {
  Info, List, Settings, Shield, ToggleRight,
  RefreshCw, Package,
} from 'lucide-react'
import {
  LegalPageShell, LegalHero, LegalBody, SectionCard, Bullet,
  HighlightBanner, FeatureGrid, ContactCard,
} from '../components/LegalAtoms'

const sections = [
  { id: 'what',       no: '01', title: 'What Are Cookies?' },
  { id: 'types',      no: '02', title: 'Types of Cookies We Use' },
  { id: 'why',        no: '03', title: 'Why We Use Cookies' },
  { id: 'third',      no: '04', title: 'Third-Party Cookies' },
  { id: 'manage',     no: '05', title: 'Managing Your Preferences' },
  { id: 'updates',    no: '06', title: 'Updates to This Policy' },
  { id: 'contact',    no: '07', title: 'Contact Us' },
]

const CookiePolicy = () => (
  <LegalPageShell standalone>
    <LegalHero
      icon={Package}
      badge="Legal · Cookies"
      title="Cookie"
      highlight="Policy"
      subtitle="How BULL4X uses cookies and similar technologies to operate, secure, and improve our platform."
      updated="February 8, 2026"
    />

    <LegalBody sections={sections}>
      <HighlightBanner icon={Info} title="Transparency in tracking">
        This Cookie Policy explains what cookies are, how BULL4X uses them, the types of
        cookies we deploy (i.e. the information we collect using cookies and how that
        information is used), and how to control your cookie preferences. By continuing
        to use our platform, you consent to the use of cookies as described below.
      </HighlightBanner>

      <SectionCard id="what" no="01" icon={Info} title="What Are Cookies?">
        <p>
          Cookies are small text les placed on your device (computer, smartphone, or
          tablet) when you visit a website or use an application. They are widely used
          to make websites and apps work, work more efficiently, and provide reporting
          information to the operators.
        </p>
        <p>
          Cookies set by the website or app owner (in this case, BULL4X) are called
          "rst-party cookies". Cookies set by parties other than the website owner are
          called "third-party cookies". Third-party cookies enable features or
          functionality provided by external services (e.g. analytics, payment
          processing).
        </p>
      </SectionCard>

      <SectionCard id="types" no="02" icon={List} title="Types of Cookies We Use">
        <FeatureGrid items={[
          { title: 'Essential Cookies', desc: 'Required for the platform to function. They enable secure login, session management, and core trading features. These cannot be disabled.' },
          { title: 'Performance Cookies', desc: 'Help us understand how users interact with our platform — which pages are visited, error rates, and load times — so we can improve performance.' },
          { title: 'Functional Cookies', desc: 'Remember your preferences such as language, theme (dark/light), and watchlist so you don\'t have to re-set them each visit.' },
          { title: 'Analytics Cookies', desc: 'Collect aggregated, anonymized data about platform usage to help us understand which features are most valuable to traders.' },
          { title: 'Security Cookies', desc: 'Detect suspicious activity, verify session integrity, and protect against fraud and unauthorized access.' },
          { title: 'Marketing Cookies', desc: 'Used to measure the effectiveness of our marketing campaigns. You can opt out of these in your cookie preferences.' },
        ]} />
      </SectionCard>

      <SectionCard id="why" no="03" icon={Settings} title="Why We Use Cookies">
        <p>BULL4X uses cookies for the following business purposes:</p>
        <ul className="space-y-2">
          <Bullet><span className="text-white font-semibold">Authentication:</span> To recognize you when you sign in and keep your session secure across pages.</Bullet>
          <Bullet><span className="text-white font-semibold">Preferences:</span> To remember your chosen language, theme, and trading layout configurations.</Bullet>
          <Bullet><span className="text-white font-semibold">Security:</span> To detect and prevent fraud, unauthorized access, and other security threats.</Bullet>
          <Bullet><span className="text-white font-semibold">Performance:</span> To monitor and improve the speed, reliability, and stability of our platform.</Bullet>
          <Bullet><span className="text-white font-semibold">Analytics:</span> To understand which features, instruments, and pages are most useful to our users.</Bullet>
          <Bullet><span className="text-white font-semibold">Compliance:</span> To meet our regulatory obligations regarding record-keeping and audit trails.</Bullet>
        </ul>
      </SectionCard>

      <SectionCard id="third" no="04" icon={Shield} title="Third-Party Cookies">
        <p>
          We may also use cookies provided by trusted third parties to support specific
          functions of the platform, including:
        </p>
        <ul className="space-y-2">
          <Bullet><span className="text-white font-semibold">Payment Processors:</span> To securely process deposits and withdrawals.</Bullet>
          <Bullet><span className="text-white font-semibold">Analytics Providers:</span> To collect aggregated usage statistics.</Bullet>
          <Bullet><span className="text-white font-semibold">Customer Support Tools:</span> To enable live chat and ticket-based support.</Bullet>
          <Bullet><span className="text-white font-semibold">Market Data Providers:</span> To deliver real-time price feeds and charts.</Bullet>
        </ul>
        <p className="text-slate-400 text-sm">
          These third parties have their own privacy and cookie policies. We recommend
          reviewing them to understand how they handle your information.
        </p>
      </SectionCard>

      <SectionCard id="manage" no="05" icon={ToggleRight} title="Managing Your Preferences">
        <p>
          You have the right to decide whether to accept or reject cookies (other than
          strictly necessary ones). You can manage your preferences in the following ways:
        </p>
        <ul className="space-y-2">
          <Bullet><span className="text-white font-semibold">Browser Settings:</span> Most browsers allow you to refuse or accept cookies via settings. Refer to your browser's help section for instructions.</Bullet>
          <Bullet><span className="text-white font-semibold">Cookie Banner:</span> When you rst visit our platform, you may be presented with a cookie preference banner where you can opt in or out of non-essential cookies.</Bullet>
          <Bullet><span className="text-white font-semibold">Mobile Devices:</span> On mobile, you can usually limit ad tracking through your device's privacy settings.</Bullet>
        </ul>
        <HighlightBanner icon={Info} tone="warn" title="A note about essential cookies">
          Please note that blocking essential cookies will impact platform functionality —
          including the ability to log in, place trades, or process payments — and some
          features may not work as intended.
        </HighlightBanner>
      </SectionCard>

      <SectionCard id="updates" no="06" icon={RefreshCw} title="Updates to This Policy">
        <p>
          We may update this Cookie Policy from time to time to reflect changes in
          technology, legislation, or our business practices. When we do, we will revise
          the "Last Updated" date at the top of this page. We encourage you to review
          this policy periodically to stay informed about how we use cookies.
        </p>
      </SectionCard>

      <ContactCard
        sectionNo="07"
        title="Questions about cookies?"
        description="If you have any questions or concerns about how we use cookies, please get in touch."
        primaryLabel="Return to Home"
        primaryLink="/"
        secondaryLabel="Privacy Policy"
        secondaryLink="/privacy-policy"
      />
    </LegalBody>
  </LegalPageShell>
)

export default CookiePolicy
