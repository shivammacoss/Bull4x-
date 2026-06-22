'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/lib/api/client';

export interface FxRate {
  from: string;
  to: string;
  raw_rate: string;
  markup_percent: string;
  rate: string;
  source: string;
  fetched_at: string | null;
  stale: boolean;
  cache_ttl_seconds: number;
}

interface UseFxRateOptions {
  /** When false, the hook stays idle (no fetch, no polling). Used to scope the
   *  request to the UPI tab — we don't want to hit /fx-rate while the user is
   *  on the crypto tab or has the wallet page in the background. */
  enabled: boolean;
  /** How often to refetch while enabled & tab visible. Default 30s. */
  pollIntervalMs?: number;
}

interface UseFxRateResult {
  rate: FxRate | null;
  loading: boolean;
  error: string | null;
  /** Imperative refetch — used by manual refresh buttons / focus handlers. */
  refresh: () => Promise<void>;
}

/**
 * Pulls the live USD→INR rate from the gateway and keeps it fresh while the
 * caller is enabled. Pauses polling when the tab is hidden, refetches
 * immediately when it becomes visible again, and returns a stable result
 * shape so consumers can render skeleton → value → stale without flicker.
 */
export function useFxRate({ enabled, pollIntervalMs = 30_000 }: UseFxRateOptions): UseFxRateResult {
  const [rate, setRate] = useState<FxRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generation counter so a stale in-flight fetch can't overwrite a newer result.
  const genRef = useRef(0);
  const inFlightRef = useRef(false);

  const fetchOnce = useCallback(async (silent: boolean) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const gen = ++genRef.current;
    if (!silent) setLoading(true);
    try {
      const data = await api.get<FxRate>('/wallet/fx-rate');
      if (gen !== genRef.current) return;
      setRate(data);
      setError(null);
    } catch (e) {
      if (gen !== genRef.current) return;
      // 503 → "rate unavailable" should hide the badge gracefully, not throw.
      const msg = e instanceof Error ? e.message : 'Failed to load FX rate';
      setError(msg);
    } finally {
      inFlightRef.current = false;
      if (!silent) setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => fetchOnce(true), [fetchOnce]);

  // Initial fetch + polling lifecycle.
  useEffect(() => {
    if (!enabled) return;

    // Hard reset on (re-)enable so the caller doesn't see stale data from a
    // previous mount.
    void fetchOnce(false);

    const tick = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      void fetchOnce(true);
    };

    const intervalId = window.setInterval(tick, pollIntervalMs);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void fetchOnce(true);
    };
    const onFocus = () => void fetchOnce(true);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [enabled, pollIntervalMs, fetchOnce]);

  return { rate, loading, error, refresh };
}
