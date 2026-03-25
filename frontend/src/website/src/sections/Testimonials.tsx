import { useEffect, useRef, useState } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Professional Forex Trader',
    location: 'United Kingdom',
    avatar: '/avatar-1.jpg',
    rating: 5,
    quote: "Unicap's execution speed is unmatched. I've seen my win rate improve significantly since switching. The tight spreads and reliable platform make all the difference in my scalping strategy.",
  },
  {
    name: 'Marcus Chen',
    role: 'Day Trader',
    location: 'Singapore',
    avatar: '/avatar-2.jpg',
    rating: 5,
    quote: "The customer support team is exceptional. They're available 24/7 and actually understand trading. When I had an issue with a trade, it was resolved within minutes, not hours.",
  },
  {
    name: 'Elena Rodriguez',
    role: 'Swing Trader',
    location: 'Spain',
    avatar: '/avatar-3.jpg',
    rating: 5,
    quote: "After trying multiple brokers, Unicap stands out for transparency. No hidden fees, no requotes, just honest trading conditions. My account manager is always there when I need guidance.",
  },
  {
    name: 'David Thompson',
    role: 'Algorithmic Trader',
    location: 'United States',
    avatar: '/avatar-4.jpg',
    rating: 5,
    quote: "The API integration is rock-solid. I run multiple EAs on MT4 and MT5 without any issues. The low latency execution is crucial for my automated strategies, and Unicap delivers.",
  },
];

// Duplicate testimonials for seamless loop
const duplicatedTestimonials = [...testimonials, ...testimonials];

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <div className="flex-shrink-0 w-[400px] mx-4">
      <div className="glass-strong rounded-3xl p-8 h-full card-hover-lift">
        {/* Quote Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 animate-float">
          <Quote className="w-6 h-6 text-white" />
        </div>

        {/* Stars */}
        <div className="flex gap-1 mb-6">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star
              key={i}
              className="w-5 h-5 text-yellow-400 fill-yellow-400"
            />
          ))}
        </div>

        {/* Quote */}
        <blockquote className="text-lg text-white/90 leading-relaxed mb-8 font-light">
          "{testimonial.quote}"
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-4">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/30"
          />
          <div>
            <div className="text-white font-semibold font-display">
              {testimonial.name}
            </div>
            <div className="text-white/60 text-sm">
              {testimonial.role} • {testimonial.location}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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

  // Auto-scroll animation
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !isVisible) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame

    const animate = () => {
      if (!isPaused) {
        scrollPosition += scrollSpeed;
        
        // Reset when we've scrolled through half (original set)
        const maxScroll = scrollContainer.scrollWidth / 2;
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isVisible, isPaused]);

  return (
    <section
      ref={sectionRef}
      className="relative section-padding bg-bluestone-dark overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-orb-1" />
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
            Testimonials
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
            Trusted by Traders Worldwide
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
            Hear from our community of traders who have chosen Unicap as their trusted broker.
          </p>
        </div>

        {/* Testimonials Auto-Scroll Container */}
        <div
          className={`relative transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
          style={{ 
            transitionDelay: '300ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-bluestone-dark to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-bluestone-dark to-transparent z-10 pointer-events-none" />

          {/* Scrolling Container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-hidden py-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <TestimonialCard key={`${testimonial.name}-${index}`} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {/* Avatar Grid (Desktop) */}
        <div
          className={`hidden lg:flex justify-center gap-4 mt-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
          style={{ 
            transitionDelay: '500ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="relative group cursor-pointer"
            >
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-all duration-400 group-hover:scale-110"
              />
              <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-blue-500 rounded-full -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
