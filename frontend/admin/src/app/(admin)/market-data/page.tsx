'use client';

import { useEffect, useState } from 'react';
import { Activity, Copy, Check, RefreshCw } from 'lucide-react';

/** Binance-style kline: [open_time_ms, open, high, low, close, volume] */
type KlineRow = [number, number, number, number, number, number];

const INTERVALS = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'] as const;
type Interval = (typeof INTERVALS)[number];

const COMMON_SYMBOLS = [
  'BTCUSD', 'ETHUSD', 'XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY',
  'LTCUSD', 'XRPUSD', 'SOLUSD', 'XAGUSD',
];

function fmt(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function fmtTime(ms: number): string {
  return new Date(ms).toLocaleString('en-US', {
    year: '2-digit', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function MarketDataPage() {
  const [symbol, setSymbol] = useState('BTCUSD');
  const [interval, setInterval] = useState<Interval>('5m');
  const [limit, setLimit] = useState(50);
  const [klines, setKlines] = useState<KlineRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Klines lives on the gateway (public market data), not the admin API.
  // Prefer NEXT_PUBLIC_GATEWAY_URL (direct call) and fall back to same-origin
  // /api/v1/... so the reverse proxy in production routes correctly.
  const gatewayBase = (process.env.NEXT_PUBLIC_GATEWAY_URL || '').replace(/\/$/, '');
  const apiRoot = gatewayBase ? `${gatewayBase}/api/v1` : '/api/v1';
  const sampleUrl = `${apiRoot}/instruments/${symbol}/klines?interval=${interval}&limit=${limit}`;

  const fetchKlines = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(sampleUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) {
        setError('Unexpected response shape (expected array of arrays)');
        setKlines([]);
        return;
      }
      setKlines(data as KlineRow[]);
    } catch (e: any) {
      setError(e?.message || 'Failed to load klines');
      setKlines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKlines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(klines, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
          <Activity size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Market Data — Klines API</h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            Preview OHLCV candle data in Binance-klines format. Public endpoint for third-party integrations.
          </p>
        </div>
      </div>

      {/* Endpoint reference */}
      <div className="rounded-xl border border-border-primary bg-bg-secondary p-4 space-y-3">
        <div>
          <p className="text-xxs text-text-tertiary uppercase tracking-wide font-semibold mb-1">Public Endpoint (no auth)</p>
          <code className="block text-xs font-mono text-accent bg-bg-tertiary px-3 py-2 rounded break-all">
            GET /api/v1/instruments/{'{symbol}'}/klines?interval={'{interval}'}&amp;limit={'{limit}'}
          </code>
          <p className="text-[10px] text-text-tertiary mt-1">For quick previews / public consumers. No headers required.</p>
        </div>
        <div>
          <p className="text-xxs text-text-tertiary uppercase tracking-wide font-semibold mb-1">Algo Connect Endpoint (X-Api-Key + X-Api-Secret)</p>
          <code className="block text-xs font-mono text-accent bg-bg-tertiary px-3 py-2 rounded break-all">
            GET /api/algo/klines?symbol={'{symbol}'}&amp;interval={'{interval}'}&amp;limit={'{limit}'}
          </code>
          <p className="text-[10px] text-text-tertiary mt-1">
            Same data, requires algo API key (same credentials as /api/algo/trade). Use this for production bots.
          </p>
        </div>
        <div className="pt-2 border-t border-border-primary">
          <p className="text-xxs text-text-tertiary">
            Response format: array of arrays — each row is
            <code className="ml-1 px-1 py-0.5 rounded bg-bg-tertiary text-accent">[open_time_ms, open, high, low, close, volume]</code>
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-border-primary bg-bg-secondary p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xxs text-text-tertiary uppercase tracking-wide font-semibold mb-1">Symbol</label>
            <div className="flex gap-1">
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="BTCUSD"
                className="flex-1 px-3 py-2 rounded border border-border-primary bg-bg-tertiary text-sm font-mono text-text-primary outline-none focus:border-accent/50"
              />
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {COMMON_SYMBOLS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSymbol(s)}
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                    symbol === s
                      ? 'bg-accent text-black font-semibold'
                      : 'bg-bg-tertiary text-text-tertiary hover:text-text-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xxs text-text-tertiary uppercase tracking-wide font-semibold mb-1">Interval</label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value as Interval)}
              className="w-full px-3 py-2 rounded border border-border-primary bg-bg-tertiary text-sm font-mono text-text-primary outline-none focus:border-accent/50"
            >
              {INTERVALS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xxs text-text-tertiary uppercase tracking-wide font-semibold mb-1">Limit</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={limit}
              onChange={(e) => setLimit(Math.max(1, Math.min(1000, Number(e.target.value) || 50)))}
              className="w-full px-3 py-2 rounded border border-border-primary bg-bg-tertiary text-sm font-mono text-text-primary outline-none focus:border-accent/50"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchKlines}
              disabled={loading}
              className="w-full px-4 py-2 rounded bg-accent text-black font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Loading…' : 'Fetch'}
            </button>
          </div>
        </div>

        {/* Sample URL for the user to share with friend */}
        <div className="pt-2 border-t border-border-primary">
          <p className="text-xxs text-text-tertiary uppercase tracking-wide font-semibold mb-1">Shareable URL</p>
          <code className="block text-xs font-mono text-text-secondary bg-bg-tertiary px-3 py-2 rounded break-all">
            {sampleUrl}
          </code>
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</div>
      )}

      {!error && klines.length > 0 && (
        <div className="rounded-xl border border-border-primary bg-bg-secondary overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Candles ({klines.length})</h2>
              <p className="text-xxs text-text-tertiary mt-0.5">
                {symbol} · {interval} · most recent {klines.length} bars
              </p>
            </div>
            <button
              onClick={copyJson}
              className="px-3 py-1.5 text-xs font-semibold rounded border border-border-primary bg-bg-tertiary text-text-secondary hover:text-text-primary inline-flex items-center gap-1.5"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
          </div>

          {/* Table view */}
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-bg-tertiary/60 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-text-tertiary uppercase text-xxs">Open Time (UTC)</th>
                  <th className="text-right px-3 py-2 font-semibold text-text-tertiary uppercase text-xxs">Open</th>
                  <th className="text-right px-3 py-2 font-semibold text-text-tertiary uppercase text-xxs">High</th>
                  <th className="text-right px-3 py-2 font-semibold text-text-tertiary uppercase text-xxs">Low</th>
                  <th className="text-right px-3 py-2 font-semibold text-text-tertiary uppercase text-xxs">Close</th>
                  <th className="text-right px-3 py-2 font-semibold text-text-tertiary uppercase text-xxs">Volume</th>
                </tr>
              </thead>
              <tbody>
                {klines.map((row) => {
                  const [t, o, h, l, c, v] = row;
                  const up = c >= o;
                  return (
                    <tr key={t} className="border-t border-border-primary/40 hover:bg-bg-hover/40">
                      <td className="px-3 py-1.5 text-text-secondary font-mono text-xxs">{fmtTime(t)}</td>
                      <td className="px-3 py-1.5 text-right text-text-primary font-mono">{fmt(o)}</td>
                      <td className="px-3 py-1.5 text-right text-buy font-mono">{fmt(h)}</td>
                      <td className="px-3 py-1.5 text-right text-sell font-mono">{fmt(l)}</td>
                      <td className={`px-3 py-1.5 text-right font-mono font-semibold ${up ? 'text-buy' : 'text-sell'}`}>
                        {fmt(c)}
                      </td>
                      <td className="px-3 py-1.5 text-right text-text-tertiary font-mono">{fmt(v, 4)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Raw JSON preview */}
          <div className="border-t border-border-primary">
            <details className="group">
              <summary className="px-4 py-2 text-xs font-semibold text-text-secondary cursor-pointer hover:text-text-primary select-none">
                Raw JSON ({klines.length} candles) — click to expand
              </summary>
              <pre className="px-4 py-3 text-xxs font-mono text-text-tertiary bg-bg-tertiary/40 overflow-auto max-h-[400px] whitespace-pre-wrap break-all">
{JSON.stringify(klines.slice(0, 20), null, 2)}{klines.length > 20 ? `\n\n... ${klines.length - 20} more candles` : ''}
              </pre>
            </details>
          </div>
        </div>
      )}

      {!loading && !error && klines.length === 0 && (
        <div className="rounded-xl border border-border-primary bg-bg-secondary p-8 text-center text-sm text-text-tertiary">
          No candle data for this symbol/interval yet.
        </div>
      )}
    </div>
  );
}
