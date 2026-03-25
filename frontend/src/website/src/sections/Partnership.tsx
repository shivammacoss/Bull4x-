import { useEffect, useRef, useState } from 'react';
import { DollarSign, BarChart3, Package, Headphones, ArrowRight, TrendingUp, Users, Award } from 'lucide-react';

const benefits = [
  {
    icon: DollarSign,
    title: 'Competitive Commissions',
    description: 'Earn up to $800 per qualified trader with our tiered commission structure.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Tracking',
    description: 'Monitor your referrals, conversions, and earnings in real-time with our partner dashboard.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Package,
    title: 'Marketing Materials',
    description: 'Access professional banners, landing pages, and promotional content.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    description: 'Get a dedicated partnership manager to help maximize your earnings.',
    color: 'from-orange-500 to-orange-600',
  },
];

const stats = [
  { value: '$5M+', label: 'Paid to Partners', icon: TrendingUp },
  { value: '2,500+', label: 'Active Partners', icon: Users },
  { value: '50%', label: 'Revenue Share', icon: Award },
];

function BenefitCard({ benefit, index, isVisible }: { benefit: typeof benefits[0]; index: number; isVisible: boolean }) {
  return (
    <div
      className={`group glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 card-hover-lift ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
      }`}
      style={{
        transitionDelay: `${200 + index * 100}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        animation: isVisible ? `float ${6 + index * 0.5}s ease-in-out infinite` : 'none',
        animationDelay: `${index * 0.5}s`,
      }}
    >
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-400`}
      >
        <benefit.icon className="w-6 h-6 text-white icon-rotate" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-white font-display mb-2">
        {benefit.title}
      </h3>
      <p className="text-sm text-white/70">
        {benefit.description}
      </p>
    </div>
  );
}

export default function Partnership() {
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
      id="partnership"
      ref={sectionRef}
      className="relative section-padding bg-gradient-to-b from-bluestone-dark to-bluestone-deep overflow-hidden"
    >
      {/* Background Pattern with Animated Orbs */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-orb-2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-orb-1" />
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
              Partnership Program
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
              Grow Your Business with Unicap
            </h2>
            <p
              className={`text-lg text-white/70 mb-8 transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                transitionDelay: '200ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              Join our industry-leading partnership program and earn competitive commissions by introducing traders to a broker they can trust.
            </p>

            {/* Stats */}
            <div
              className={`grid grid-cols-3 gap-4 mb-8 transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                transitionDelay: '300ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                    <stat.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-xl font-bold text-white font-display animate-number-glow">
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                transitionDelay: '400ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <button className="btn-primary flex items-center justify-center gap-2 group animate-pulse-glow">
                Become a Partner
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-400" />
              </button>
              <button className="btn-secondary">
                Learn More
              </button>
            </div>
          </div>

          {/* Right - Benefits Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <BenefitCard 
                key={benefit.title} 
                benefit={benefit} 
                index={index} 
                isVisible={isVisible} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
