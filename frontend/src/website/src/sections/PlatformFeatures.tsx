import { useEffect, useRef, useState } from 'react';
import { Zap, Waves, TrendingDown, Shield, Laptop, Check } from 'lucide-react';

const features = [
  {
    icon: Zap,
    stat: '<50ms',
    title: 'Ultra-Fast Execution',
    description: 'Execute trades in under 50 milliseconds with our low-latency infrastructure and direct market access.',
    highlights: ['No requotes', 'No dealer intervention', 'Direct market access'],
  },
  {
    icon: Waves,
    stat: '$50B+',
    title: 'Deep Liquidity',
    description: 'Access deep liquidity pools from tier-1 banks and institutions for seamless order execution.',
    highlights: ['Tier-1 bank liquidity', 'Minimal slippage', 'Large order handling'],
  },
  {
    icon: TrendingDown,
    stat: '0.0 pips',
    title: 'Competitive Spreads',
    description: 'Trade with spreads starting from 0.0 pips on major pairs with our RAW pricing model.',
    highlights: ['RAW pricing', 'No hidden fees', 'Transparent costs'],
  },
  {
    icon: Shield,
    stat: '100%',
    title: 'Advanced Risk Management',
    description: 'Protect your capital with negative balance protection and advanced risk management tools.',
    highlights: ['Negative balance protection', 'Stop-loss guaranteed', 'Margin alerts'],
  },
  {
    icon: Laptop,
    stat: '24/7',
    title: 'Multi-Device Trading',
    description: 'Trade seamlessly across Web, Desktop, and Mobile platforms with synchronized accounts.',
    highlights: ['WebTrader', 'MT4/MT5', 'Mobile apps', 'Cloud sync'],
  },
];

// Count-up animation hook
function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!start) return;
    
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quart
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOut * end);
      
      if (currentCount !== countRef.current) {
        countRef.current = currentCount;
        setCount(currentCount);
      }
      
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    
    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [end, duration, start]);

  return count;
}

function FeatureCard({
  feature,
  index,
  isVisible,
}: {
  feature: typeof features[0];
  index: number;
  isVisible: boolean;
}) {
  const numericValue = parseInt(feature.stat.replace(/[^0-9]/g, '')) || 0;
  const count = useCountUp(numericValue, 2000, isVisible);

  const formatStat = () => {
    if (feature.stat.includes('<')) return feature.stat;
    if (feature.stat.includes('$')) return `$${count}B+`;
    if (feature.stat.includes('%')) return `${count}%`;
    return feature.stat;
  };

  return (
    <div
      className={`group relative transition-all duration-600 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{
        transitionDelay: `${300 + index * 100}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="relative glass rounded-3xl p-8 h-full card-hover-lift overflow-hidden">
        {/* Stat Badge */}
        <div className="absolute -top-4 right-6">
          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg font-display shadow-glow animate-number-glow">
            {formatStat()}
          </div>
        </div>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-500/30 group-hover:scale-110 transition-all duration-400">
          <feature.icon className="w-7 h-7 text-blue-400 icon-rotate" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold text-white font-display mb-3">
          {feature.title}
        </h3>
        <p className="text-white/70 mb-6 leading-relaxed">
          {feature.description}
        </p>

        {/* Highlights */}
        <ul className="space-y-2">
          {feature.highlights.map((highlight, i) => (
            <li
              key={highlight}
              className={`flex items-center gap-2 text-sm text-white/60 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
              style={{ 
                transitionDelay: `${600 + index * 100 + i * 50}ms`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function PlatformFeatures() {
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
      ref={sectionRef}
      className="relative section-padding bg-gradient-to-b from-bluestone-dark to-bluestone-deep overflow-hidden"
    >
      {/* Background Pattern with Animated Orbs */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-orb-1" />
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-orb-2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className={`inline-block text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            Why Choose Unicap
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
            Built for Traders, by Traders
          </h2>
          <p
            className={`text-lg text-white/70 max-w-3xl mx-auto transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ 
              transitionDelay: '200ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            Experience the difference with our institutional-grade trading infrastructure designed for speed, reliability, and performance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
