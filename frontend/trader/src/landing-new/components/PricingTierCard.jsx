'use client'

import Link from 'next/link';

const parseAmount = (s) => parseInt(String(s).replace(/[^\d]/g, ''), 10) || 0;
const formatUSD = (n) => `$${Math.round(n).toLocaleString('en-US')}`;

// Pull pricing + per-row rules straight off the live `tier` object PricingPage
// builds from the admin `/api/prop/challenges` response. `plan` is only used for
// the heading suffix ("STANDARD" / "PRO" / "ECN").
function computeMetrics(tier) {
  const fee = parseAmount(tier.price);
  return {
    originalPrice: tier.price || formatUSD(fee),
    discountedPrice: tier.discountedPrice || formatUSD(fee * 0.85),
    rules: Array.isArray(tier.rules) ? tier.rules : []
  };
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[#6B7080]">{label}</span>
      <span className="text-[#0D0F1A] font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export default function PricingTierCard({ tier, plan }) {
  const m = computeMetrics(tier);
  const registerHref = `/register?plan=${encodeURIComponent(plan)}&tier=${encodeURIComponent(tier.capital)}`;

  return (
    <div
      className={`relative rounded-2xl bg-white p-6 sm:p-7 flex flex-col transition-all ${
        tier.popular
          ? 'border-2 border-[#4dbe51] shadow-[0_8px_40px_rgba(77,190,81,0.18)]'
          : 'border border-[#E8EAF0] shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] hover:shadow-[0_8px_32px_rgba(1,88,198,0.08)]'
      }`}
    >
      {tier.popular && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[11px] font-bold px-4 py-1 rounded-full whitespace-nowrap shadow-[0_4px_12px_rgba(77,190,81,0.35)]"
          style={{ background: 'linear-gradient(135deg, #4dbe51 0%, #81ce65 100%)' }}
        >
          Most chosen
        </span>
      )}

      <h3 className="text-center text-xl sm:text-2xl font-extrabold text-[#0D0F1A] font-manrope tracking-tight mb-3">
        {tier.capital}{' '}
        <span className="text-[#6B7080] font-bold uppercase text-base sm:text-lg tracking-wide">
          {plan}
        </span>
      </h3>

      <div className="text-center">
        <span className="text-base text-[#9AA0B4] line-through mr-2 tabular-nums">
          {m.originalPrice}
        </span>
        <span
          className="text-3xl font-extrabold tracking-tight tabular-nums"
          style={{
            background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}
        >
          {m.discountedPrice}
        </span>
        <span className="text-xs text-[#6B7080] ml-1">/ One Time</span>
      </div>
      <p className="text-center text-[10px] font-bold text-[#4dbe51] uppercase tracking-widest mt-1 mb-5">
        With code BULL15
      </p>

      <div className="border-t border-[#E8EAF0] pt-4 space-y-2.5 text-sm mb-6">
        {m.rules.map((r) => (
          <Row key={r.key} label={r.key} value={r.value} />
        ))}
      </div>

      <div className="mt-auto space-y-2">
        <Link href="/challenges"
          className="w-full block text-center py-2.5 rounded-full border border-[#E8EAF0] text-[#0D0F1A] font-semibold text-sm hover:border-[#0158c6] hover:text-[#0158c6] transition-all"
        >
          Account Details
        </Link>
        <Link href={registerHref}
          className="w-full block text-center py-2.5 rounded-full text-white font-semibold text-sm hover:-translate-y-0.5 transition-all shadow-[0_4px_12px_rgba(1,88,198,0.25)] hover:shadow-[0_8px_24px_rgba(77,190,81,0.4)]"
          style={{ background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
        >
          Open Account
        </Link>
      </div>
    </div>
  );
}
