'use client'

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation';
import ContactFormModal from './ContactFormModal';

const experts = [
  {
    name: 'Marcus Chen',
    role: 'Forex Day Trader',
    avatar: 'MC',
    followers: '48.2K',
    rating: 4.9,
    color: 'bg-blue-600',
  },
  {
    name: 'Sofia Almeida',
    role: 'Algo & EA Specialist',
    avatar: 'SA',
    followers: '31.7K',
    rating: 4.8,
    color: 'bg-violet-600',
  },
  {
    name: 'Hiroshi Tanaka',
    role: 'JPY Pairs & Indices',
    avatar: 'HT',
    followers: '22.5K',
    rating: 4.7,
    color: 'bg-amber-600',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Gold & Commodities Trader',
    avatar: 'ER',
    followers: '19.3K',
    rating: 4.9,
    color: 'bg-emerald-600',
  },
];

export default function Community() {
  const { ref: headerRef } = useScrollAnimation();
  const cardsRef = useStaggerAnimation(0.08, 90);
  const [modalExpert, setModalExpert] = useState(null);

  return (
    <section className="bg-white py-24 px-6 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-[rgba(1,88,198,0.04)] rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="scroll-reveal mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(1,88,198,0.08)] border border-[rgba(1,88,198,0.15)] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0158c6]" />
            <span className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest">Community</span>
          </div>
          <h2
            className="font-manrope font-[800] tracking-[-0.02em] text-[#0D0F1A] mb-4"
            style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)' }}
          >
            Learn from Top Trading{' '}
            <span className="text-[#0158c6]">Experts</span>
          </h2>
          <p className="text-base sm:text-lg text-[#6B7080] font-light">
            Join a growing community of professional traders and financial educators who trust our platform.
          </p>
        </div>

        {/* Expert Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experts.map((expert) => (
            <div
              key={expert.name}
              className="stagger-child group p-6 flex flex-col gap-4 rounded-2xl bg-white border border-[#E8EAF0] shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] transition-all"
            >
              {/* Avatar & Name */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full ${expert.color} flex items-center justify-center text-white font-bold text-sm font-manrope shrink-0`}
                >
                  {expert.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0D0F1A] font-manrope">{expert.name}</div>
                  <div className="text-xs text-[#6B7080]">{expert.role}</div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i < Math.floor(expert.rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-[#E8EAF0] fill-[#E8EAF0]'
                    }
                  />
                ))}
                <span className="text-xs text-[#6B7080] ml-1">{expert.rating}</span>
              </div>

              {/* Followers */}
              <div className="text-xs text-[#6B7080]">
                <span className="font-bold text-[#0D0F1A]">{expert.followers}</span> followers
              </div>

              {/* Follow Button */}
              <button
                type="button"
                onClick={() => setModalExpert(expert)}
                className="w-full py-2 rounded-full border border-[rgba(1,88,198,0.2)] text-[#0158c6] text-xs font-bold uppercase tracking-wider hover:bg-[#0158c6] hover:text-white transition-all group-hover:border-[#0158c6]"
              >
                Follow Expert
              </button>
            </div>
          ))}
        </div>
      </div>

      <ContactFormModal
        isOpen={!!modalExpert}
        onClose={() => setModalExpert(null)}
        title={modalExpert ? `Follow ${modalExpert.name}` : 'Follow Expert'}
        subject={modalExpert ? `Follow request — ${modalExpert.name} (${modalExpert.role})` : ''}
      />
    </section>
  );
}
