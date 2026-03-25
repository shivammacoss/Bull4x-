import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FundingRulesPage() {
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
            <h1 className="text-white font-semibold">Funding Rules</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/5 rounded-2xl border border-white/10 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-white mb-2">Funding Challenge Rules & Terms</h1>
          <p className="text-white/50 mb-8">Last updated: March 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">1. Overview</h2>
              <p className="text-white/70 leading-relaxed">
                The Unicap Markets Funding Program allows traders to demonstrate their skills and receive funded trading accounts. This document outlines the rules, requirements, and terms for participating in our funding challenges.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">2. Challenge Phases</h2>
              <p className="text-white/70 leading-relaxed">
                Our funding program consists of the following phases:
              </p>
              <h3 className="text-lg font-medium text-white mt-4 mb-2">Phase 1: Evaluation</h3>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Profit target: 8% of initial balance</li>
                <li>Maximum daily drawdown: 5%</li>
                <li>Maximum total drawdown: 10%</li>
                <li>Minimum trading days: 5 days</li>
                <li>No time limit</li>
              </ul>
              <h3 className="text-lg font-medium text-white mt-4 mb-2">Phase 2: Verification</h3>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Profit target: 5% of initial balance</li>
                <li>Maximum daily drawdown: 5%</li>
                <li>Maximum total drawdown: 10%</li>
                <li>Minimum trading days: 5 days</li>
                <li>No time limit</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">3. Trading Rules</h2>
              <p className="text-white/70 leading-relaxed">
                All participants must adhere to the following trading rules:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Trade only approved instruments (Forex, Indices, Commodities, Crypto)</li>
                <li>No martingale or grid trading strategies</li>
                <li>No high-frequency trading or arbitrage</li>
                <li>No copy trading from external sources</li>
                <li>No hedging across multiple accounts</li>
                <li>Maximum lot size limits apply based on account size</li>
                <li>All positions must be closed before weekends (unless swing trading is enabled)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">4. Drawdown Rules</h2>
              <p className="text-white/70 leading-relaxed">
                Understanding drawdown calculations is crucial:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li><strong className="text-white">Daily Drawdown:</strong> Maximum 5% loss from the day's starting balance (including floating P/L)</li>
                <li><strong className="text-white">Total Drawdown:</strong> Maximum 10% loss from the initial account balance</li>
                <li>Drawdown is calculated in real-time including open positions</li>
                <li>Breaching drawdown limits results in immediate account failure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">5. Profit Split</h2>
              <p className="text-white/70 leading-relaxed">
                Upon successful completion of both phases, funded traders receive:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Up to 90% profit split on funded accounts</li>
                <li>First payout available after 14 days of funded trading</li>
                <li>Subsequent payouts available bi-weekly</li>
                <li>Minimum payout amount: $100</li>
                <li>Profit split percentage may increase based on performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">6. Account Scaling</h2>
              <p className="text-white/70 leading-relaxed">
                Successful funded traders may qualify for account scaling:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>10% account increase every 3 months of profitable trading</li>
                <li>Maximum scaling up to 2x original account size</li>
                <li>Consistent profitability required for scaling</li>
                <li>No drawdown violations during scaling period</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">7. Prohibited Activities</h2>
              <p className="text-white/70 leading-relaxed">
                The following activities will result in immediate disqualification:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Account sharing or third-party trading</li>
                <li>Using EAs or bots not approved by Unicap Markets</li>
                <li>Exploiting platform errors or price feed issues</li>
                <li>News trading within 2 minutes of high-impact events</li>
                <li>Gambling behavior (all-in trades, excessive risk)</li>
                <li>Multiple accounts for the same challenge</li>
                <li>Any form of manipulation or abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">8. Refund Policy</h2>
              <p className="text-white/70 leading-relaxed">
                Challenge fees are subject to the following refund terms:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Full refund if no trades placed within 14 days</li>
                <li>Challenge fee refunded upon first payout from funded account</li>
                <li>No refunds for failed challenges</li>
                <li>No refunds for rule violations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">9. Account Termination</h2>
              <p className="text-white/70 leading-relaxed">
                Funded accounts may be terminated for:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Breaching drawdown limits</li>
                <li>Violating trading rules</li>
                <li>Inactivity for 30+ consecutive days</li>
                <li>Fraudulent activity or rule manipulation</li>
                <li>Providing false information during registration</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">10. Modifications</h2>
              <p className="text-white/70 leading-relaxed">
                Unicap Markets reserves the right to modify these rules at any time. Changes will be communicated via email and will apply to new challenges. Existing challenges will continue under their original terms unless otherwise specified.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">11. Contact & Support</h2>
              <p className="text-white/70 leading-relaxed">
                For questions about the funding program:
              </p>
              <ul className="list-none text-white/70 mt-2 space-y-2">
                <li><strong className="text-white">Email:</strong> funding@unicapmarkets.com</li>
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
