import { useEffect, useRef, useState } from 'react';
import { Globe, Cpu, Award, Users, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Direct Market Access',
    description: 'Trade directly on global markets with deep liquidity and fast execution.',
  },
  {
    icon: Award,
    title: 'Capital Funding Solutions',
    description: 'Get funded and trade with company capital through our performance-based programs.',
  },
  {
    icon: Users,
    title: 'Profitable IB Partnerships',
    description: 'Earn attractive commissions by growing your trading community as an IB partner.',
  },
  {
    icon: Cpu,
    title: 'Smart Copy Trading Technology',
    description: 'Automatically replicate strategies of experienced traders in real-time.',
  },
];

const stats = [
  { value: 500, suffix: 'K+', label: 'Active Traders', icon: Users },
  { value: 150, suffix: '+', label: 'Countries Served', icon: Globe },
  { value: 50, suffix: 'B+', prefix: '$', label: 'Monthly Volume', icon: TrendingUp },
  { value: 9, suffix: '+', label: 'Years Experience', icon: Award },
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

function StatCard({ stat, index, isVisible }: { stat: typeof stats[0]; index: number; isVisible: boolean }) {
  const count = useCountUp(stat.value, 2000, isVisible);
  
  return (
    <div
      className={`glass rounded-2xl p-6 text-center card-hover-lift group transition-all duration-600 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ 
        transitionDelay: `${300 + index * 100}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/30 transition-colors duration-400">
        <stat.icon className="w-6 h-6 text-gold icon-rotate" />
      </div>
      <div className="text-3xl font-bold text-white font-display mb-1 animate-number-glow">
        {stat.prefix || ''}{count}{stat.suffix}
      </div>
      <div className="text-sm text-white/60">{stat.label}</div>
    </div>
  );
}

function FeatureCard({ feature, index, isVisible }: { feature: typeof features[0]; index: number; isVisible: boolean }) {
  return (
    <div
      className={`flex items-start gap-4 glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 group card-hover-lift ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ 
        transitionDelay: `${600 + index * 100}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bluestone-royal to-bluestone-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-400">
        <feature.icon className="w-7 h-7 text-white icon-rotate" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white font-display mb-2">
          {feature.title}
        </h3>
        <p className="text-white/70">{feature.description}</p>
      </div>
    </div>
  );
}

export default function About() {
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
      id="about"
      ref={sectionRef}
      className="relative section-padding bg-bluestone-dark overflow-hidden"
    >
      {/* Background Pattern with Animated Orbs */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-bluestone-accent/10 rounded-full blur-3xl animate-orb-1" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-bluestone-royal/10 rounded-full blur-3xl animate-orb-2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className={`inline-block text-sm font-semibold text-gold uppercase tracking-wider mb-4 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            About Unicap
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
            A Transparent & Performance-Driven Trading Ecosystem
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
            Unicap is built for modern traders and partners who demand transparency, security, and performance.
            Our mission is simple — empower traders with tools, capital, and reliable infrastructure.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} isVisible={isVisible} />
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}
