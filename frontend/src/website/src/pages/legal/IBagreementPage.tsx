import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function IBagreementPage() {
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
            <h1 className="text-white font-semibold">IB Agreement</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/5 rounded-2xl border border-white/10 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-white mb-2">Introducing Broker Agreement</h1>
          <p className="text-white/50 mb-8">Last updated: March 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">1. Introduction</h2>
              <p className="text-white/70 leading-relaxed">
                This Introducing Broker Agreement ("Agreement") is entered into between Unicap Markets LLC ("Company," "we," "us") and the Introducing Broker ("IB," "you"). This Agreement governs the terms and conditions under which you may refer clients to Unicap Markets.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">2. Eligibility Requirements</h2>
              <p className="text-white/70 leading-relaxed">
                To become an Introducing Broker, you must:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Be at least 18 years old or of legal age in your jurisdiction</li>
                <li>Have a valid Unicap Markets trading account in good standing</li>
                <li>Complete the IB application and verification process</li>
                <li>Comply with all applicable laws and regulations in your jurisdiction</li>
                <li>Not be a resident of a restricted country</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">3. IB Responsibilities</h2>
              <p className="text-white/70 leading-relaxed">
                As an Introducing Broker, you agree to:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Refer clients to Unicap Markets in an ethical and professional manner</li>
                <li>Provide accurate information about our services and products</li>
                <li>Not make false or misleading claims about potential profits</li>
                <li>Disclose your IB relationship to referred clients</li>
                <li>Comply with all marketing guidelines provided by the Company</li>
                <li>Not engage in spam or unsolicited marketing activities</li>
                <li>Not provide investment advice unless properly licensed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">4. Commission Structure</h2>
              <p className="text-white/70 leading-relaxed">
                IBs earn commissions based on the trading activity of their referred clients:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Commission rates are determined by your IB tier level</li>
                <li>Commissions are calculated based on traded volume (lots)</li>
                <li>Multi-tier commission structures may apply for sub-IBs</li>
                <li>Commission rates may be adjusted with prior notice</li>
                <li>Detailed commission reports are available in your IB dashboard</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">5. Payment Terms</h2>
              <p className="text-white/70 leading-relaxed">
                Commission payments are subject to the following terms:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Commissions are credited to your IB wallet in real-time</li>
                <li>Minimum withdrawal amount may apply</li>
                <li>Withdrawals are processed within 1-3 business days</li>
                <li>You are responsible for any applicable taxes on commissions</li>
                <li>Commissions may be reversed for cancelled or disputed trades</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">6. Client Ownership</h2>
              <p className="text-white/70 leading-relaxed">
                Referred clients remain clients of Unicap Markets. The Company maintains the direct relationship with all clients and has sole discretion over:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Account approval and verification</li>
                <li>Trading conditions and leverage</li>
                <li>Dispute resolution</li>
                <li>Account suspension or termination</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">7. Prohibited Activities</h2>
              <p className="text-white/70 leading-relaxed">
                IBs are strictly prohibited from:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Self-referrals or referring fake accounts</li>
                <li>Offering rebates or incentives not approved by the Company</li>
                <li>Trading on behalf of referred clients</li>
                <li>Accessing client accounts or personal information</li>
                <li>Making guarantees about trading profits</li>
                <li>Using the Company's trademarks without authorization</li>
                <li>Engaging in any fraudulent or illegal activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">8. Marketing Materials</h2>
              <p className="text-white/70 leading-relaxed">
                The Company may provide marketing materials for IB use. All marketing activities must:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Use only approved marketing materials</li>
                <li>Include required risk warnings and disclaimers</li>
                <li>Comply with advertising regulations in your jurisdiction</li>
                <li>Not target restricted countries or minors</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">9. Termination</h2>
              <p className="text-white/70 leading-relaxed">
                Either party may terminate this Agreement at any time. Upon termination:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Outstanding commissions will be paid within 30 days</li>
                <li>You must cease all marketing activities using Company materials</li>
                <li>Referred clients remain with the Company</li>
                <li>Future commissions from existing referrals may be discontinued</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">10. Limitation of Liability</h2>
              <p className="text-white/70 leading-relaxed">
                The Company shall not be liable for any indirect, incidental, or consequential damages arising from this Agreement. Our total liability shall not exceed the commissions paid to you in the preceding 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">11. Modifications</h2>
              <p className="text-white/70 leading-relaxed">
                The Company reserves the right to modify this Agreement, commission rates, or IB program terms at any time. Changes will be communicated via email or through the IB dashboard. Continued participation constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">12. Contact Information</h2>
              <p className="text-white/70 leading-relaxed">
                For questions about the IB program, please contact:
              </p>
              <ul className="list-none text-white/70 mt-2 space-y-2">
                <li><strong className="text-white">Email:</strong> ib@unicapmarkets.com</li>
                <li><strong className="text-white">Support:</strong> support@unicapmarkets.com</li>
                <li><strong className="text-white">Website:</strong> www.unicapmarkets.com</li>
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
