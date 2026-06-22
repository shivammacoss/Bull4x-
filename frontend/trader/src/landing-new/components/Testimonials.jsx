'use client'

import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Drop certificate images into /landing/img/ and reference them here.
// Leave `image` as null to render an empty placeholder slot.
const certificates = [
  { id: 1, image: '/landing/img/c1.png', alt: 'Bull4x withdrawal proof — Marcus Chen, Singapore, $24,500' },
  { id: 2, image: '/landing/img/c2.png', alt: 'Bull4x withdrawal proof — Sofia Almeida, Portugal, $18,200' },
  { id: 3, image: '/landing/img/c3.png', alt: 'Bull4x withdrawal proof — Hiroshi Tanaka, Japan, $31,800' },
  { id: 4, image: '/landing/img/c4.png', alt: 'Bull4x withdrawal proof — Aisha Khan, UAE, $15,400' },
  { id: 5, image: '/landing/img/c5.png', alt: 'Bull4x withdrawal proof — Dimitri Volkov, Estonia, $42,100' },
  { id: 6, image: '/landing/img/c6.png', alt: 'Bull4x withdrawal proof — Elena Rodriguez, Mexico, $27,650' },
];

export default function Testimonials() {
  const { ref: headerRef } = useScrollAnimation(0.1);

  return (
    <section className="bg-[#0C0C1D] py-14 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div ref={headerRef} className="scroll-reveal mb-10 md:mb-16 text-center max-w-3xl mx-auto">
          <h2
            className="font-extrabold text-white tracking-[-0.02em] font-manrope mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Real Client{' '}
            <span className="text-[#0158c6]">Withdrawals</span>
          </h2>
          <p className="text-base sm:text-lg text-[#9AA0B4] font-light">
            Real withdrawals from real Bull4x clients across 90+ countries.
          </p>
        </div>

        {/* Certificate grid — 3 cols × 2 rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="rounded-2xl bg-[#141428] border border-[rgba(255,255,255,0.08)] overflow-hidden aspect-[4/3] flex items-center justify-center hover:border-[rgba(1,88,198,0.4)] transition-colors"
            >
              {cert.image ? (
                <img
                  src={cert.image}
                  alt={cert.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="text-center text-[#6B7080] px-6">
                  <p className="text-sm font-semibold mb-1">Certificate</p>
                  <p className="text-xs">Add image at /landing/img/</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
