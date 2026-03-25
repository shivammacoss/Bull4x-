import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsAndConditionsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-bluestone-deep">
      {/* Header */}
      <header className="bg-bluestone-deep/95 border-b border-white/10 px-4 py-4 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Unicap" className="h-8" />
            <span className="text-white/50">|</span>
            <h1 className="text-white font-semibold">Terms & Conditions</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/5 rounded-2xl border border-white/10 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-white mb-2">Terms & Conditions</h1>
          <p className="text-white/50 mb-8">Last updated: March 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">1. Introduction</h2>
              <p className="text-white/70 leading-relaxed">
                Welcome to Unicap Markets. These Terms and Conditions ("Terms") govern your access to and use of the Unicap Markets platform, website, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                Unicap Markets LLC is registered in Saint Vincent and the Grenadines with registration number 3766 LLC 2024. Our principal place of business is located at Offices 5, One Central Plaza, Dubai, United Arab Emirates.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">2. Eligibility</h2>
              <p className="text-white/70 leading-relaxed">
                To use our Services, you must:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Be at least 18 years old or of legal age in your jurisdiction</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Not be a resident of a restricted country (including USA, Canada, New Zealand, Iran, North Korea)</li>
                <li>Complete our Know Your Customer (KYC) verification process</li>
                <li>Provide accurate and complete registration information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">3. Account Registration</h2>
              <p className="text-white/70 leading-relaxed">
                To access certain features of our Services, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your login credentials secure and confidential</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">4. Trading Services</h2>
              <p className="text-white/70 leading-relaxed">
                Unicap Markets provides access to trading in various financial instruments including forex, cryptocurrencies, commodities, indices, and contracts for difference (CFDs). You acknowledge that:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Trading involves significant risk of loss</li>
                <li>Past performance is not indicative of future results</li>
                <li>You may lose more than your initial investment</li>
                <li>Leverage can amplify both profits and losses</li>
                <li>You are solely responsible for your trading decisions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">5. Deposits and Withdrawals</h2>
              <p className="text-white/70 leading-relaxed">
                All deposits and withdrawals are subject to our verification procedures and applicable fees. We reserve the right to:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Request additional documentation for verification purposes</li>
                <li>Delay or refuse transactions that appear suspicious</li>
                <li>Apply processing fees as disclosed on our platform</li>
                <li>Set minimum and maximum transaction limits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">6. Prohibited Activities</h2>
              <p className="text-white/70 leading-relaxed">
                You agree not to engage in any of the following prohibited activities:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Using the Services for any illegal purpose</li>
                <li>Market manipulation or fraudulent trading practices</li>
                <li>Money laundering or terrorist financing</li>
                <li>Unauthorized access to our systems or other users' accounts</li>
                <li>Using automated systems or bots without authorization</li>
                <li>Providing false or misleading information</li>
                <li>Circumventing any security measures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">7. Intellectual Property</h2>
              <p className="text-white/70 leading-relaxed">
                All content, trademarks, logos, and intellectual property on our platform are owned by Unicap Markets LLC or its licensors. You may not copy, modify, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">8. Limitation of Liability</h2>
              <p className="text-white/70 leading-relaxed">
                To the maximum extent permitted by law, Unicap Markets LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses resulting from your use of our Services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">9. Indemnification</h2>
              <p className="text-white/70 leading-relaxed">
                You agree to indemnify and hold harmless Unicap Markets LLC, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Services or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">10. Termination</h2>
              <p className="text-white/70 leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for any reason, including but not limited to violation of these Terms, suspected fraudulent activity, or regulatory requirements. Upon termination, you must cease all use of our Services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">11. Modifications</h2>
              <p className="text-white/70 leading-relaxed">
                We may modify these Terms at any time. Changes will be effective upon posting to our website. Your continued use of the Services after any modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">12. Governing Law</h2>
              <p className="text-white/70 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of Saint Vincent and the Grenadines. Any disputes arising from these Terms shall be resolved through binding arbitration.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">13. Contact Information</h2>
              <p className="text-white/70 leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <ul className="list-none text-white/70 mt-2 space-y-2">
                <li><strong className="text-white">Email:</strong> support@unicapmarkets.com</li>
                <li><strong className="text-white">Website:</strong> www.unicapmarkets.com</li>
                <li><strong className="text-white">Address:</strong> Offices 5, One Central Plaza, Dubai, UAE</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 leading-relaxed">
              <strong className="text-white/70">Unicap Markets</strong> (previously known as UC Markets - ucmarkets.com) is the trading name of Unicap Markets LLC, which is Registered in Saint Vincent and the Grenadines through registration number 3766 LLC 2024.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 leading-relaxed">
              <strong className="text-white/70">Risk Warning:</strong> Trading in securities involves significant risk. Prices may fluctuate and securities can become entirely valueless. You may incur losses that exceed your potential profits, and in some cases, losses may exceed the amount you have deposited. Securities, futures, options, and contracts for differences are complex financial instruments and are not suitable for all investors. Engaging in such transactions requires a sound understanding of the associated risks. Please read and ensure you fully understand our Risk Disclosure. Our leverage is dynamic and may change at any time. Such changes may affect your positions and margin requirements. You are responsible for monitoring your positions and maintaining sufficient margin at all times.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 leading-relaxed">
              <strong className="text-white/70">Restricted Countries:</strong> Unicap Markets LLC does not provide services for residents of certain countries such as the United States of America, Canada, New Zealand, Iran and North Korea (Democratic People's Republic of Korea) or a country where such distribution or use would be contrary to local law or regulation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 leading-relaxed">
              You must be 18 years old, or of legal age as determined in your country. Upon registering an account with Unicap Markets LLC, you acknowledge that you are registering at your own free will, without solicitation on behalf of Unicap Markets LLC. Unicap Markets LLC does not direct its website and services to any individual in any country in which the use of its website and services are prohibited by local laws or regulations. When accessing this website from a country in which its use may or may not be prohibited, it is the user's responsibility to ensure that any use of the website or services adheres to local laws or regulations. Unicap Markets LLC does not affirm that the information on its website is suitable for all jurisdictions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
