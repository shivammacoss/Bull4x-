import { useEffect, useRef, useState } from 'react';
import { FileCheck, Lock, ClipboardCheck, Handshake } from 'lucide-react';

const features = [
  { icon: FileCheck, title: 'Clear Agreement Structure', description: 'Transparent terms and conditions for every service we offer.' },
  { icon: Lock, title: 'Secure Transaction Systems', description: 'Bank-grade encryption and security protocols to protect your data and funds.' },
  { icon: ClipboardCheck, title: 'Verified Trade Records', description: 'Full transparency with verified and auditable trade history.' },
  { icon: Handshake, title: 'Ethical Partnership Approach', description: 'Fair and honest relationships built on mutual trust and respect.' },
];

export default function Security() {
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
      id="security"
      ref={sectionRef}
      className="relative section-padding bg-bluestone-dark overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-bluestone-accent/10 rounded-full blur-3xl animate-orb-1" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-bluestone-royal/10 rounded-full blur-3xl animate-orb-2" />
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
            Security & Transparency
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
            Built On Trust & Clarity
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
            At Unicap, we believe financial relationships must be transparent and secure.
            We focus on long-term trust, not short-term gains.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex items-start gap-4 glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 group card-hover-lift ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: `${300 + index * 100}ms`,
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
          ))}
        </div>
      </div>
    </section>
  );
}
