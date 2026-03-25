import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicyPage() {
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
            <h1 className="text-white font-semibold">Privacy Policy</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/5 rounded-2xl border border-white/10 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-white/50 mb-8">Last updated: March 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">1. Introduction</h2>
              <p className="text-white/70 leading-relaxed">
                Unicap Markets LLC ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our trading platform, website, and services.
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                By using our Services, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use our Services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">2. Information We Collect</h2>
              <p className="text-white/70 leading-relaxed">
                We collect several types of information from and about users of our Services:
              </p>
              <h3 className="text-lg font-medium text-white mt-4 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Full name and date of birth</li>
                <li>Email address and phone number</li>
                <li>Residential address</li>
                <li>Government-issued identification documents</li>
                <li>Financial information (bank accounts, payment details)</li>
                <li>Employment and income information</li>
              </ul>
              <h3 className="text-lg font-medium text-white mt-4 mb-2">Technical Information</h3>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Login timestamps and session data</li>
                <li>Trading activity and transaction history</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">3. How We Use Your Information</h2>
              <p className="text-white/70 leading-relaxed">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>To provide and maintain our Services</li>
                <li>To process your transactions and manage your account</li>
                <li>To verify your identity and comply with KYC/AML requirements</li>
                <li>To communicate with you about your account and our Services</li>
                <li>To detect and prevent fraud and unauthorized access</li>
                <li>To improve our Services and develop new features</li>
                <li>To comply with legal and regulatory obligations</li>
                <li>To send promotional communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-white/70 leading-relaxed">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li><strong className="text-white">Service Providers:</strong> Third-party vendors who assist us in operating our platform</li>
                <li><strong className="text-white">Legal Requirements:</strong> When required by law, regulation, or legal process</li>
                <li><strong className="text-white">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong className="text-white">Protection:</strong> To protect our rights, privacy, safety, or property</li>
                <li><strong className="text-white">Consent:</strong> With your explicit consent for other purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">5. Data Security</h2>
              <p className="text-white/70 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information, including:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Encrypted storage of sensitive data</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">6. Data Retention</h2>
              <p className="text-white/70 leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide you services. We may also retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements. Financial records may be retained for up to 7 years as required by applicable regulations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">7. Your Rights</h2>
              <p className="text-white/70 leading-relaxed">
                Depending on your jurisdiction, you may have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li><strong className="text-white">Access:</strong> Request access to your personal data</li>
                <li><strong className="text-white">Correction:</strong> Request correction of inaccurate data</li>
                <li><strong className="text-white">Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
                <li><strong className="text-white">Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong className="text-white">Objection:</strong> Object to certain processing of your data</li>
                <li><strong className="text-white">Withdrawal:</strong> Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">8. Cookies and Tracking</h2>
              <p className="text-white/70 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie preferences through your browser settings. Essential cookies are required for the platform to function properly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">9. International Transfers</h2>
              <p className="text-white/70 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">10. Children's Privacy</h2>
              <p className="text-white/70 leading-relaxed">
                Our Services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child, we will take steps to delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">11. Changes to This Policy</h2>
              <p className="text-white/70 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date. Your continued use of our Services after any changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">12. Contact Us</h2>
              <p className="text-white/70 leading-relaxed">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:
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
