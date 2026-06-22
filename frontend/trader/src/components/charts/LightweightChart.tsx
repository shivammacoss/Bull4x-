'use client';

import { useEffect, useMemo, useRef, useState, memo } from 'react';
import { clsx } from 'clsx';
import { createChart, type IChartApi, type ISeriesApi, type Time } from 'lightweight-charts';
import { useTradingStore } from '@/stores/tradingStore';
import { useUIStore } from '@/stores/uiStore';
import { api } from '@/lib/api/client';

/**
 * Platform price chart — candlestick chart powered by lightweight-charts,
 * fed exclusively by the platform's OWN bid feed so the chart prices match
 * the buy/sell quote box exactly.
 *
 * Why not the public TradingView widget anymore: it pulls Coinbase/OANDA
 * raw exchange prices, which differ from the platform's quoted prices
 * (different liquidity, different spread, different markup). Users were
 * confused when the chart showed 80,797 while the SELL box showed 80,810.
 *
 * Data flow:
 *   1. Initial: GET /instruments/{symbol}/bars?resolution={tf} → seed bars
 *   2. Live  : tradingStore.prices[symbol] subscription → update latest
 *      bar's close/high/low using BID (BUY positions close at bid; mirrors
 *      MT5 default chart side).
 */

type Tf = '1' | '5' | '15' | '30' | '60' | '240' | 'D';

const TF_TO_SECONDS: Record<Tf, number> = {
  '1': 60,
  '5': 300,
  '15': 900,
  '30': 1800,
  '60': 3600,
  '240': 14400,
  'D': 86400,
};

const TF_LABEL: Record<Tf, string> = {
  '1': '1m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '60': '1h',
  '240': '4h',
  'D': '1D',
};

interface BarRow {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

function alignBarTime(epochSec: number, tfSec: number): number {
  return Math.floor(epochSec / tfSec) * tfSec;
}

function LightweightChartInner() {
  const selectedSymbol = useTradingStore((s) => s.selectedSymbol);
  const tick = useTradingStore((s) => (selectedSymbol ? s.prices[selectedSymbol] : undefined));
  const theme = useUIStore((s) => s.theme);

  const [tf, setTf] = useState<Tf>('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lastBarRef = useRef<BarRow | null>(null);
  const tfSecRef = useRef<number>(TF_TO_SECONDS[tf]);

  // ---- Build chart once per theme/tf change ----
  useEffect(() => {
    if (!containerRef.current) return;

    const isLight = theme === 'light';
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: isLight ? '#ffffff' : '#0e0e0e' },
        textColor: isLight ? '#111827' : '#d1d4dc',
      },
      grid: {
        vertLines: { color: isLight ? '#e5e7eb' : '#1f2937' },
        horzLines: { color: isLight ? '#e5e7eb' : '#1f2937' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: isLight ? '#d1d5db' : '#374151',
      },
      rightPriceScale: {
        borderColor: isLight ? '#d1d5db' : '#374151',
      },
      crosshair: {
        mode: 1, // normal
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    const series = chart.addCandlestickSeries({
      upColor: '#16a34a',
      downColor: '#ef4444',
      borderUpColor: '#16a34a',
      borderDownColor: '#ef4444',
      wickUpColor: '#16a34a',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;
    lastBarRef.current = null;
    tfSecRef.current = TF_TO_SECONDS[tf];

    // Resize observer — chart fills its container
    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      lastBarRef.current = null;
    };
  }, [theme, tf]);

  // ---- Fetch initial bars whenever symbol or timeframe changes ----
  useEffect(() => {
    if (!selectedSymbol || !seriesRef.current) return;

    let cancelled = false;
    const tfSec = TF_TO_SECONDS[tf];
    const now = Math.floor(Date.now() / 1000);
    const fromTime = now - tfSec * 500; // ~500 bars back

    setLoading(true);
    setError(null);

    api
      .get<BarRow[]>(`/instruments/${selectedSymbol}/bars?resolution=${tf}&from=${fromTime}&to=${now}`)
      .then((bars) => {
        if (cancelled || !seriesRef.current) return;
        if (!Array.isArray(bars) || bars.length === 0) {
          setError('No price history yet');
          seriesRef.current.setData([]);
          lastBarRef.current = null;
          return;
        }
        const sorted = [...bars].sort((a, b) => a.time - b.time);
        const seriesData = sorted.map((b) => ({
          time: b.time as Time,
          open: b.open,
          high: b.high,
          low: b.low,
          close: b.close,
        }));
        seriesRef.current.setData(seriesData);
        lastBarRef.current = sorted[sorted.length - 1];
        chartRef.current?.timeScale().fitContent();
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message || 'Failed to load chart');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSymbol, tf]);

  // ---- Live tick: update / rotate the rightmost bar using BID ----
  useEffect(() => {
    if (!seriesRef.current || !tick) return;
    const price = Number(tick.bid);
    if (!Number.isFinite(price) || price <= 0) return;

    const tfSec = tfSecRef.current;
    const nowSec = Math.floor(Date.now() / 1000);
    const aligned = alignBarTime(nowSec, tfSec);
    const last = lastBarRef.current;

    if (last && last.time === aligned) {
      // Same bar — extend high/low/close
      const updated: BarRow = {
        time: last.time,
        open: last.open,
        high: Math.max(last.high, price),
        low: Math.min(last.low, price),
        close: price,
      };
      lastBarRef.current = updated;
      seriesRef.current.update({
        time: updated.time as Time,
        open: updated.open,
        high: updated.high,
        low: updated.low,
        close: updated.close,
      });
    } else {
      // New bar — open at last close (or current price if no last)
      const openPrice = last ? last.close : price;
      const newBar: BarRow = {
        time: aligned,
        open: openPrice,
        high: Math.max(openPrice, price),
        low: Math.min(openPrice, price),
        close: price,
      };
      lastBarRef.current = newBar;
      seriesRef.current.update({
        time: newBar.time as Time,
        open: newBar.open,
        high: newBar.high,
        low: newBar.low,
        close: newBar.close,
      });
    }
  }, [tick]);

  const surface = theme === 'light' ? 'bg-bg-base' : 'bg-[#0e0e0e]';
  const tfButtons: Tf[] = useMemo(() => ['1', '5', '15', '30', '60', '240', 'D'], []);

  return (
    <div className={clsx('relative w-full h-full min-h-[200px] min-w-0 flex flex-col', surface)} data-tv-chart-root>
      {/* Top bar — symbol + timeframe selector + live BID/ASK */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border-glass flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-text-primary">{selectedSymbol || '—'}</span>
          {tick && (
            <span className="text-[10px] text-text-tertiary font-mono">
              <span className="text-sell">{Number(tick.bid).toFixed(2)}</span>
              {' / '}
              <span className="text-buy">{Number(tick.ask).toFixed(2)}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {tfButtons.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTf(t)}
              className={clsx(
                'px-2 py-0.5 rounded text-[10px] font-semibold transition-fast',
                tf === t
                  ? 'bg-accent text-black'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-bg-hover',
              )}
            >
              {TF_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart canvas */}
      <div className="relative flex-1 min-h-0">
        <div ref={containerRef} className="absolute inset-0" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-text-tertiary text-xs pointer-events-none">
            Loading chart…
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-text-tertiary text-xs pointer-events-none">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(LightweightChartInner);
