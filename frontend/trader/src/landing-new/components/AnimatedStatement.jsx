'use client'

import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Wallet,
  Zap,
} from 'lucide-react';

/* ── Inline word "chip" — text + tinted icon badge ────────────────────────── */
function Chip({ children, color, bg, Icon }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 align-baseline font-extrabold"
      style={{ color }}
    >
      {children}
      <span
        className="inline-flex items-center justify-center rounded-md p-1 align-middle"
        style={{ background: bg, color }}
      >
        <Icon size={14} strokeWidth={2.5} />
      </span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
export default function AnimatedStatement() {
  return (
    <section
      className="py-20 md:py-32 px-6 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #f8fbff 0%, #f3f9ff 30%, #f4fbf3 65%, #fafffb 100%)',
      }}
    >
      {/* Soft brand color blobs (mesh-style) */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div
          className="absolute"
          style={{
            top: '-20%',
            left: '-10%',
            width: '50%',
            height: '70%',
            background:
              'radial-gradient(closest-side, rgba(1,88,198,0.15) 0%, rgba(1,88,198,0) 70%)',
            filter: 'blur(28px)',
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: '-15%',
            right: '-10%',
            width: '55%',
            height: '70%',
            background:
              'radial-gradient(closest-side, rgba(77,190,81,0.18) 0%, rgba(77,190,81,0) 70%)',
            filter: 'blur(30px)',
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative">
        <p
          className="text-xs sm:text-sm font-semibold uppercase tracking-widest mb-6 inline-flex items-center gap-2"
          style={{ color: '#0158c6' }}
        >
          <ArrowRight size={14} /> Our Promise
        </p>

        <h2
          className="text-[#0D0F1A] font-manrope leading-tight"
          style={{
            fontSize: 'clamp(1.6rem, 3.8vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}
        >
          <span className="text-[#0D0F1A]">We give </span>
          <Chip color="#0158c6" bg="rgba(1,88,198,0.12)" Icon={TrendingUp}>
            global traders
          </Chip>
          <span className="text-[#0D0F1A]"> access to </span>
          <Chip color="#0199c6" bg="rgba(1,153,198,0.12)" Icon={CheckCircle2}>
            tight spreads
          </Chip>
          <span className="text-[#9AA0B4]">, </span>
          <Chip color="#4dbe51" bg="rgba(77,190,81,0.14)" Icon={ShieldCheck}>
            regulated safety
          </Chip>
          <span className="text-[#9AA0B4]">, and </span>
          <Chip color="#81ce65" bg="rgba(129,206,101,0.18)" Icon={Wallet}>
            fast withdrawals
          </Chip>
          <span className="text-[#0D0F1A]"> — so they can </span>
          <Chip color="#0158c6" bg="rgba(1,88,198,0.12)" Icon={Zap}>
            trade with confidence
          </Chip>
          <span className="text-[#0D0F1A]"> on a platform built for serious execution. </span>
          <span
            style={{
              background:
                'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            That's our promise.
          </span>
        </h2>
      </div>
    </section>
  );
}
