'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { Minus, Plus, ChevronDown, ChevronLeft, Wifi, WifiOff, Zap } from 'lucide-react';
import { useTradingStore, type TradingAccount } from '@/stores/tradingStore';
import { useUIStore } from '@/stores/uiStore';
import api from '@/lib/api/client';
import { sounds, unlockAudio } from '@/lib/sounds';
import { getDigits } from '@/lib/utils';
import { getMarketStatus } from '@/lib/marketHours';
import { wsManager } from '@/lib/ws/wsManager';
import OrderPanelSymbolPicker from '@/components/trading/OrderPanelSymbolPicker';
import AccountSwitcher from '@/components/trading/AccountSwitcher';
import { currencySymbol, formatMoney } from '@/lib/currency';

type OrderSide = 'buy' | 'sell';
type OrderType = 'market' | 'pending';

export default function OrderPanel() {
  const pathname = usePathname();
  const isTradingTerminal = Boolean(pathname?.startsWith('/trading/terminal'));
  const {
    terminalMarketsOpen,
    toggleTerminalMarkets,
    oneClickTrading,
    setOneClickTrading,
  } = useUIStore();

  // Sliced selectors — destructuring the whole store re-renders this panel on
  // every tick because `prices` mutates ~30×/sec. Subscribing only to the
  // fields we actually read drops re-renders to the ones we care about.
  const selectedSymbol = useTradingStore((s) => s.selectedSymbol);
  const setSelectedSymbol = useTradingStore((s) => s.setSelectedSymbol);
  const activeTick = useTradingStore((s) => s.prices[s.selectedSymbol]);
  const instruments = useTradingStore((s) => s.instruments);
  const activeAccount = useTradingStore((s) => s.activeAccount);
  const usdInrRate = useTradingStore((s) => s.usdInrRate);
  const positions = useTradingStore((s) => s.positions);
  const setPositions = useTradingStore((s) => s.setPositions);
  const refreshPositions = useTradingStore((s) => s.refreshPositions);
  const refreshPendingOrders = useTradingStore((s) => s.refreshPendingOrders);
  const refreshAccount = useTradingStore((s) => s.refreshAccount);
  const orderFormCloneDraft = useTradingStore((s) => s.orderFormCloneDraft);
  const setOrderFormCloneDraft = useTradingStore((s) => s.setOrderFormCloneDraft);
  // Back-compat: downstream code reads `prices[symbol]`. Expose just the
  // active symbol's tick under that shape — we'd negate the perf win if we
  // re-subscribed to the full prices map (which mutates on every tick).
  const prices: Record<string, typeof activeTick> = { [selectedSymbol]: activeTick };
  const setTerminalMarketsOpen = useUIStore((s) => s.setTerminalMarketsOpen);
  const setTerminalNewsOpen = useUIStore((s) => s.setTerminalNewsOpen);

  const [side, setSide] = useState<OrderSide>('buy');
  const [orderTab, setOrderTab] = useState<OrderType>('market');
  const [lots, setLots] = useState('0.01');
  const [slEnabled, setSlEnabled] = useState(false);
  const [tpEnabled, setTpEnabled] = useState(false);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [openPrice, setOpenPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Synchronous double-submit gate — `submitting` state updates between renders,
  // so a fast double-tap can fire two orders before the button re-disables.
  const submitInFlightRef = useRef(false);
  const [symbolPickerOpen, setSymbolPickerOpen] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const tick = prices[selectedSymbol];
  const instrumentInfo = instruments.find((i) => i.symbol === selectedSymbol);
  const segment = (instrumentInfo as any)?.segment as string | undefined;
  const digits = getDigits(selectedSymbol);
  const contractSize = instrumentInfo?.contract_size || 100000;

  const marketStatus = useMemo(
    () => getMarketStatus(selectedSymbol, segment),
    [selectedSymbol, segment, Math.floor(Date.now() / 60_000)],
  );

  const execPrice = tick ? (side === 'buy' ? tick.ask : tick.bid) : 0;
  const lotsNum = parseFloat(lots) || 0;
  const openPriceNum = parseFloat(openPrice) || 0;
  const pipSize = instrumentInfo?.pip_size || (digits >= 5 ? 0.00001 : digits === 2 ? 0.01 : 0.0001);

  /** Derive limit vs stop from price vs current ask/bid (matches backend validation). */
  const derivedPendingType: 'limit' | 'stop' | null = useMemo(() => {
    if (orderTab !== 'pending' || !tick || !openPriceNum) return null;
    if (side === 'buy') {
      if (openPriceNum < tick.ask) return 'limit';
      if (openPriceNum > tick.ask) return 'stop';
      return null;
    }
    if (openPriceNum > tick.bid) return 'limit';
    if (openPriceNum < tick.bid) return 'stop';
    return null;
  }, [orderTab, side, openPriceNum, tick]);

  const pendingPipsDiff = useMemo(() => {
    if (orderTab !== 'pending' || !tick || !openPriceNum) return null;
    const ref = side === 'buy' ? tick.ask : tick.bid;
    return (openPriceNum - ref) / pipSize;
  }, [orderTab, tick, openPriceNum, side, pipSize]);

  /** Pending orders price-check against the open price, not the current quote. */
  const referencePrice = orderTab === 'pending' && openPriceNum > 0 ? openPriceNum : execPrice;

  /** Submit-disabled signal for pending: empty/invalid price, or price equals
   *  current ask/bid (can't infer limit vs stop). Kept separate so the button
   *  visibly greys out instead of swallowing clicks behind a toast. */
  const pendingInvalid =
    orderTab === 'pending' && (!openPriceNum || !tick || !derivedPendingType);
  const marginRequired = useMemo(() => {
    if (!referencePrice || !activeAccount) return 0;
    const usd = (lotsNum * contractSize * referencePrice) / activeAccount.leverage;
    // Account margin/balance are stored in the account currency (INR for INR
    // accounts). The raw formula above is in USD, so convert it to the account
    // currency — otherwise we'd compare a USD requirement against an INR free
    // margin (≈95× off) and mislabel the figure with the wrong symbol.
    return usdInrRate > 1 ? usd * usdInrRate : usd;
  }, [referencePrice, lotsNum, activeAccount, contractSize, usdInrRate]);

  const freeMargin = Math.max(0, activeAccount?.free_margin || 0);
  const hasEnoughMargin = freeMargin >= marginRequired;

  useEffect(() => {
    const unsub = wsManager.onStatusChange(setWsStatus);
    setWsStatus(wsManager.status);
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!orderFormCloneDraft) return;
    const d = orderFormCloneDraft;
    setSelectedSymbol(d.symbol);
    setSide(d.side);
    setLots(Math.max(0.01, Number(d.lots.toFixed(4))).toString());
    if (d.stop_loss != null && d.stop_loss !== undefined && !Number.isNaN(Number(d.stop_loss))) {
      setSlEnabled(true);
      setStopLoss(String(d.stop_loss));
    } else {
      setSlEnabled(false);
      setStopLoss('');
    }
    if (d.take_profit != null && d.take_profit !== undefined && !Number.isNaN(Number(d.take_profit))) {
      setTpEnabled(true);
      setTakeProfit(String(d.take_profit));
    } else {
      setTpEnabled(false);
      setTakeProfit('');
    }
    setOrderTab('market');
    setOrderFormCloneDraft(null);
    setTerminalMarketsOpen(false);
    setTerminalNewsOpen(false);
    toast.success('Order form filled — review and place');
  }, [orderFormCloneDraft, setSelectedSymbol, setOrderFormCloneDraft, setTerminalMarketsOpen, setTerminalNewsOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSymbolPickerOpen(false);
      }
    }
    if (symbolPickerOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [symbolPickerOpen]);

  // Auto-set SL/TP defaults — anchored to open price in Pending mode so the
  // suggested level matches where the order will actually fill, not the
  // (potentially distant) current market.
  useEffect(() => {
    const anchor = orderTab === 'pending' && openPriceNum > 0 ? openPriceNum : execPrice;
    if (slEnabled && !stopLoss && anchor > 0) {
      setStopLoss((side === 'buy' ? anchor * 0.99 : anchor * 1.01).toFixed(digits));
    }
  }, [slEnabled]);

  useEffect(() => {
    const anchor = orderTab === 'pending' && openPriceNum > 0 ? openPriceNum : execPrice;
    if (tpEnabled && !takeProfit && anchor > 0) {
      setTakeProfit((side === 'buy' ? anchor * 1.02 : anchor * 0.98).toFixed(digits));
    }
  }, [tpEnabled]);

  const adjustLots = (delta: number) => {
    setLots(Math.max(0.01, parseFloat((lotsNum + delta).toFixed(2))).toString());
  };

  // Seed open price when entering Pending tab or when side/symbol changes there.
  // Tick is intentionally omitted so live ticks don't overwrite a user's edit.
  useEffect(() => {
    if (orderTab !== 'pending') return;
    if (!tick) return;
    const ref = side === 'buy' ? tick.ask : tick.bid;
    if (ref > 0) setOpenPrice(ref.toFixed(digits));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderTab, side, selectedSymbol]);

  const adjustOpenPrice = (delta: number) => {
    const fallback = side === 'buy' ? tick?.ask : tick?.bid;
    const cur = openPriceNum || fallback || 0;
    const next = Math.max(0, cur + delta);
    setOpenPrice(next.toFixed(digits));
  };

  const handleSubmit = async () => {
    unlockAudio();
    if (!activeAccount || submitting || submitInFlightRef.current) return;

    // Lots: backend has its own caps but a 0 / NaN submission isn't worth a round-trip.
    if (!Number.isFinite(lotsNum) || lotsNum <= 0) {
      toast.error('Enter a valid lot size');
      return;
    }

    // SL / TP parse-time guards (cheaper than a server 422).
    const slVal = slEnabled && stopLoss ? parseFloat(stopLoss) : undefined;
    const tpVal = tpEnabled && takeProfit ? parseFloat(takeProfit) : undefined;
    if (slEnabled && (slVal === undefined || !Number.isFinite(slVal) || slVal <= 0)) {
      toast.error('Enter a valid stop loss');
      return;
    }
    if (tpEnabled && (tpVal === undefined || !Number.isFinite(tpVal) || tpVal <= 0)) {
      toast.error('Enter a valid take profit');
      return;
    }

    if (orderTab === 'market') {
      if (!marketStatus.isOpen) {
        toast.error(marketStatus.reason || 'Market is closed');
        return;
      }
      // Mirror server-side market SL/TP rules so the user sees the error inline
      // instead of a 400 toast after the click.
      if (execPrice > 0) {
        if (slVal !== undefined) {
          if (side === 'buy' && slVal >= execPrice) {
            toast.error('Buy stop loss must be below the current price');
            return;
          }
          if (side === 'sell' && slVal <= execPrice) {
            toast.error('Sell stop loss must be above the current price');
            return;
          }
        }
        if (tpVal !== undefined) {
          if (side === 'buy' && tpVal <= execPrice) {
            toast.error('Buy take profit must be above the current price');
            return;
          }
          if (side === 'sell' && tpVal >= execPrice) {
            toast.error('Sell take profit must be below the current price');
            return;
          }
        }
      }
    }

    // Snapshot the type *before* the await — a live tick crossing the open
    // price between this click and the api.post could otherwise flip it.
    let pendingTypeAtSubmit: 'limit' | 'stop' | null = null;
    if (orderTab === 'pending') {
      if (!Number.isFinite(openPriceNum) || openPriceNum <= 0) {
        toast.error('Set open price');
        return;
      }
      if (!tick) {
        toast.error('Waiting for price feed — try again');
        return;
      }
      pendingTypeAtSubmit = derivedPendingType;
      if (!pendingTypeAtSubmit) {
        toast.error(
          side === 'buy'
            ? `Open price ${openPriceNum.toFixed(digits)} equals ask — move below for Limit, above for Stop`
            : `Open price ${openPriceNum.toFixed(digits)} equals bid — move above for Limit, below for Stop`,
        );
        return;
      }
      // Pending SL/TP — server skips this check for pending, so the client owns it.
      if (slVal !== undefined) {
        if (side === 'buy' && slVal >= openPriceNum) {
          toast.error('Buy stop loss must be below the open price');
          return;
        }
        if (side === 'sell' && slVal <= openPriceNum) {
          toast.error('Sell stop loss must be above the open price');
          return;
        }
      }
      if (tpVal !== undefined) {
        if (side === 'buy' && tpVal <= openPriceNum) {
          toast.error('Buy take profit must be above the open price');
          return;
        }
        if (side === 'sell' && tpVal >= openPriceNum) {
          toast.error('Sell take profit must be below the open price');
          return;
        }
      }
    }

    if (!hasEnoughMargin) {
      toast.error(`Insufficient margin`);
      return;
    }

    // All validation passed — lock now. The ref blocks double-taps synchronously;
    // setSubmitting drives the disabled button. (Both reset in the api .finally.)
    submitInFlightRef.current = true;
    setSubmitting(true);

    // Optimistic: instant feedback, API fires in background.
    sounds.orderPlaced();
    const sideLabel =
      orderTab === 'pending' && pendingTypeAtSubmit
        ? `${side.toUpperCase()} ${pendingTypeAtSubmit.toUpperCase()}`
        : side.toUpperCase();
    toast.success(`${sideLabel} ${lotsNum} ${selectedSymbol}`);

    // Only market orders hit the book immediately — show the position in
    // the panel without waiting for the API round-trip so the UI feels
    // synchronous with the tap.
    const optimisticId = `optim-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    let rollback: (() => void) | null = null;
    if (orderTab === 'market') {
      const nowIso = new Date().toISOString();
      const optimisticPos = {
        id: optimisticId,
        account_id: activeAccount.id,
        symbol: selectedSymbol,
        side,
        lots: lotsNum,
        open_price: execPrice,
        current_price: execPrice,
        stop_loss: slEnabled && stopLoss ? parseFloat(stopLoss) : undefined,
        take_profit: tpEnabled && takeProfit ? parseFloat(takeProfit) : undefined,
        swap: 0,
        commission: 0,
        profit: 0,
        trade_type: 'market',
        created_at: nowIso,
      } as (typeof positions)[number];
      const prev = positions;
      setPositions([optimisticPos, ...prev]);
      rollback = () => setPositions(prev);
    }

    api.post('/orders/', {
      account_id: activeAccount.id,
      symbol: selectedSymbol,
      order_type: orderTab === 'market' ? 'market' : pendingTypeAtSubmit!,
      side,
      lots: lotsNum,
      price: orderTab === 'pending' ? openPriceNum : undefined,
      stop_loss: slVal,
      take_profit: tpVal,
    }).then(() => {
      // Reconcile with server-authoritative state (replaces the optimistic row).
      const refreshes: Promise<unknown>[] = [refreshAccount()];
      if (orderTab === 'market') refreshes.push(refreshPositions());
      else refreshes.push(refreshPendingOrders());
      Promise.all(refreshes).catch(() => {});
    }).catch((e: any) => {
      if (rollback) rollback();
      toast.error(e.message || 'Order failed');
    }).finally(() => {
      setSubmitting(false);
      submitInFlightRef.current = false;
    });
  };

  const isConnected = wsStatus === 'connected';

  const pad = isTradingTerminal ? 'px-2 py-2 space-y-2' : 'p-4 space-y-4';
  const tabPad = isTradingTerminal ? 'py-1 text-[11px]' : 'py-1.5 text-xs';
  const obPad = isTradingTerminal ? 'py-2' : 'py-3';
  const volBtn = isTradingTerminal ? 'w-8 h-8' : 'w-10 h-10';
  const volIn = isTradingTerminal ? 'py-1.5 text-sm' : 'py-2.5 text-base';

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden bg-bg-base">
      {/* ═══ Header ═══ */}
      <div
        className={clsx('shrink-0 flex items-center justify-between border-b border-border-primary bg-bg-secondary', isTradingTerminal ? 'px-2 py-2' : 'px-4 py-2.5')}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <div className="relative flex items-center gap-1.5 min-w-0" ref={dropdownRef}>
            <div
              className={clsx('rounded-full shrink-0', isTradingTerminal ? 'w-3.5 h-3.5' : 'w-4 h-4')}
              style={{ background: 'linear-gradient(135deg, #ffb300, #42a5f5)' }}
              aria-hidden
            />
            <button
              type="button"
              onClick={() => setSymbolPickerOpen((o) => !o)}
              className="flex items-center gap-1 hover:bg-white/[0.05] py-1 pl-0 pr-0.5 rounded-lg transition-colors min-w-0"
            >
              <span
                className={clsx(
                  'font-bold text-text-primary font-mono truncate',
                  isTradingTerminal ? 'text-xs' : 'text-sm',
                )}
              >
                {selectedSymbol}
              </span>
              {!isTradingTerminal ? (
                <ChevronDown
                  size={14}
                  className={clsx('text-text-tertiary shrink-0 transition-transform', symbolPickerOpen && 'rotate-180')}
                />
              ) : (
                <ChevronDown
                  size={12}
                  className={clsx('text-text-tertiary shrink-0 transition-transform', symbolPickerOpen && 'rotate-180')}
                />
              )}
            </button>
            {symbolPickerOpen && (
              <div className="absolute top-full left-0 z-50 w-64 mt-1 rounded-lg border border-border-primary shadow-2xl bg-bg-secondary overflow-hidden">
                <OrderPanelSymbolPicker
                  onPick={(sym) => {
                    setSelectedSymbol(sym);
                    setSymbolPickerOpen(false);
                  }}
                />
              </div>
            )}
          </div>
          {isTradingTerminal ? (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSymbolPickerOpen(false);
                  toggleTerminalMarkets();
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-accent/40 text-accent hover:bg-accent/12 transition-colors"
                aria-label={terminalMarketsOpen ? 'Hide markets' : 'Open markets'}
                aria-expanded={terminalMarketsOpen}
              >
                <ChevronLeft
                  className={clsx(
                    'w-3.5 h-3.5 transition-transform duration-200',
                    terminalMarketsOpen && '-rotate-90',
                  )}
                />
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Markets</span>
              </button>
              <button
                type="button"
                title={oneClickTrading ? 'One-click trading on' : 'One-click trading off'}
                aria-label={oneClickTrading ? 'Disable one-click trading' : 'Enable one-click trading'}
                aria-pressed={oneClickTrading}
                onClick={() => setOneClickTrading(!oneClickTrading)}
                className={clsx(
                  'flex items-center justify-center w-8 h-8 rounded-md border transition-colors',
                  oneClickTrading
                    ? 'border-accent/50 bg-accent/15 text-accent'
                    : 'border-border-secondary text-text-tertiary hover:text-text-primary hover:bg-bg-hover',
                )}
              >
                <Zap size={15} strokeWidth={1.75} />
              </button>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isTradingTerminal ? <AccountSwitcher compact /> : null}
          {!isTradingTerminal && (
            <div className="flex flex-col items-end shrink-0">
              <div className="flex items-center gap-1">
                <span
                  className="font-bold text-[10px]"
                  style={{ color: marketStatus.isOpen ? '#2196f3' : '#f57c00' }}
                >
                  {marketStatus.isOpen ? 'OPEN' : 'CLOSED'}
                </span>
                {isConnected ? (
                  <Wifi size={12} className="text-[#2196f3]" />
                ) : (
                  <WifiOff size={12} className="text-[#f57c00]" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isTradingTerminal ? (
        <div className="h-px w-full shrink-0 bg-accent" aria-hidden />
      ) : null}

      <div
        className={clsx('flex-1 min-h-0 flex flex-col bg-bg-base', isTradingTerminal && 'overflow-hidden')}
      >
        <div
          className={clsx(
            'min-h-0',
            isTradingTerminal
              ? 'flex-1 overflow-y-auto overscroll-y-contain'
              : 'flex-1 overflow-y-auto min-h-0',
          )}
        >
          <div className={pad}>
          {/* Market / Pending tabs */}
          <div className="flex rounded-md overflow-hidden bg-bg-secondary border border-border-primary">
            {(['market', 'pending'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOrderTab(t)}
                className={clsx('flex-1 font-semibold capitalize transition-all', tabPad)}
                style={{
                  background: orderTab === t ? 'var(--bg-hover)' : 'transparent',
                  color: orderTab === t ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  borderBottom:
                    orderTab === t
                      ? `2px solid ${isTradingTerminal ? '#2962FF' : '#2196f3'}`
                      : '2px solid transparent',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sell / Buy buttons */}
          <div className={clsx('grid grid-cols-2', isTradingTerminal ? 'gap-1.5' : 'gap-2')}>
             <button
                type="button"
                onClick={() => setSide('sell')}
                className={clsx(obPad, 'rounded-lg flex flex-col items-center justify-center transition-all duration-150 active:scale-[0.98]')}
                style={{
                  background: side === 'sell' ? 'rgba(239,83,80,0.15)' : 'var(--bg-secondary)',
                  border: side === 'sell' ? '1px solid #ef5350' : '1px solid var(--border-primary)',
                  color: side === 'sell' ? '#ef5350' : 'var(--text-secondary)',
                }}
             >
                <div className={clsx('font-bold uppercase tracking-wider', isTradingTerminal ? 'text-[10px] mb-0' : 'text-sm mb-0.5')}>Sell</div>
                <div className={clsx('font-mono font-bold', isTradingTerminal ? 'text-[13px]' : 'text-[15px]', side === 'sell' && 'text-red-400')}>{tick ? tick.bid.toFixed(digits) : '---'}</div>
                <div className={clsx('text-text-tertiary', isTradingTerminal ? 'text-[8px] mt-0.5' : 'text-[9px] mt-1')}>Bid</div>
             </button>
             <button
                type="button"
                onClick={() => setSide('buy')}
                className={clsx(obPad, 'rounded-lg flex flex-col items-center justify-center transition-all duration-150 active:scale-[0.98]')}
                style={{
                  background: side === 'buy' ? 'rgba(33,150,243,0.15)' : 'var(--bg-secondary)',
                  border: side === 'buy' ? '1px solid #2196f3' : '1px solid var(--border-primary)',
                  color: side === 'buy' ? '#2196f3' : 'var(--text-secondary)',
                }}
             >
                <div className={clsx('font-bold uppercase tracking-wider', isTradingTerminal ? 'text-[10px] mb-0' : 'text-sm mb-0.5')}>Buy</div>
                <div className={clsx('font-mono font-bold', isTradingTerminal ? 'text-[13px]' : 'text-[15px]', side === 'buy' && 'text-[#2196f3]')}>{tick ? tick.ask.toFixed(digits) : '---'}</div>
                <div className={clsx('text-text-tertiary', isTradingTerminal ? 'text-[8px] mt-0.5' : 'text-[9px] mt-1')}>Ask</div>
             </button>
          </div>

          {/* Spread */}
          {tick && (
             <div className={clsx('flex items-center justify-center', isTradingTerminal ? '-mt-1' : '-mt-2')}>
                <span className={clsx('font-mono px-2 py-0.5 rounded-full bg-bg-secondary text-text-tertiary border border-border-primary', isTradingTerminal ? 'text-[9px]' : 'text-[10px]')}>
                  Spread: {(tick.spread / (instrumentInfo?.pip_size || 0.0001)).toFixed(1)}
                </span>
             </div>
          )}

          {/* Open price — pending only */}
          {orderTab === 'pending' && (
            <div className={isTradingTerminal ? 'pt-1' : 'pt-2'}>
              <div className={clsx('flex items-center justify-between', isTradingTerminal ? 'mb-1' : 'mb-1.5')}>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Open price</span>
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    color: derivedPendingType === 'stop' ? '#ffb300' : '#2196f3',
                    background: derivedPendingType === 'stop' ? 'rgba(255,179,0,0.12)' : 'rgba(33,150,243,0.12)',
                    border: `1px solid ${derivedPendingType === 'stop' ? 'rgba(255,179,0,0.3)' : 'rgba(33,150,243,0.3)'}`,
                    opacity: derivedPendingType ? 1 : 0.5,
                  }}
                >
                  {derivedPendingType || 'limit'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => adjustOpenPrice(-pipSize)}
                  className={clsx(volBtn, 'rounded-lg flex items-center justify-center transition-colors text-text-secondary hover:text-text-primary bg-bg-secondary border border-border-primary')}
                  aria-label="Decrease price"
                >
                  <Minus size={isTradingTerminal ? 12 : 14} />
                </button>
                <input
                  type="text"
                  inputMode="decimal"
                  value={openPrice}
                  onChange={(e) => {
                    const v = e.target.value;
                    // Allow empty, leading digit + optional decimal + digits.
                    // Reject bare "." / "1.2.3" / non-digits so submit always parses.
                    if (v === '' || /^\d+(\.\d*)?$/.test(v)) setOpenPrice(v);
                  }}
                  onBlur={() => {
                    const n = parseFloat(openPrice);
                    if (Number.isFinite(n) && n > 0) setOpenPrice(n.toFixed(digits));
                    else if (openPrice !== '') setOpenPrice('');
                  }}
                  placeholder={execPrice > 0 ? execPrice.toFixed(digits) : '0.00'}
                  className={clsx(
                    'flex-1 text-center font-mono font-bold rounded-lg focus:outline-none bg-bg-secondary border text-text-primary',
                    volIn,
                    derivedPendingType
                      ? 'border-border-primary'
                      : openPriceNum
                        ? 'border-red-500/40'
                        : 'border-border-primary',
                  )}
                />
                <button
                  type="button"
                  onClick={() => adjustOpenPrice(pipSize)}
                  className={clsx(volBtn, 'rounded-lg flex items-center justify-center transition-colors text-text-secondary hover:text-text-primary bg-bg-secondary border border-border-primary')}
                  aria-label="Increase price"
                >
                  <Plus size={isTradingTerminal ? 12 : 14} />
                </button>
              </div>
              {pendingPipsDiff !== null && Number.isFinite(pendingPipsDiff) && (
                <div className="mt-1 text-[10px] font-mono text-text-tertiary">
                  {pendingPipsDiff > 0 ? '+' : ''}
                  {pendingPipsDiff.toFixed(1)} pips from market
                </div>
              )}
              {openPriceNum > 0 && !derivedPendingType && tick && (
                <div className="mt-1 text-[10px] text-red-400">
                  {side === 'buy'
                    ? 'Move below ask for Limit, above for Stop'
                    : 'Move above bid for Limit, below for Stop'}
                </div>
              )}
            </div>
          )}

          {/* SL / TP toggles */}
          <div className={clsx('flex items-center', isTradingTerminal ? 'gap-3 pt-1' : 'gap-5 pt-2')}>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => { setSlEnabled((p) => !p); if (slEnabled) setStopLoss(''); }}
                className="w-8 h-[18px] rounded-full relative transition-colors cursor-pointer border border-border-primary"
                style={{ background: slEnabled ? '#ef5350' : 'var(--bg-secondary)' }}
              >
                <div className="absolute top-[3px] w-2.5 h-2.5 rounded-full bg-white transition-all shadow-sm" style={{ left: slEnabled ? '18px' : '3px' }} />
              </div>
              <span className="text-[10px] uppercase font-semibold text-text-secondary">SL</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => { setTpEnabled((p) => !p); if (tpEnabled) setTakeProfit(''); }}
                className="w-8 h-[18px] rounded-full relative transition-colors cursor-pointer border border-border-primary"
                style={{ background: tpEnabled ? '#2196f3' : 'var(--bg-secondary)' }}
              >
                <div className="absolute top-[3px] w-2.5 h-2.5 rounded-full bg-white transition-all shadow-sm" style={{ left: tpEnabled ? '18px' : '3px' }} />
              </div>
              <span className="text-[10px] uppercase font-semibold text-text-secondary">TP</span>
            </label>
            {activeAccount && (
              <LeveragePicker
                account={activeAccount}
                onChanged={() => { void refreshAccount(); }}
              />
            )}
          </div>

          {/* Volume */}
          <div className={isTradingTerminal ? 'pt-1' : 'pt-2'}>
            <div className={clsx('flex items-center justify-between', isTradingTerminal ? 'mb-1' : 'mb-1.5')}>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Volume</span>
              <div className="flex gap-0.5">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-bg-hover text-text-secondary">Lots</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium text-text-tertiary hover:text-text-secondary cursor-pointer transition-colors">Units</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => adjustLots(-0.01)}
                className={clsx(volBtn, 'rounded-lg flex items-center justify-center transition-colors text-text-secondary hover:text-text-primary bg-bg-secondary border border-border-primary')}
              >
                <Minus size={isTradingTerminal ? 12 : 14} />
              </button>
              <input
                type="text"
                inputMode="decimal"
                value={lots}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) setLots(v);
                }}
                onBlur={() => {
                  const n = parseFloat(lots);
                  if (!Number.isFinite(n) || n <= 0) setLots('0.01');
                  else setLots(n.toFixed(2));
                }}
                className={clsx('flex-1 text-center font-mono font-bold rounded-lg focus:outline-none bg-bg-secondary border border-border-primary text-text-primary', volIn)}
              />
              <button
                type="button"
                onClick={() => adjustLots(0.01)}
                className={clsx(volBtn, 'rounded-lg flex items-center justify-center transition-colors text-text-secondary hover:text-text-primary bg-bg-secondary border border-border-primary')}
              >
                <Plus size={isTradingTerminal ? 12 : 14} />
              </button>
            </div>
          </div>

          {/* SL input */}
          {slEnabled && (
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1.5 block">Stop Loss</span>
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                step={execPrice > 100 ? 0.01 : 0.00001}
                placeholder={`e.g. ${(execPrice * (side === 'buy' ? 0.99 : 1.01)).toFixed(digits)}`}
                className="w-full text-sm font-mono py-2.5 px-3 rounded-lg focus:outline-none bg-bg-secondary border border-red-500/30 text-red-400"
              />
            </div>
          )}

          {/* TP input */}
          {tpEnabled && (
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2196f3] mb-1.5 block">Take Profit</span>
              <input
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                step={execPrice > 100 ? 0.01 : 0.00001}
                placeholder={`e.g. ${(execPrice * (side === 'buy' ? 1.02 : 0.98)).toFixed(digits)}`}
                className="w-full text-sm font-mono py-2.5 px-3 rounded-lg focus:outline-none bg-bg-secondary border border-[#2196f3]/30 text-[#2196f3]"
              />
            </div>
          )}

          {!isTradingTerminal ? (
            <>
              <div className="py-2" />
              <div className="rounded-xl p-3 space-y-2 bg-bg-secondary border border-border-primary">
                {[
                  { label: 'Exec. Price', value: execPrice > 0 ? execPrice.toFixed(digits) : '—', color: 'var(--text-primary)' },
                  { label: 'Margin Required', value: formatMoney(marginRequired, activeAccount?.currency), color: !hasEnoughMargin ? '#ef5350' : 'var(--text-secondary)' },
                  { label: 'Free Margin', value: formatMoney(freeMargin, activeAccount?.currency), color: !hasEnoughMargin ? '#ef5350' : '#2196f3' },
                  { label: 'Feed', value: isConnected ? '● Connected' : '○ Disconnected', color: isConnected ? '#2196f3' : '#f57c00' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-[11px] text-text-tertiary">{row.label}</span>
                    <span className="text-[11px] font-mono font-semibold" style={{ color: row.color }}>{row.value}</span>
                  </div>
                ))}
                {!hasEnoughMargin && (
                  <div className="text-[11px] text-red-500 font-bold text-center pt-2 mt-2" style={{ borderTop: '1px solid rgba(239,83,80,0.15)' }}>
                    ⚠ Insufficient margin
                  </div>
                )}
              </div>
              <div className="py-2" />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !hasEnoughMargin || !activeAccount || (orderTab === 'market' && !marketStatus.isOpen) || pendingInvalid}
                className="w-full py-4 rounded-xl text-[15px] font-black tracking-wide uppercase transition-transform duration-75 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96]"
                style={{
                  background: side === 'buy' ? '#2196f3' : '#ef5350',
                  color: '#fff',
                  boxShadow: side === 'buy' ? '0 4px 20px rgba(33,150,243,0.2)' : '0 4px 20px rgba(239,83,80,0.2)',
                }}
              >
                {orderTab === 'pending' && derivedPendingType
                  ? `${side === 'buy' ? 'Buy' : 'Sell'} ${derivedPendingType} ${selectedSymbol}`
                  : `${side === 'buy' ? 'Buy' : 'Sell'} ${selectedSymbol}`}
              </button>
              {!marketStatus.isOpen && orderTab === 'market' && (
                <div className="mt-4 rounded-lg px-3 py-2 text-[11px] text-red-400 leading-snug text-center" style={{ background: 'rgba(239,83,80,0.1)', border: '1px solid rgba(239,83,80,0.2)' }}>
                  {marketStatus.reason}
                </div>
              )}
            </>
          ) : null}
          </div>
        </div>

        {isTradingTerminal ? (
          <div className="shrink-0 border-t border-border-primary bg-bg-secondary px-2 pt-2 pb-2 space-y-1.5">
            <div className="flex items-center justify-between py-1.5 px-2 rounded-md bg-card border border-border-primary">
              <span className="text-[10px] text-text-tertiary">Exec. Price</span>
              <span className="text-xs font-mono font-semibold text-text-primary">
                {execPrice > 0 ? execPrice.toFixed(digits) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 px-1 text-[9px] text-text-tertiary">
              <span className="truncate">Mrgn {currencySymbol(activeAccount?.currency)}{marginRequired.toFixed(2)}</span>
              <span className={clsx('shrink-0 font-mono', hasEnoughMargin ? 'text-[#2196f3]' : 'text-[#ef5350]')}>
                Free {currencySymbol(activeAccount?.currency)}{freeMargin.toFixed(2)}
              </span>
              <span
                className={clsx('shrink-0 font-mono', isConnected ? 'text-[#2196f3]' : 'text-[#f57c00]')}
                title={isConnected ? 'Feed connected' : 'Feed disconnected'}
              >
                {isConnected ? '●' : '○'}
              </span>
            </div>
            {!hasEnoughMargin && (
              <div className="text-[10px] text-red-500 font-semibold text-center leading-tight">Insufficient margin</div>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !hasEnoughMargin || !activeAccount || (orderTab === 'market' && !marketStatus.isOpen) || pendingInvalid}
              className="w-full py-2.5 rounded-lg text-sm font-black tracking-wide uppercase transition-transform duration-75 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96]"
              style={{
                background: side === 'buy' ? '#2196f3' : '#ef5350',
                color: '#fff',
                boxShadow: side === 'buy' ? '0 2px 12px rgba(33,150,243,0.2)' : '0 2px 12px rgba(239,83,80,0.2)',
              }}
            >
              {orderTab === 'pending' && derivedPendingType
                ? `${side === 'buy' ? 'Buy' : 'Sell'} ${derivedPendingType} ${selectedSymbol}`
                : `${side === 'buy' ? 'Buy' : 'Sell'} ${selectedSymbol}`}
            </button>
            {!marketStatus.isOpen && orderTab === 'market' && (
              <div
                className="rounded px-2 py-1 text-[10px] text-red-400 leading-snug text-center"
                style={{ background: 'rgba(239,83,80,0.1)', border: '1px solid rgba(239,83,80,0.2)' }}
              >
                {marketStatus.reason}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Dropdown that lets the trader lower their leverage to any preset value up to
 * the admin-set `account_group.leverage_default` ceiling. Persists the change
 * via PATCH /accounts/:id/leverage.
 */
function LeveragePicker({
  account,
  onChanged,
}: {
  account: TradingAccount;
  onChanged: () => void;
}) {
  const setActiveAccount = useTradingStore((s) => s.setActiveAccount);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const maxLev = account.account_group?.leverage_default ?? account.leverage;
  const presets = useMemo(() => {
    const base = [1, 10, 25, 50, 100, 200, 300, 400, 500, 1000];
    const filtered = base.filter((v) => v <= maxLev);
    if (!filtered.includes(maxLev)) filtered.push(maxLev);
    return Array.from(new Set(filtered)).sort((a, b) => a - b);
  }, [maxLev]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const apply = async (lev: number) => {
    if (lev === account.leverage) { setOpen(false); return; }
    setSaving(true);
    try {
      await api.patch(`/accounts/${account.id}/leverage`, { leverage: lev });
      // Optimistic local update so the pill reflects the new value immediately.
      setActiveAccount({ ...account, leverage: lev });
      toast.success(`Leverage set to 1:${lev}`);
      onChanged();
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not change leverage');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ml-auto relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        disabled={saving}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-50"
        title={`Max 1:${maxLev} — click to change`}
      >
        1:{account.leverage}
        <ChevronDown size={10} />
      </button>
      {open && (
        <div
          className="absolute right-0 bottom-full mb-1 w-28 rounded-lg border border-border-primary shadow-xl py-1"
          style={{
            backgroundColor: 'var(--bg-card)',
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          }}
        >
          <div className="px-2 pb-1 pt-0.5 text-[9px] uppercase tracking-wider text-text-tertiary font-bold border-b border-border-primary mb-1">
            Max 1:{maxLev}
          </div>
          <div className="max-h-[220px] overflow-y-auto">
            {presets.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => void apply(v)}
                className={clsx(
                  'w-full text-left px-2 py-1 text-[11px] font-mono transition-colors',
                  v === account.leverage
                    ? 'bg-[#2196f3]/15 text-[#2196f3] font-bold'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                )}
              >
                1:{v}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
