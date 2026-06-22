'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';
import { useTradingStore, wasRecentlyClosedByUser, type TradingAccount } from '@/stores/tradingStore';
import { wsManager } from '@/lib/ws/wsManager';
import { tradeSocket } from '@/lib/ws/tradeSocket';
import { extractTicksFromPayload } from '@/lib/ws/normalizePricePayload';
import api from '@/lib/api/client';
import { sounds, unlockAudio } from '@/lib/sounds';
import TopBar from '@/components/layout/TopBar';
import { useUIStore } from '@/stores/uiStore';

function mapApiAccount(a: Record<string, unknown>): TradingAccount {
  const g = a.account_group as Record<string, unknown> | null | undefined;
  return {
    id: String(a.id),
    account_number: String(a.account_number ?? ''),
    balance: Number(a.balance) || 0,
    credit: Number(a.credit) || 0,
    equity: Number(a.equity ?? a.balance) || 0,
    margin_used: Number(a.margin_used) || 0,
    free_margin: Number(a.free_margin ?? a.balance) || 0,
    margin_level: Number(a.margin_level) || 0,
    leverage: Number(a.leverage) || 100,
    currency: String(a.currency ?? 'USD'),
    is_demo: Boolean(a.is_demo),
    account_group: g
      ? {
          id: String(g.id),
          name: String(g.name ?? 'Account'),
          spread_markup: Number(g.spread_markup) || 0,
          commission_per_lot: Number(g.commission_per_lot) || 0,
          minimum_deposit: Number(g.minimum_deposit) || 0,
          swap_free: Boolean(g.swap_free),
          leverage_default: Number(g.leverage_default) || 100,
        }
      : null,
  };
}

function TradingSession({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const accountQueryId = searchParams.get('account');

  const {
    updatePrice,
    setActiveAccount,
    setAccounts,
    setPositions,
    setPendingOrders,
    setInstruments,
    refreshPositions,
    refreshAccount,
    refreshPendingOrders,
    refreshFxRate,
  } = useTradingStore();
  const accounts = useTradingStore((s) => s.accounts);
  const activeAccountId = useTradingStore((s) => s.activeAccount?.id ?? null);

  useEffect(() => {
    const onFirstGesture = () => {
      unlockAudio();
    };
    document.addEventListener('pointerdown', onFirstGesture, { passive: true });
    document.addEventListener('keydown', onFirstGesture);
    return () => {
      document.removeEventListener('pointerdown', onFirstGesture);
      document.removeEventListener('keydown', onFirstGesture);
    };
  }, []);

  /* Core data + WebSocket + polling (once). */
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const [accountsRes, instrumentsRes] = await Promise.all([
          api.get<unknown>('/accounts').catch(() => ({ items: [] })),
          api.get<unknown>('/instruments/').catch(() => []),
        ]);

        if (cancelled) return;

        const instruments = Array.isArray(instrumentsRes)
          ? instrumentsRes
          : ((instrumentsRes as { items?: unknown[] })?.items ?? []);
        if (instruments.length > 0) {
          setInstruments(
            instruments.map((i: Record<string, unknown>) => ({
              symbol: String(i.symbol),
              display_name: String(i.display_name || i.symbol),
              segment: String((i.segment as { name?: string })?.name || i.segment || ''),
              digits: Number(i.digits ?? 5),
              pip_size: Number(i.pip_size ?? 0.0001),
              min_lot: Number(i.min_lot ?? 0.01),
              max_lot: Number(i.max_lot ?? 100),
              lot_step: Number(i.lot_step ?? 0.01),
              contract_size: Number(i.contract_size ?? 100000),
              base_currency: i.base_currency ? String(i.base_currency) : null,
              quote_currency: i.quote_currency ? String(i.quote_currency) : null,
            })),
          );
        }

        const rawList = Array.isArray(accountsRes)
          ? accountsRes
          : ((accountsRes as { items?: unknown[] })?.items ?? []);
        setAccounts((rawList as Record<string, unknown>[]).map(mapApiAccount));
      } catch (err) {
        console.error('Trading bootstrap failed:', err);
      }
    }

    void bootstrap();

    wsManager.connect();
    const unsub = wsManager.onMessage((data) => {
      const ticks = extractTicksFromPayload(data);
      for (const t of ticks) updatePrice(t);
    });

    let pollCancelled = false;
    const pollPricesFromApi = async () => {
      try {
        const raw = await api.get<unknown>('/instruments/prices/all', undefined, { timeoutMs: 15000 });
        if (pollCancelled) return;
        for (const t of extractTicksFromPayload(raw)) updatePrice(t);
      } catch {
        /* ignore */
      }
    };
    void pollPricesFromApi();
    const pricePoll = setInterval(pollPricesFromApi, 1500);

    const fxPoll = setInterval(() => { refreshFxRate(); }, 60_000);

    const positionPoll = setInterval(async () => {
      const before = useTradingStore.getState().positions;
      const beforeIds = new Set(before.map((p) => p.id));

      await refreshPositions();
      await refreshAccount();
      // Pending orders MUST be polled too — when a limit/stop order fills it
      // becomes a position, and without this the Pending tab kept showing the
      // already-executed order until a manual refresh.
      await refreshPendingOrders();

      const after = useTradingStore.getState().positions;
      const afterIds = new Set(after.map((p) => p.id));

      let positionClosed = false;
      if (beforeIds.size > 0) {
        beforeIds.forEach((id) => {
          if (!afterIds.has(id)) {
            positionClosed = true;
            // Skip user-initiated closes — those already played a single
            // summary sound (one for the action, not one per row), so playing
            // again here would stack 3 sounds for a 3-position bulk close.
            if (wasRecentlyClosedByUser(String(id))) return;
            const closed = before.find((p) => p.id === id);
            if (closed) {
              const pnl = closed.profit || 0;
              // Play a quick sound but no popup — the reason will appear in the
              // history tab / Closed Positions row, so no extra toast noise.
              pnl >= 0 ? sounds.profit() : sounds.loss();
            }
          }
        });
      }

      // A position vanished from "open" → it closed (TP/SL/stop-out/manual).
      // Fire trade:update so the History / Closed Positions pane reloads right
      // away through this reliable poll, not only when the trade socket is up.
      if (positionClosed) {
        try {
          window.dispatchEvent(new CustomEvent('trade:update'));
        } catch {
          /* ignore */
        }
      }
    }, 1500);

    return () => {
      cancelled = true;
      pollCancelled = true;
      unsub();
      clearInterval(positionPoll);
      clearInterval(pricePoll);
      clearInterval(fxPoll);
    };
  }, [setAccounts, setInstruments, updatePrice, refreshPositions, refreshAccount, refreshPendingOrders, refreshFxRate]);

  /* Picker vs terminal: active account + positions. */
  useEffect(() => {
    let cancelled = false;

    const onPicker = pathname === '/trading' || pathname === '/trading/';
    if (onPicker) {
      setActiveAccount(null);
      setPositions([]);
      setPendingOrders([]);
      return;
    }

    if (!pathname.startsWith('/trading/terminal')) {
      return;
    }

    if (!accountQueryId) {
      setActiveAccount(null);
      setPositions([]);
      setPendingOrders([]);
      return;
    }

    const acc = accounts.find((a) => a.id === accountQueryId);
    if (!acc) {
      return;
    }

    setActiveAccount(acc);
    refreshFxRate();

    (async () => {
      try {
        const [positions, orders] = await Promise.all([
          api.get<unknown[]>(`/positions/`, { account_id: acc.id, status: 'open' }).catch(() => []),
          api.get<unknown[]>(`/orders/`, { account_id: acc.id, status: 'pending' }).catch(() => []),
        ]);
        if (cancelled) return;

        const posList = Array.isArray(positions) ? positions : [];
        setPositions(
          posList.map((row) => {
            const p = row as Record<string, unknown>;
            return {
            id: String(p.id),
            account_id: String(p.account_id),
            symbol: String(p.symbol || (p.instrument as { symbol?: string })?.symbol || ''),
            side: p.side as 'buy' | 'sell',
            lots: Number(p.lots) || 0,
            open_price: Number(p.open_price) || 0,
            current_price: p.current_price != null ? Number(p.current_price) : undefined,
            stop_loss: p.stop_loss != null ? Number(p.stop_loss) : undefined,
            take_profit: p.take_profit != null ? Number(p.take_profit) : undefined,
            swap: Number(p.swap) || 0,
            commission: Number(p.commission) || 0,
            profit: Number(p.profit) || 0,
            trade_type: p.trade_type as string | undefined,
            created_at: String(p.created_at ?? ''),
            };
          }),
        );

        const ordList = Array.isArray(orders) ? orders : [];
        setPendingOrders(
          ordList.map((row) => {
            const o = row as Record<string, unknown>;
            return {
            id: String(o.id),
            account_id: String(o.account_id),
            symbol: String(o.symbol || (o.instrument as { symbol?: string })?.symbol || ''),
            order_type: String(o.order_type),
            side: o.side as 'buy' | 'sell',
            status: String(o.status),
            lots: Number(o.lots) || 0,
            price: Number(o.price) || 0,
            stop_loss: o.stop_loss != null ? Number(o.stop_loss) : undefined,
            take_profit: o.take_profit != null ? Number(o.take_profit) : undefined,
            created_at: String(o.created_at ?? ''),
            };
          }),
        );
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, accountQueryId, accounts, setActiveAccount, setPositions, setPendingOrders, refreshFxRate]);

  /* Instant trade updates over the trade socket. The backend publishes to
   * account:{id} the moment a pending order fills (order_filled) or a position
   * closes (position_closed_tp / _sl / _manual / _stop_out …). We connect per
   * active account and, on any such event, immediately re-sync positions,
   * pending orders and account balance — so a filled limit order leaves the
   * Pending tab and a TP/SL hit moves to History without waiting for the poll.
   * The 1.5s poll above stays as a fallback when the socket can't connect. */
  useEffect(() => {
    if (!activeAccountId) return;
    const token = api.getToken();
    if (!token) return;

    tradeSocket.connect(activeAccountId, token);
    const unsub = tradeSocket.subscribe((evt) => {
      const t = String((evt as { type?: unknown })?.type || '');
      const isFill = t === 'order_filled';
      const isClose = t.startsWith('position_closed');
      const isOpen = t === 'position_opened' || t === 'order_executed';
      if (!isFill && !isClose && !isOpen) return;

      refreshPositions().catch(() => {});
      refreshPendingOrders().catch(() => {});
      refreshAccount().catch(() => {});

      // Automatic closes (TP/SL/stop-out) the user didn't click — play the
      // outcome sound here. Manual closes already get their sound from the
      // close action, so skip those to avoid a double beep.
      if (isClose) {
        const reason = t.replace('position_closed_', '');
        const isAuto = /tp|sl|stop_out|stopout|margin|liquidation/.test(reason);
        if (isAuto) {
          const profit = Number((evt as { profit?: unknown }).profit);
          if (Number.isFinite(profit)) (profit >= 0 ? sounds.profit() : sounds.loss());
        }
      }

      // Let other panels (e.g. History / Closed Positions) reload immediately.
      try {
        window.dispatchEvent(new CustomEvent('trade:update', { detail: evt }));
      } catch {
        /* ignore */
      }
    });

    return () => {
      unsub();
      tradeSocket.disconnect();
    };
  }, [activeAccountId, refreshPositions, refreshPendingOrders, refreshAccount]);

  return <>{children}</>;
}

export default function TradingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const terminalOnly = pathname?.startsWith('/trading/terminal');

  return (
    <div
      className={clsx(
        'trading-page flex flex-col h-[100dvh] bg-bg-base min-h-0',
        terminalOnly ? 'pb-0 md:pb-0' : 'pb-16 md:h-screen md:pb-0',
      )}
      data-theme={useUIStore((s) => s.theme)}
    >
      {!terminalOnly && <TopBar />}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center text-text-tertiary text-sm bg-bg-primary">
              Loading trading…
            </div>
          }
        >
          <TradingSession>{children}</TradingSession>
        </Suspense>
      </div>
    </div>
  );
}
