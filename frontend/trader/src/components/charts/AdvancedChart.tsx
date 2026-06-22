'use client';

import { useEffect, useId, useRef, memo } from 'react';
import { usePathname } from 'next/navigation';
import { useTradingStore } from '@/stores/tradingStore';
import { useUIStore } from '@/stores/uiStore';
import { toTradingViewSymbol } from '@/lib/tradingViewSymbols';

/**
 * TradingView public widget (tv.js) — embeds the free, hosted chart and lets
 * TradingView source the price feed. Symbols are translated to broker-prefixed
 * tickers (OANDA:EURUSD, COINBASE:BTCUSD, …) via `toTradingViewSymbol` so the
 * widget header shows the recognisable exchange name.
 *
 * Note: this widget does NOT render platform positions / SL-TP brackets. The
 * chart price is TradingView's own feed (OANDA et al.), so quotes here may
 * differ from the platform's BID/ASK boxes — that's expected with the public
 * embed and is the trade-off for the "OANDA" branding.
 */
let scriptPromise: Promise<void> | null = null;
function loadTvScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const w = window as unknown as { TradingView?: { widget?: unknown } };
  if (w.TradingView?.widget) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://s3.tradingview.com/tv.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load TradingView tv.js'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

function AdvancedChartInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const containerId = `tv_chart_${reactId.replace(/[:]/g, '_')}`;

  const pathname = usePathname();
  const selectedSymbol = useTradingStore((s) => s.selectedSymbol);
  const theme = useUIStore((s) => s.theme);

  const onTradingTerminal = Boolean(pathname?.startsWith('/trading/terminal'));
  const interval = onTradingTerminal ? '5' : '15';
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

    const tvSymbol = toTradingViewSymbol(symbol);
    const bg = tvTheme === 'dark' ? '#0d0d0d' : '#ffffff';

    loadTvScript()
      .then(() => {
        if (cancelled) return;
        const w = window as unknown as { TradingView?: { widget: new (cfg: unknown) => unknown } };
        if (!w.TradingView?.widget || !document.getElementById(containerId)) return;
        try {
          new w.TradingView.widget({
            autosize: true,
            symbol: tvSymbol,
            interval,
            timezone: 'Etc/UTC',
            theme: tvTheme,
            style: '1',
            locale: 'en',
            toolbar_bg: bg,
            enable_publishing: false,
            hide_top_toolbar: false,
            hide_legend: false,
            hide_side_toolbar: false,
            save_image: false,
            container_id: containerId,
            backgroundColor: bg,
            withdateranges: true,
            allow_symbol_change: false,
            details: true,
            hotlist: false,
            calendar: false,
            show_popup_button: true,
            popup_width: '1000',
            popup_height: '650',
            studies: [],
            studies_overrides: {},
            overrides: {
              'mainSeriesProperties.showPriceLine': true,
              'mainSeriesProperties.highLowAvgPrice.highLowPriceLinesVisible': true,
              'scalesProperties.showSeriesLastValue': true,
              'scalesProperties.showStudyLastValue': true,
              'paneProperties.legendProperties.showLegend': true,
              'paneProperties.legendProperties.showSeriesTitle': true,
              'paneProperties.legendProperties.showSeriesOHLC': true,
              'paneProperties.legendProperties.showBarChange': true,
              'paneProperties.background': bg,
              'paneProperties.backgroundType': 'solid',
            },
          });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[AdvancedChart] widget create failed', err);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[AdvancedChart]', err);
      });

    return () => {
      cancelled = true;
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

export default memo(AdvancedChartInner);
