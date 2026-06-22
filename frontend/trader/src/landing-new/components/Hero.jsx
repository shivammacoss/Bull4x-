'use client'

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { BlurFade } from './BlurFade';
import PixelBlast from './PixelBlast';

const SUB_TEXT =
  'Stay ahead of the markets with fast execution, tight spreads, and trading tools you can actually rely on — built for traders who take it seriously. Every order filled with precision and confidence.';

const TypingSubheading = memo(function TypingSubheading() {
  const [displayed, setDisplayed] = useState(SUB_TEXT);
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const loop = async () => {
      while (!cancelled) {
        await sleep(3500);
        if (cancelled) return;
        for (let i = SUB_TEXT.length; i >= 0; i--) {
          if (cancelled) return;
          setDisplayed(SUB_TEXT.slice(0, i));
          await sleep(15);
        }
        await sleep(400);
        if (cancelled) return;
        for (let i = 0; i <= SUB_TEXT.length; i++) {
          if (cancelled) return;
          setDisplayed(SUB_TEXT.slice(0, i));
          await sleep(25);
        }
      }
    };

    loop();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCursorOn((c) => !c), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <p
      className="text-sm sm:text-base text-[#6B7080] max-w-3xl mx-auto mb-10 leading-relaxed text-center"
      style={{ minHeight: '5rem' }}
    >
      {displayed}
      <span
        aria-hidden="true"
        className="inline-block align-middle ml-[2px]"
        style={{
          width: '2px',
          height: '1em',
          background: '#0199c6',
          opacity: cursorOn ? 1 : 0,
          transition: 'opacity 0.08s linear',
        }}
      />
    </p>
  );
});

const initialTickers = [
  { symbol: 'EUR/USD', base: 1.0847,  decimals: 4 },
  { symbol: 'GBP/USD', base: 1.2691,  decimals: 4 },
  { symbol: 'USD/JPY', base: 156.42,  decimals: 2 },
  { symbol: 'AUD/USD', base: 0.6612,  decimals: 4 },
  { symbol: 'USD/CHF', base: 0.9087,  decimals: 4 },
  { symbol: 'USD/CAD', base: 1.3724,  decimals: 4 },
  { symbol: 'XAU/USD', base: 2386.50, decimals: 2 },
  { symbol: 'BTC/USD', base: 71420,   decimals: 0 },
];

function generateTick(ticker) {
  const volatility = ticker.base > 1000 ? 0.002 : 0.008;
  const move = (Math.random() - 0.48) * volatility * ticker.base;
  const price = ticker.base + move;
  const change = ((move / ticker.base) * 100);
  const d = ticker.decimals != null ? ticker.decimals : 2;
  return {
    symbol: ticker.symbol,
    price: price.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }),
    change: (change >= 0 ? '+' : '') + change.toFixed(2) + '%',
    up: change >= 0,
  };
}

// SSR-stable initial values — no Math.random on first render
const staticInitialTickers = initialTickers.map((t) => {
  const d = t.decimals != null ? t.decimals : 2;
  return {
    symbol: t.symbol,
    price: t.base.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }),
    change: '+0.00%',
    up: true,
  };
});

const LiveTicker = memo(function LiveTicker() {
  const tickerRef = useRef(null);
  const duplicated = useRef(false);
  const [tickers, setTickers] = useState(staticInitialTickers);

  const updatePrices = useCallback(() => {
    setTickers(initialTickers.map((t) => {
      t.base += (Math.random() - 0.48) * t.base * 0.0003;
      return generateTick(t);
    }));
  }, []);

  useEffect(() => {
    // First random update right after mount (client-only — no hydration mismatch)
    updatePrices();
    const interval = setInterval(updatePrices, 4000);
    return () => clearInterval(interval);
  }, [updatePrices]);

  useEffect(() => {
    const el = tickerRef.current;
    if (!el || duplicated.current) return;
    duplicated.current = true;
    const clone = el.innerHTML;
    el.innerHTML = clone + clone;
  }, []);

  return (
    <div className="border-y border-[#E8EAF0] bg-[#FAFBFD] overflow-hidden py-3">
      <div
        ref={tickerRef}
        className="flex gap-8 whitespace-nowrap w-max"
        style={{ animation: 'marquee-smooth 60s linear infinite' }}
      >
        {tickers.map((t, i) => (
          <div key={i} className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-bold text-[#0D0F1A]">{t.symbol}</span>
            <span className="text-xs text-[#6B7080] tabular-nums transition-all duration-500">{t.price}</span>
            <span className={`flex items-center gap-0.5 text-xs font-semibold tabular-nums transition-colors duration-500 ${t.up ? 'text-emerald-500' : 'text-red-500'}`}>
              {t.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {t.change}
            </span>
            <span className="text-[#E8EAF0] ml-2">|</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-white">

      {/* ── PixelBlast animated dots background (brand color, 70% opacity) ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.7 }}
      >
        <PixelBlast
          variant="circle"
          pixelSize={12}
          color="#0199c6"
          patternScale={3}
          patternDensity={1.1}
          pixelSizeJitter={0.4}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.4}
          speed={0.5}
          edgeFade={0.3}
          transparent
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 70% at 50% 50%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 25%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 85%)',
        }}
      />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-14 md:pt-44 md:pb-28 text-center relative">

        <BlurFade delay={0.1} inView>
          <p
            className="text-sm font-semibold uppercase tracking-widest mb-6"
            style={{
              background: 'linear-gradient(90deg, #0158c6 0%, #0199c6 50%, #4dbe51 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            Trade Forex with Confidence
          </p>
        </BlurFade>

        <BlurFade delay={0.3} inView yOffset={12} blur="8px" duration={0.6}>
          <h1
            className="text-[#0D0F1A] mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }}
          >
            Trade with Clarity.
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              Trade with Bull4x.
            </span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.55} inView>
          <TypingSubheading />
        </BlurFade>

        <BlurFade delay={0.75} inView>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/our-accounts"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
            >
              Open Account
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-[#4dbe51] text-[#4dbe51] font-semibold text-sm hover:bg-[#4dbe51] hover:text-white hover:shadow-[0_6px_20px_rgba(77,190,81,0.32)] transition-all"
            >
              Free Demo
            </Link>
          </div>
        </BlurFade>

      </div>

      <LiveTicker />

      <style>{`
        @keyframes marquee-smooth {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
