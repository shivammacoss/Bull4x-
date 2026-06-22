'use client'

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function TopBanner() {
  const [visible, setVisible] = useState(true);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/global-coupons/banner`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        if (d?.success && d.banner) setBanner(d.banner);
      })
      .catch(() => { /* silent — banner just stays hidden */ });
    return () => { cancelled = true; };
  }, []);

  if (!visible || !banner) return null;

  const text = banner.bannerText && banner.bannerText.trim()
    ? banner.bannerText
    : `Get ${banner.discountPercent}% bonus on all deposits${banner.firstTimeOnly ? ' (first-time users)' : ''} — use code`;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] text-white text-xs sm:text-sm font-medium"
      style={{ background: 'linear-gradient(90deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2 sm:gap-3 relative">
        <span className="text-center leading-snug">
          🎉 {text}{' '}
          <span className="inline-block bg-white text-[#0158c6] font-bold px-2 py-0.5 rounded tracking-wider">
            {banner.code}
          </span>
        </span>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-3 sm:right-4 text-white/80 hover:text-white transition-colors"
          aria-label="Close banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
