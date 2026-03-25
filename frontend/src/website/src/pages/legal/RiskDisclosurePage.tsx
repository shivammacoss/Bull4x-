import { useEffect } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RiskDisclosurePage() {
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
            <h1 className="text-white font-semibold">Risk Disclosure</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/5 rounded-2xl border border-white/10 p-8 md:p-12">
          {/* Warning Banner */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">
              <strong>Important:</strong> Trading in financial instruments involves significant risk and may not be suitable for all investors. Please read this entire document carefully before trading.
            </p>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Risk Disclosure Statement</h1>
          <p className="text-white/50 mb-8">Last updated: March 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">1. General Risk Warning</h2>
              <p className="text-white/70 leading-relaxed">
                Trading in securities involves significant risk. Prices may fluctuate and securities can become entirely valueless. You may incur losses that exceed your potential profits, and in some cases, losses may exceed the amount you have deposited.
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                Securities, futures, options, and contracts for differences (CFDs) are complex financial instruments and are not suitable for all investors. Engaging in such transactions requires a sound understanding of the associated risks.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">2. Leverage Risk</h2>
              <p className="text-white/70 leading-relaxed">
                Trading on margin (leverage) can work against you as well as for you. Leverage amplifies both gains and losses. A small market movement can have a proportionally larger impact on your account balance.
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                Our leverage is dynamic and may change at any time. Such changes may affect your positions and margin requirements. You are responsible for monitoring your positions and maintaining sufficient margin at all times.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">3. Market Risk</h2>
              <p className="text-white/70 leading-relaxed">
                Financial markets are subject to various risks including but not limited to:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Price volatility and rapid market movements</li>
                <li>Liquidity risk - inability to execute trades at desired prices</li>
                <li>Gap risk - prices jumping without trading at intermediate levels</li>
                <li>Currency risk for trades in foreign currencies</li>
                <li>Interest rate risk affecting certain instruments</li>
                <li>Political and economic events causing market disruption</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">4. Forex Trading Risks</h2>
              <p className="text-white/70 leading-relaxed">
                Foreign exchange (Forex) trading carries specific risks:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>High volatility in currency pairs</li>
                <li>24-hour market with potential overnight gaps</li>
                <li>Impact of central bank interventions</li>
                <li>Geopolitical events affecting currency values</li>
                <li>Counterparty risk with over-the-counter transactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">5. Cryptocurrency Trading Risks</h2>
              <p className="text-white/70 leading-relaxed">
                Cryptocurrency trading involves additional unique risks:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Extreme price volatility</li>
                <li>Regulatory uncertainty across jurisdictions</li>
                <li>Technology risks including network failures</li>
                <li>Security risks including hacking and theft</li>
                <li>Limited market history and unpredictable behavior</li>
                <li>Potential for total loss of investment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">6. CFD Trading Risks</h2>
              <p className="text-white/70 leading-relaxed">
                Contracts for Difference (CFDs) are complex instruments:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>You do not own the underlying asset</li>
                <li>Losses can exceed your initial deposit</li>
                <li>Overnight financing charges may apply</li>
                <li>Prices may differ from underlying market prices</li>
                <li>Stop-loss orders may not limit losses in all conditions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">7. Technical Risks</h2>
              <p className="text-white/70 leading-relaxed">
                Electronic trading systems are subject to technical risks:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>System failures or interruptions</li>
                <li>Internet connectivity issues</li>
                <li>Delayed or failed order execution</li>
                <li>Software bugs or errors</li>
                <li>Cybersecurity threats</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">8. No Guarantee of Profits</h2>
              <p className="text-white/70 leading-relaxed">
                There is no guarantee that you will make profits or avoid losses. Past performance is not indicative of future results. Any trading strategies, signals, or recommendations provided do not guarantee success.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">9. Suitability</h2>
              <p className="text-white/70 leading-relaxed">
                Before trading, you should carefully consider whether trading is appropriate for you in light of your:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 space-y-2">
                <li>Financial situation and resources</li>
                <li>Investment objectives</li>
                <li>Risk tolerance</li>
                <li>Trading experience and knowledge</li>
              </ul>
              <p className="text-white/70 leading-relaxed mt-4">
                You should only trade with money you can afford to lose. If you are unsure, seek independent financial advice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">10. Acknowledgment</h2>
              <p className="text-white/70 leading-relaxed">
                By using our Services, you acknowledge that you have read and understood this Risk Disclosure Statement and accept the risks involved in trading financial instruments.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gold mb-4">11. Contact Us</h2>
              <p className="text-white/70 leading-relaxed">
                If you have questions about the risks involved in trading, please contact us:
              </p>
              <ul className="list-none text-white/70 mt-2 space-y-2">
                <li><strong className="text-white">Email:</strong> support@unicapmarkets.com</li>
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
