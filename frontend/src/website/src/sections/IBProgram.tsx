import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, DollarSign, BarChart3, Megaphone, Clock } from 'lucide-react';

const features = [
  { icon: DollarSign, text: 'Competitive revenue sharing' },
  { icon: BarChart3, text: 'Real-time tracking dashboard' },
  { icon: Megaphone, text: 'Marketing support' },
  { icon: Clock, text: 'Long-term passive income opportunity' },
];

export default function IBProgram() {
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
      id="ib-program"
      ref={sectionRef}
      className="relative section-padding bg-bluestone-dark overflow-hidden"
    >
      {/* Background Orbs */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-orb-1" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-bluestone-royal/10 rounded-full blur-3xl animate-orb-2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <span
              className={`inline-block text-sm font-semibold text-gold uppercase tracking-wider mb-4 transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              IB Partnership
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
              Earn With Our IB Partnership Model
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
              Become a Unicap IB partner and grow your network while earning attractive commissions.
              Build your trading community with confidence.
            </p>

            {/* Feature List */}
            <div className="space-y-4 mb-10">
              {features.map((feature, index) => (
                <div
                  key={feature.text}
                  className={`flex items-center gap-4 transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                  }`}
                  style={{
                    transitionDelay: `${300 + index * 100}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-gold" />
                  </div>
                  <span className="text-white/80 text-lg">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate('/user/login')}
              className={`btn-primary flex items-center gap-2 group animate-pulse-glow transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: '700ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              Become an IB Partner
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-400" />
            </button>
          </div>

          {/* Right Visual */}
          <div
            className={`relative transition-all duration-800 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
            style={{
              transitionDelay: '300ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="glass rounded-3xl p-8 relative overflow-hidden">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white font-display">IB Dashboard</h3>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Referrals', value: '1,247', color: 'text-gold' },
                    { label: 'Active Clients', value: '892', color: 'text-bluestone-accent' },
                    { label: 'Commission Earned', value: '$24,580', color: 'text-gold-light' },
                    { label: 'This Month', value: '$3,120', color: 'text-gold' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors duration-400">
                      <div className="text-xs text-white/50 mb-1">{stat.label}</div>
                      <div className={`text-xl font-bold font-display ${stat.color}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                {/* Commission Chart */}
                <div>
                  <div className="text-sm text-white/60 mb-3">Monthly Commission Trend</div>
                  <div className="flex items-end gap-2 h-20">
                    {[40, 55, 45, 70, 60, 80, 75, 90, 85, 95, 88, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-gold-dark/50 to-gold/80 rounded-t transition-all duration-500 hover:from-gold-dark/70 hover:to-gold"
                        style={{
                          height: isVisible ? `${h}%` : '0%',
                          transitionDelay: `${800 + i * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
