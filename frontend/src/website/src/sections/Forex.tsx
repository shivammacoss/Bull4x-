import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, Shield, Zap, Smartphone } from 'lucide-react';

const features = [
  { icon: Globe, text: 'Deep liquidity' },
  { icon: Shield, text: 'Secure trade execution' },
  { icon: Zap, text: 'Advanced trading tools' },
  { icon: Smartphone, text: 'Multi-device access (Web & Mobile)' },
];

export default function Forex() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '-50px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="forex"
      ref={sectionRef}
      className="relative py-10 bg-bluestone-dark overflow-hidden"
    >
      {/* Background Orbs */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-bluestone-accent/10 rounded-full blur-3xl animate-orb-1" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-bluestone-royal/10 rounded-full blur-3xl animate-orb-2" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span
          className={`inline-block text-sm font-semibold text-gold uppercase tracking-wider mb-4 transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          Forex Trading
        </span>
        <h2
          className={`font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-6 transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{
            transitionDelay: '100ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          Global Forex Market Access
        </h2>
        <p
          className={`text-lg text-white/70 mb-10 max-w-2xl mx-auto transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{
            transitionDelay: '200ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          Trade major, minor, and exotic currency pairs with tight spreads and fast execution.
          Whether you are a beginner or professional trader, Unicap provides stable
          infrastructure for consistent performance.
        </p>

        {/* Feature List */}
        <div className="flex justify-center gap-8 mb-10">
          {features.map((feature, index) => (
            <div
              key={feature.text}
              className={`flex items-center gap-3 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: `${300 + index * 100}ms`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-gold" />
              </div>
              <span className="text-white/80 text-sm">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/user/signup')}
          className={`btn-primary inline-flex items-center gap-2 group animate-pulse-glow transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{
            transitionDelay: '700ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          Open Live Account
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-400" />
        </button>
      </div>

      {/* Account Comparison Table */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 pb-14">
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-5 text-white/40 font-normal w-1/4"></th>
                {['STD', 'ECN', 'PRO'].map((col) => (
                  <th key={col} className="px-6 py-5 text-center">
                    <span className="text-white font-bold text-base tracking-wide">{col}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Asset Classes', std: 'FX Pairs, Indices,\nMetals, Energies, Cryptocurrencies', ecn: 'FX Pairs, Indices,\nMetals, Energies, Cryptocurrencies', pro: 'FX Pairs, Indices,\nMetals, Energies, Cryptocurrencies' },
                { label: 'Spreads From', std: '1.0 pips', ecn: '0.0 pips', pro: '0.0 pips' },
                { label: 'Commission', std: '0', ecn: '$1.5/lot per side', pro: '0' },
                { label: 'Leverage up to', std: '1:1000', ecn: '1:1000', pro: '1:1000', highlight: true },
                { label: 'Minimum Deposit', std: '$10', ecn: '$10', pro: '$5000', highlight: true },
                { label: 'Minimum Trade Size', std: '0.01 LOTS', ecn: '0.01 LOTS', pro: '0.01 LOTS' },
                { label: 'Maximum Total Orders', std: 'Unlimited', ecn: 'Unlimited', pro: 'Unlimited' },
                { label: 'Maximum Volume Per Open Orders', std: '50 LOTS', ecn: '50 LOTS', pro: '50 LOTS' },
                { label: 'Account Currency', std: 'USD', ecn: 'USD', pro: 'USD', highlight: true },
                { label: 'Trading Platforms', std: 'MT4/MT5 Desktop, Mobile', ecn: 'MT4/MT5 Desktop, Mobile', pro: 'MT4/MT5 Desktop, Mobile', highlight: true },
                { label: 'Order Execution', std: 'Market', ecn: 'Market', pro: 'Market' },
                { label: 'Margin Call', std: '50%', ecn: '50%', pro: '50%' },
                { label: 'Stop Out', std: '30%', ecn: '30%', pro: '30%' },
                { label: 'Swap Free account (on request)', std: '✓', ecn: '✓', pro: '✗', stdGreen: true, ecnGreen: true, proRed: true },
                { label: 'Negative Balance Protection', std: '✓', ecn: '✓', pro: '✓', stdGreen: true, ecnGreen: true, proGreen: true },
              ].map((row, i) => (
                <tr key={row.label} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="px-6 py-4 text-white font-semibold text-sm">{row.label}</td>
                  <td className={`px-6 py-4 text-center whitespace-pre-line text-sm ${row.stdGreen ? 'text-green-400 text-lg' : row.highlight ? 'text-gold' : 'text-white/70'}`}>{row.std}</td>
                  <td className={`px-6 py-4 text-center whitespace-pre-line text-sm ${row.ecnGreen ? 'text-green-400 text-lg' : row.highlight ? 'text-gold' : 'text-white/70'}`}>{row.ecn}</td>
                  <td className={`px-6 py-4 text-center whitespace-pre-line text-sm ${row.proRed ? 'text-red-400 text-lg' : row.proGreen ? 'text-green-400 text-lg' : row.highlight ? 'text-gold' : 'text-white/70'}`}>{row.pro}</td>
                </tr>
              ))}
              {/* Register Row */}
              <tr>
                <td className="px-6 py-6"></td>
                {['STD', 'ECN', 'PRO'].map((col) => (
                  <td key={col} className="px-6 py-6 text-center">
                    <button 
                      onClick={() => navigate('/user/signup')}
                      className="px-8 py-2.5 rounded-full border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-semibold transition-all duration-300"
                    >
                      Register
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
