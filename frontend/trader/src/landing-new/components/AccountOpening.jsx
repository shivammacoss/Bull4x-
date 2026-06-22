'use client'

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation';

const steps = [
  {
    step: '01',
    title: 'Register Your Account',
    desc: 'Set up your account in just a few minutes — name, email, a quick ID check, and you\'re in.',
  },
  {
    step: '02',
    title: 'Fund Your Account',
    desc: 'Add funds through secure payment methods, from $100, in your choice of USD, EUR, GBP, or USDT.',
  },
  {
    step: '03',
    title: 'Start Trading Live',
    desc: 'Reach 60+ global markets and start trading right away — withdraw your profits the same business day.',
  },
];

export default function AccountOpening() {
  const { ref: leftRef } = useScrollAnimation(0.1);
  const { ref: rightRef } = useScrollAnimation(0.1);
  const { ref: stepsHdr } = useScrollAnimation(0.1);
  const stepsRef = useStaggerAnimation(0.1, 120);

  return (
    <section id="account" className="bg-white py-14 md:py-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[rgba(1,88,198,0.05)] rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-6xl mx-auto">

        {/* Top: Heading + Form side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14 md:mb-24">
          {/* Left — Heading */}
          <div ref={leftRef} className="scroll-reveal-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(1,88,198,0.08)] border border-[rgba(1,88,198,0.15)] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0158c6]" />
              <span className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest">Get Started</span>
            </div>
            <h2
              className="font-manrope font-[800] tracking-[-0.02em] text-[#0D0F1A] mb-5 leading-tight"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)' }}
            >
              Open Your Account in{' '}
              <span className="text-[#0158c6]">Under 60 Seconds</span>
            </h2>
            <p className="text-base sm:text-lg text-[#6B7080] leading-relaxed font-light">
              Simple digital onboarding with instant ID verification and bank-grade security.
              No paperwork, no branch visits — 100% online.
            </p>
          </div>

          {/* Right — Form Card */}
          <div ref={rightRef} className="scroll-reveal-right bg-white border border-[#E8EAF0] rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="text-xl font-bold text-[#0D0F1A] font-manrope mb-1">Create Free Account</div>
              <div className="text-sm text-[#6B7080]">Join 12,000+ traders across 90+ countries</div>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#6B7080] mb-1.5 block">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] bg-[#FAFBFD] text-[#0D0F1A] text-sm focus:outline-none focus:border-[#0158c6] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7080] mb-1.5 block">Last Name</label>
                  <input
                    type="text"
                    placeholder="Smith"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] bg-[#FAFBFD] text-[#0D0F1A] text-sm focus:outline-none focus:border-[#0158c6] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6B7080] mb-1.5 block">Country of Residence</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] bg-[#FAFBFD] text-[#0D0F1A] text-sm focus:outline-none focus:border-[#0158c6] focus:bg-white transition-all"
                  defaultValue=""
                >
                  <option value="" disabled>Select your country</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Germany</option>
                  <option>Singapore</option>
                  <option>United Arab Emirates</option>
                  <option>Australia</option>
                  <option>Canada</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6B7080] mb-1.5 block">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="px-3 py-3 rounded-xl border border-[#E8EAF0] bg-[#FAFBFD] text-sm text-[#6B7080] font-medium">+1</div>
                  <input
                    type="tel"
                    placeholder="(000) 000 0000"
                    className="flex-1 px-4 py-3 rounded-xl border border-[#E8EAF0] bg-[#FAFBFD] text-[#0D0F1A] text-sm focus:outline-none focus:border-[#0158c6] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6B7080] mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] bg-[#FAFBFD] text-[#0D0F1A] text-sm focus:outline-none focus:border-[#0158c6] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6B7080] mb-1.5 block">Tax ID (Optional)</label>
                <input
                  type="text"
                  placeholder="For tax reporting"
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] bg-[#FAFBFD] text-[#0D0F1A] text-sm focus:outline-none focus:border-[#0158c6] focus:bg-white transition-all"
                />
              </div>

              <Link href="/auth/register"
                className="w-full py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:bg-[#0199c6] transition-all flex items-center justify-center gap-2"
              >
                Open Free Account
                <ArrowRight size={16} />
              </Link>

              <p className="text-center text-[11px] text-[#6B7080]">
                By registering, you agree to our{' '}
                <Link href="/terms" className="text-[#0158c6] hover:underline">Terms & Conditions</Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#0158c6] hover:underline">Privacy Policy</Link>
              </p>
            </form>
          </div>
        </div>

        {/* 3 Steps Section */}
        <div ref={stepsHdr} className="scroll-reveal text-center mb-12">
          <h2
            className="font-manrope font-[800] tracking-[-0.02em] text-[#0D0F1A] mb-4"
            style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)' }}
          >
            Start Trading in{' '}
            <span className="text-[#0158c6]">3 Simple Steps</span>
          </h2>
          <p className="text-base sm:text-lg text-[#6B7080] font-light">Begin your journey with Bull4x today.</p>
        </div>

        <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className="stagger-child p-6 sm:p-8 text-center flex flex-col items-center gap-4 rounded-2xl bg-white border border-[#E8EAF0] shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] transition-all"
            >
              {/* Step number */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
                  i === 2
                    ? 'bg-[#0158c6] border-[#0158c6]'
                    : 'bg-[rgba(1,88,198,0.08)] border-[rgba(1,88,198,0.15)]'
                }`}
              >
                <span
                  className={`text-2xl font-bold font-manrope ${i === 2 ? 'text-white' : 'text-[#0158c6]'}`}
                >
                  {step.step}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#0D0F1A] font-manrope">{step.title}</h3>
              <p className="text-sm text-[#6B7080] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-12 text-center">
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:bg-[#0199c6] transition-all"
          >
            Create Account Now
            <ArrowRight size={18} />
          </Link>
          <p className="text-xs text-[#6B7080] mt-3">Free demo · No credit card required · Instant activation</p>
        </div>
      </div>
    </section>
  );
}
