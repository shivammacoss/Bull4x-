'use client';

import { clsx } from 'clsx';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import type { FxRate } from '@/hooks/useFxRate';

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const RATE_FORMATTER = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

/** "≈ ₹4,172.50" inline conversion shown below the USD amount input.
 *  Renders nothing when there's no rate yet or the amount is empty / 0. */
export function InrConversion({
  usdAmount,
  rate,
  className,
}: {
  usdAmount: string;
  rate: FxRate | null;
  className?: string;
}) {
  if (!rate) return null;
  const usd = parseFloat(usdAmount);
  if (!Number.isFinite(usd) || usd <= 0) return null;
  const r = parseFloat(rate.rate);
  if (!Number.isFinite(r) || r <= 0) return null;
  const inr = usd * r;
  return (
    <div
      className={clsx(
        'text-xs sm:text-sm text-text-secondary flex items-center gap-1.5 mt-1.5',
        className,
      )}
    >
      <span className="text-text-tertiary">≈</span>
      <span className="font-mono font-bold text-accent">{INR_FORMATTER.format(inr)}</span>
      {rate.stale ? (
        <span
          className="inline-flex items-center gap-0.5 text-[10px] text-warning"
          title="Live FX provider unreachable — using last-known rate"
        >
          <AlertTriangle className="w-3 h-3" />
          stale
        </span>
      ) : null}
    </div>
  );
}

/** Header pill: "1 USD ≈ ₹83.45 · Live" — sits at the top of the UPI section
 *  so the user sees the rate even before typing an amount. */
export function FxRateBadge({
  rate,
  loading,
  onRefresh,
  className,
}: {
  rate: FxRate | null;
  loading: boolean;
  onRefresh?: () => void | Promise<void>;
  className?: string;
}) {
  if (!rate && !loading) return null;
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] sm:text-xs font-medium',
        rate?.stale
          ? 'bg-warning/10 border-warning/30 text-warning'
          : 'bg-accent/5 border-accent/20 text-text-secondary',
        className,
      )}
    >
      {rate ? (
        <>
          <span className="text-text-tertiary">1 USD ≈</span>
          <span className="font-mono font-bold text-accent">
            ₹{RATE_FORMATTER.format(parseFloat(rate.rate))}
          </span>
          {rate.stale ? (
            <span className="inline-flex items-center gap-0.5 text-warning">
              <AlertTriangle className="w-3 h-3" /> outdated
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-text-tertiary">live</span>
          )}
        </>
      ) : (
        <span className="text-text-tertiary">Loading FX rate…</span>
      )}
      {onRefresh ? (
        <button
          type="button"
          onClick={() => void onRefresh()}
          className="text-text-tertiary hover:text-text-primary transition-colors"
          title="Refresh rate"
          aria-label="Refresh FX rate"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      ) : null}
    </div>
  );
}
