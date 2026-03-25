import { useEffect, useRef, useState } from 'react';
import { UserPlus, ShieldCheck, Settings, TrendingUp } from 'lucide-react';

const steps = [
  { icon: UserPlus, step: '01', title: 'Register Account', description: 'Create your Unicap account in minutes with a simple registration process.' },
  { icon: ShieldCheck, step: '02', title: 'Complete Verification', description: 'Verify your identity securely to unlock full platform access.' },
  { icon: Settings, step: '03', title: 'Choose Service', description: 'Select from Trade, Funding, IB Partnership, or Copy Trading based on your goals.' },
  { icon: TrendingUp, step: '04', title: 'Start Growing', description: 'Begin your journey towards consistent growth and financial success.' },
];

export default function ClientJourney() {
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
      id="journey"
      ref={sectionRef}
      className="relative section-padding bg-bluestone-dark overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-bluestone-accent/10 rounded-full blur-3xl animate-orb-1" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-bluestone-royal/10 rounded-full blur-3xl animate-orb-2" />
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
            Get Started
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
            Your Journey With Unicap
          </h2>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className={`relative text-center transition-all duration-600 h-full ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: `${200 + index * 150}ms`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Connector Line (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-gold/50 to-transparent" />
              )}

              <div className="glass rounded-2xl p-6 card-hover-lift group relative h-full flex flex-col">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {step.step}
                </div>

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bluestone-royal to-bluestone-accent flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-400">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white font-display mb-2">
                  {step.title}
                </h3>
                <p className="text-white/60 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
