import { useEffect, useRef, useState } from 'react';
import { Monitor, Globe, Smartphone, Download, ExternalLink, Check } from 'lucide-react';

const platforms = [
  {
    icon: Monitor,
    title: 'MetaTrader 4',
    description: 'The world\'s most popular trading platform with advanced charting and automated trading.',
    features: ['Expert Advisors', '30+ indicators', 'One-click trading'],
    cta: 'Download MT4',
    color: 'from-blue-600 to-blue-700',
  },
  {
    icon: Monitor,
    title: 'MetaTrader 5',
    description: 'Next-generation platform with more timeframes, indicators, and advanced order types.',
    features: ['21 timeframes', '38 indicators', 'Economic calendar'],
    cta: 'Download MT5',
    color: 'from-indigo-600 to-indigo-700',
  },
  {
    icon: Globe,
    title: 'WebTrader',
    description: 'Trade directly from your browser with no downloads or installations required.',
    features: ['Instant access', 'Cross-platform', 'Real-time sync'],
    cta: 'Launch WebTrader',
    color: 'from-cyan-600 to-cyan-700',
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    description: 'Trade on the go with our powerful iOS and Android applications.',
    features: ['Push notifications', 'Biometric login', 'Full functionality'],
    cta: 'Get the App',
    color: 'from-purple-600 to-purple-700',
  },
];

export default function TradingPlatforms() {
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
      { threshold: 0.1, rootMargin: '-50px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="platforms"
      ref={sectionRef}
      className="relative section-padding bg-bluestone-dark overflow-hidden"
    >
      {/* Background Pattern with Animated Orbs */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 animate-orb-2" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 animate-orb-1" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            {/* Section Header */}
            <span
              className={`inline-block text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              Trading Platforms
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
              Trade Your Way, Anywhere
            </h2>
            <p
              className={`text-lg text-white/70 mb-10 transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                transitionDelay: '200ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              Choose from industry-leading platforms designed for every trading style and experience level.
            </p>

            {/* Platform Cards */}
            <div className="space-y-4">
              {platforms.map((platform, index) => (
                <div
                  key={platform.title}
                  className={`group glass rounded-2xl p-5 hover:bg-white/10 transition-all duration-500 card-hover-lift ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                  }`}
                  style={{ 
                    transitionDelay: `${200 + index * 100}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-400`}
                    >
                      <platform.icon className="w-6 h-6 text-white icon-rotate" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white font-display">
                          {platform.title}
                        </h3>
                        <button className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors duration-400">
                          {platform.cta}
                          {platform.cta.includes('Launch') ? (
                            <ExternalLink className="w-4 h-4" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-white/60 mb-3">
                        {platform.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {platform.features.map((feature) => (
                          <span
                            key={feature}
                            className="flex items-center gap-1 text-xs text-white/50"
                          >
                            <Check className="w-3 h-3 text-green-400" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Platform Preview */}
          <div
            className={`relative transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
            style={{ 
              transitionDelay: '400ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="relative animate-float-slow">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl animate-pulse-glow" />
              
              {/* Platform Mockup */}
              <div className="relative glass-strong rounded-3xl p-6 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                      <span className="text-white font-bold">B</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">Unicap MT5</div>
                      <div className="text-xs text-white/50">Connected to server</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400">Live</span>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="bg-bluestone-deep/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-white font-semibold">EUR/USD</div>
                      <div className="text-2xl font-bold text-white font-display animate-number-glow">1.0845</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 text-sm">+0.12%</div>
                      <div className="text-white/50 text-xs">+0.0013</div>
                    </div>
                  </div>
                  
                  {/* Candlestick Chart Visualization */}
                  <div className="h-32 flex items-end justify-between gap-1">
                    {[...Array(20)].map((_, i) => {
                      const height = Math.random() * 60 + 20;
                      const isGreen = Math.random() > 0.4;
                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center gap-0.5"
                        >
                          <div
                            className={`w-full rounded-sm ${isGreen ? 'bg-green-500/60' : 'bg-red-500/60'}`}
                            style={{ height: `${height}%` }}
                          />
                          <div
                            className={`w-0.5 ${isGreen ? 'bg-green-500/40' : 'bg-red-500/40'}`}
                            style={{ height: `${Math.random() * 20 + 5}px` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 text-center hover:bg-white/10 transition-colors duration-400">
                    <div className="text-xs text-white/50 mb-1">Spread</div>
                    <div className="text-white font-semibold">0.1 pips</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center hover:bg-white/10 transition-colors duration-400">
                    <div className="text-xs text-white/50 mb-1">Leverage</div>
                    <div className="text-white font-semibold">1:500</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center hover:bg-white/10 transition-colors duration-400">
                    <div className="text-xs text-white/50 mb-1">Margin</div>
                    <div className="text-white font-semibold">0.20%</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-all duration-400 hover:scale-[1.02]">
                    Buy
                  </button>
                  <button className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-400 hover:scale-[1.02]">
                    Sell
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
