'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/client';

export interface PaymentLimits {
  deposit_min: number;
  deposit_max: number;
  withdrawal_min: number;
  withdrawal_max: number;
}

const ZERO: PaymentLimits = {
  deposit_min: 0,
  deposit_max: 0,
  withdrawal_min: 0,
  withdrawal_max: 0,
};

/**
 * One-shot fetch of the admin-configured deposit / withdrawal bounds. 0 on
 * either side means "no limit" (same convention the gateway uses). Cached
 * for the lifetime of the component; the limits change rarely so we don't
 * bother polling. The wallet page already remounts on tab focus.
 */
export function usePaymentLimits(): { limits: PaymentLimits; loading: boolean } {
  const [limits, setLimits] = useState<PaymentLimits>(ZERO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<PaymentLimits>('/wallet/payment-limits');
        if (cancelled) return;
        setLimits({
          deposit_min: Number(data?.deposit_min) || 0,
          deposit_max: Number(data?.deposit_max) || 0,
          withdrawal_min: Number(data?.withdrawal_min) || 0,
          withdrawal_max: Number(data?.withdrawal_max) || 0,
        });
      } catch {
        // Silently fall back to "no limits" — never block the form if the
        // limits endpoint is misbehaving; the gateway still enforces on submit.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { limits, loading };
}

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD',
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});

/** "Min: $5.00 · Max: $1,000.00" — returns null when both sides are unset
 * so the caller can skip rendering the hint row entirely. */
export function formatLimitsHint(min: number, max: number): string | null {
  const hasMin = min > 0;
  const hasMax = max > 0;
  if (!hasMin && !hasMax) return null;
  const parts: string[] = [];
  if (hasMin) parts.push(`Min: ${USD.format(min)}`);
  if (hasMax) parts.push(`Max: ${USD.format(max)}`);
  return parts.join(' · ');
}
