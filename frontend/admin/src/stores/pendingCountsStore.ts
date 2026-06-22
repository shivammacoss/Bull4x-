'use client';

import { create } from 'zustand';
import { adminApi } from '@/lib/api';

/**
 * Sidebar-badge counts that drive the "new things waiting" indicator.
 *
 * Semantics match how each item type clears server-side, so a refresh after
 * the admin acts will naturally drop the badge:
 *   - kyc:         pending KYC submissions (clears on approve/reject)
 *   - deposits:    pending deposits + pending withdrawals (same page, one badge)
 *   - tickets:     `status=open` tickets only — backend flips open → in_progress
 *                  the moment the admin opens a ticket, so this clears on view
 *                  (which matches "new until seen" for support).
 *
 * For deposits/withdrawals the user wants the badge to stay until the item is
 * actually accepted or rejected (not just viewed), which is what `status=pending`
 * already gives us.
 */
interface PendingCountsState {
  kyc: number;
  depositsAndWithdrawals: number;
  supportTickets: number;
  loading: boolean;
  lastFetched: number | null;
  /** True after the first fetch resolves — lets the UI suppress badges on cold start. */
  hasFetched: boolean;
  refresh: () => Promise<void>;
}

type CountResp = { total?: number; items?: unknown[] };

/** Cheapest fetch — ask for one row, read `total`. Falls back to items.length
 *  if a paginated endpoint ever returns without `total`. */
async function fetchTotal(path: string, extra?: Record<string, string>): Promise<number> {
  try {
    const res = await adminApi.get<CountResp>(path, { per_page: '1', ...(extra ?? {}) });
    if (typeof res?.total === 'number') return res.total;
    if (Array.isArray(res?.items)) return res.items.length;
    return 0;
  } catch {
    // Treat any failure (network, 401 race during boot, etc.) as "unknown" — 0
    // is the safe default so we don't show a stale alarm.
    return 0;
  }
}

export const usePendingCountsStore = create<PendingCountsState>((set, get) => ({
  kyc: 0,
  depositsAndWithdrawals: 0,
  supportTickets: 0,
  loading: false,
  lastFetched: null,
  hasFetched: false,

  refresh: async () => {
    if (get().loading) return;
    set({ loading: true });
    const [kyc, deposits, withdrawals, tickets] = await Promise.all([
      fetchTotal('/kyc/pending'),
      fetchTotal('/finance/deposits/pending'),
      fetchTotal('/finance/withdrawals/pending'),
      fetchTotal('/support/tickets', { status: 'open' }),
    ]);
    set({
      kyc,
      depositsAndWithdrawals: deposits + withdrawals,
      supportTickets: tickets,
      loading: false,
      lastFetched: Date.now(),
      hasFetched: true,
    });
  },
}));
