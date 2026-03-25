import { useEffect, useRef, useState } from 'react';
import { Zap, DollarSign, BarChart3, Copy, HeadphonesIcon, FileText } from 'lucide-react';

const reasons = [
  { icon: Zap, title: 'High-Speed Trade Execution', description: 'Ultra-low latency infrastructure for lightning-fast order execution.' },
  { icon: DollarSign, title: 'Funding Support', description: 'Capital funding programs for serious and disciplined traders.' },
  { icon: BarChart3, title: 'Profitable IB Structure', description: 'Competitive commission model to maximize your earnings as an IB.' },
  { icon: Copy, title: 'Advanced Copy Trading', description: 'Cutting-edge technology to replicate top trader strategies automatically.' },
  { icon: HeadphonesIcon, title: 'Dedicated Client Support', description: 'Professional support team available to assist you every step of the way.' },
  { icon: FileText, title: 'Transparent Policies', description: 'Clear and honest policies with no hidden terms or conditions.' },
];

export default function WhyChoose() {
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
      id="why-choose"
      ref={sectionRef}
      className="relative section-padding bg-white overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-bluestone-accent/5 rounded-full blur-3xl animate-orb-1" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-orb-2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className={`inline-block text-sm font-semibold text-bluestone-accent uppercase tracking-wider mb-4 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            Our Advantage
          </span>
          <h2
            className={`font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-bluestone-dark mb-6 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{
              transitionDelay: '100ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            Why Choose Unicap?
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <div
              key={reason.title}
              className={`rounded-2xl p-6 text-center card-hover-lift group transition-all duration-600 bg-[#E1E1E1] border border-gray-300 shadow-lg hover:shadow-xl ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: `${200 + index * 100}ms`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bluestone-royal to-bluestone-accent flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-400">
                <reason.icon className="w-7 h-7 text-white icon-rotate" />
              </div>
              <h3 className="text-lg font-semibold text-bluestone-dark font-display mb-2">
                {reason.title}
              </h3>
              <p className="text-gray-600 text-sm">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
