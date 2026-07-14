'use client';

import { useEffect, useId, useRef, memo } from 'react';
import { usePathname } from 'next/navigation';
import { useTradingStore } from '@/stores/tradingStore';
import { useUIStore } from '@/stores/uiStore';
import { bull4xDatafeed } from '@/lib/charting/datafeed';

/**
 * Self-hosted TradingView Charting Library chart — branded "Bull4x" and fed by
 * the platform's OWN price data (bull4xDatafeed: real backend bars + live WS
 * ticks), instead of the public OANDA embed widget (AdvancedChart).
 *
 * Library assets are served from /charting_library/ (public/charting_library).
 * This is the licensed Advanced Charts build, so the exchange label, feed and
 * branding are fully under our control.
 */
let libPromise: Promise<void> | null = null;
function loadChartingLibrary(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const w = window as unknown as { TradingView?: { widget?: unknown } };
  if (w.TradingView?.widget) return Promise.resolve();
  if (libPromise) return libPromise;
  libPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = '/charting_library/charting_library.standalone.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Bull4x charting library'));
    document.head.appendChild(s);
  });
  return libPromise;
}

function TVChartContainerInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const containerId = `bull4x_chart_${reactId.replace(/[:]/g, '_')}`;
  const widgetRef = useRef<{ remove?: () => void } | null>(null);

  const pathname = usePathname();
  const selectedSymbol = useTradingStore((s) => s.selectedSymbol);
  const theme = useUIStore((s) => s.theme);

  const onTerminal = Boolean(pathname?.startsWith('/trading/terminal'));
  const interval = onTerminal ? '5' : '15';
  const tvTheme: 'dark' | 'light' = theme === 'light' ? 'light' : 'dark';
  const symbol = selectedSymbol || 'XAUUSD';

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = '';
    const inner = document.createElement('div');
    inner.id = containerId;
    inner.style.width = '100%';
    inner.style.height = '100%';
    el.appendChild(inner);

    const bg = tvTheme === 'dark' ? '#0d0d0d' : '#ffffff';

    loadChartingLibrary()
      .then(() => {
        if (cancelled) return;
        const w = window as unknown as {
          TradingView?: { widget: new (cfg: unknown) => { remove?: () => void } };
        };
        if (!w.TradingView?.widget || !document.getElementById(containerId)) return;
        try {
          widgetRef.current = new w.TradingView.widget({
            symbol,
            interval,
            container: inner,
            library_path: '/charting_library/',
            datafeed: bull4xDatafeed,
            locale: 'en',
            theme: tvTheme,
            autosize: true,
            timezone: 'Etc/UTC',
            fullscreen: false,
            debug: false,
            // Users pick symbols from the platform's MARKETS panel, and we don't
            // want per-browser chart settings drift — keep the chart focused.
            disabled_features: [
              'use_localstorage_for_settings',
              'header_symbol_search',
              'symbol_search_hot_key',
            ],
            enabled_features: [],
            overrides: {
              'paneProperties.background': bg,
              'paneProperties.backgroundType': 'solid',
              'mainSeriesProperties.showPriceLine': true,
            },
          });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[TVChartContainer] widget create failed', err);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[TVChartContainer]', err);
      });

    return () => {
      cancelled = true;
      try {
        widgetRef.current?.remove?.();
      } catch {
        /* ignore */
      }
      widgetRef.current = null;
      if (el) el.innerHTML = '';
    };
  }, [symbol, interval, tvTheme, containerId]);

  const surface = tvTheme === 'light' ? 'bg-bg-base' : 'bg-[#0d0d0d]';

  return (
    <div className={`relative w-full h-full min-h-[200px] min-w-0 ${surface}`}>
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
        onWheel={(e) => e.stopPropagation()}
        data-tv-chart-root
      />
    </div>
  );
}

export default memo(TVChartContainerInner);
