'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { X, Plus, Minus, Loader2 } from 'lucide-react';

/** Minimal position shape this card needs — keep loose so callers can pass
 *  their own position rows without a strict type contract. */
export interface ModifyTarget {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  lots: number;
  open_price: number;
  current_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  profit?: number;
  commission?: number;
}

type Tab = 'modify' | 'partial' | 'closeby';

interface Props {
  position: ModifyTarget;
  digits: number;
  /** Contract size (e.g. 100000 for forex, 100 for metals). Used to convert
   *  price differences into account-currency P&L for the live preview stats. */
  contractSize: number;
  /** Which input to focus on open. Default 'tp'. */
  initialField?: 'sl' | 'tp';
  onClose: () => void;
  /** Save handler. Receive raw numbers; null = clear that bracket. The caller
   *  is responsible for validating against open price / current price and
   *  surfacing toast errors. Return false (or throw) to keep the card open
   *  on failure. */
  onSave: (params: { sl: number | null; tp: number | null }) => Promise<boolean | void>;
  /** Optional partial-close handler. If absent, the Partial close tab is
   *  rendered with a "coming soon" hint instead of an input. */
  onPartialClose?: (lots: number) => Promise<boolean | void>;
}

const PIP_STEP_FOR_DIGITS = (digits: number): number => {
  // Forex 5-digit => pip = 0.0001 (step = pow(10, -4))
  // JPY pairs 3-digit => pip = 0.01 (step = pow(10, -2))
  // Metals 2-digit => 0.1 ... we just use 1 unit of the smallest tick * 10
  // for the +/- button so a single click is a meaningful move.
  if (digits >= 4) return Math.pow(10, -(digits - 1));
  if (digits >= 2) return Math.pow(10, -(digits - 1));
  return 1;
};

function fmtPrice(value: number, digits: number): string {
  if (!Number.isFinite(value)) return '';
  return value.toFixed(digits);
}

function fmtMoney(n: number): string {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  return `${sign}$${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPips(n: number): string {
  const sign = n < 0 ? '-' : '+';
  return `${sign}${Math.abs(n).toFixed(1)} pips`;
}

function fmtPct(n: number): string {
  const sign = n < 0 ? '-' : '+';
  return `${sign}${Math.abs(n).toFixed(2)}%`;
}

export default function ModifyPositionCard({
  position,
  digits,
  contractSize,
  initialField = 'tp',
  onClose,
  onSave,
  onPartialClose,
}: Props) {
  const [tab, setTab] = useState<Tab>('modify');
  const [tp, setTp] = useState(position.take_profit != null ? fmtPrice(position.take_profit, digits) : '');
  const [sl, setSl] = useState(position.stop_loss != null ? fmtPrice(position.stop_loss, digits) : '');
  const [partialLots, setPartialLots] = useState(String(position.lots));
  const [saving, setSaving] = useState(false);
  const [partialSaving, setPartialSaving] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const tpInputRef = useRef<HTMLInputElement>(null);
  const slInputRef = useRef<HTMLInputElement>(null);

  // ── Draggable positioning ────────────────────────────────────────────
  // null = "not measured yet, render centered via transform". After first
  // mount we measure and switch to absolute x/y so drag math is straightforward.
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  useLayoutEffect(() => {
    if (coords !== null) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setCoords({
      x: Math.max(8, (vw - rect.width) / 2),
      y: Math.max(8, (vh - rect.height) / 3),
    });
  }, [coords]);

  // Keep card inside viewport when window resizes.
  useEffect(() => {
    const onResize = () => {
      setCoords((prev) => {
        if (!prev) return prev;
        const el = cardRef.current;
        if (!el) return prev;
        const w = el.offsetWidth, h = el.offsetHeight;
        return {
          x: Math.max(8, Math.min(window.innerWidth - w - 8, prev.x)),
          y: Math.max(8, Math.min(window.innerHeight - h - 8, prev.y)),
        };
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Don't start a drag when the press lands on an interactive element inside
    // the drag handle (e.g. the close X button).
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, [data-no-drag]')) return;
    if (!coords) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      baseX: coords.x,
      baseY: coords.y,
    };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  }, [coords]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const el = cardRef.current;
    const w = el?.offsetWidth ?? 340;
    const h = el?.offsetHeight ?? 480;
    const nx = Math.max(8, Math.min(window.innerWidth - w - 8, d.baseX + dx));
    const ny = Math.max(8, Math.min(window.innerHeight - h - 8, d.baseY + dy));
    setCoords({ x: nx, y: ny });
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  }, []);

  // ── Focus initial field once mounted ────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (initialField === 'sl') slInputRef.current?.focus();
      else tpInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [initialField]);

  // Close on Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── Live preview stats for SL / TP ─────────────────────────────────
  const ref = position.current_price ?? position.open_price;
  const isBuy = position.side === 'buy';

  const step = useMemo(() => PIP_STEP_FOR_DIGITS(digits), [digits]);

  const tpNum = parseFloat(tp);
  const slNum = parseFloat(sl);

  const tpStats = useMemo(() => {
    if (!Number.isFinite(tpNum) || tpNum <= 0) return null;
    const diff = isBuy ? tpNum - position.open_price : position.open_price - tpNum;
    const pips = diff / step;
    const pnl = diff * position.lots * contractSize;
    const pct = position.open_price > 0 ? (diff / position.open_price) * 100 : 0;
    return { diff, pips, pnl, pct };
  }, [tpNum, isBuy, position.open_price, position.lots, contractSize, step]);

  const slStats = useMemo(() => {
    if (!Number.isFinite(slNum) || slNum <= 0) return null;
    const diff = isBuy ? slNum - position.open_price : position.open_price - slNum;
    const pips = diff / step;
    const pnl = diff * position.lots * contractSize;
    const pct = position.open_price > 0 ? (diff / position.open_price) * 100 : 0;
    return { diff, pips, pnl, pct };
  }, [slNum, isBuy, position.open_price, position.lots, contractSize, step]);

  const adjustPrice = (which: 'tp' | 'sl', delta: number) => {
    const current = which === 'tp' ? parseFloat(tp) : parseFloat(sl);
    const base = Number.isFinite(current) && current > 0 ? current : ref;
    const next = base + delta;
    const next2 = next > 0 ? fmtPrice(next, digits) : '';
    if (which === 'tp') setTp(next2);
    else setSl(next2);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const slV = parseFloat(sl);
      const tpV = parseFloat(tp);
      const ok = await onSave({
        sl: Number.isFinite(slV) && slV > 0 ? slV : null,
        tp: Number.isFinite(tpV) && tpV > 0 ? tpV : null,
      });
      if (ok !== false) onClose();
    } finally {
      setSaving(false);
    }
  };

  const handlePartial = async () => {
    if (!onPartialClose) return;
    const lots = parseFloat(partialLots);
    if (!Number.isFinite(lots) || lots <= 0 || lots > position.lots) return;
    setPartialSaving(true);
    try {
      const ok = await onPartialClose(lots);
      if (ok !== false) onClose();
    } finally {
      setPartialSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────
  const positionedStyle: React.CSSProperties = coords
    ? { top: coords.y, left: coords.x }
    : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0 };

  const pnlColor = (position.profit ?? 0) >= 0 ? 'text-buy' : 'text-sell';

  return (
    <>
      {/* Backdrop — click outside closes. Pointer-events stay enabled so a
          click in empty space still works. */}
      <div
        className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        ref={cardRef}
        role="dialog"
        aria-label={`Modify position ${position.symbol}`}
        className="fixed z-[60] w-[340px] max-w-[calc(100vw-1rem)] rounded-2xl border border-border-primary bg-bg-secondary shadow-2xl select-none"
        style={positionedStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — also the drag handle */}
        <div
          className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border-glass cursor-move touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={clsx('w-2.5 h-2.5 rounded-full shrink-0', isBuy ? 'bg-buy' : 'bg-sell')}
              aria-hidden
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-text-primary truncate">
                {position.symbol} {position.lots} lots
              </span>
              <span className="text-[10px] text-text-tertiary">
                {isBuy ? 'Buy' : 'Sell'} at {fmtPrice(position.open_price, digits)}
                {position.current_price != null ? (
                  <>  ·  <span className="text-text-secondary font-mono">{fmtPrice(position.current_price, digits)}</span></>
                ) : null}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {typeof position.profit === 'number' ? (
              <span className={clsx('text-xs font-bold tabular-nums', pnlColor)}>
                {fmtMoney(position.profit)}
              </span>
            ) : null}
            <button
              type="button"
              data-no-drag
              onClick={onClose}
              className="p-1 rounded hover:bg-bg-hover text-text-tertiary hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-3 pt-3" data-no-drag>
          {(['modify', 'partial', 'closeby'] as const).map((t) => {
            const active = t === tab;
            const label = t === 'modify' ? 'Modify' : t === 'partial' ? 'Partial close' : 'Close by';
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={clsx(
                  'flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors',
                  active
                    ? 'bg-accent/15 text-accent border border-accent/30'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-bg-hover',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-4 space-y-4" data-no-drag>
          {tab === 'modify' && (
            <>
              {/* Take Profit */}
              <PriceFieldGroup
                label="Take Profit"
                inputRef={tpInputRef}
                value={tp}
                setValue={setTp}
                step={step}
                onIncrement={() => adjustPrice('tp', step)}
                onDecrement={() => adjustPrice('tp', -step)}
                stats={tpStats}
                kind="tp"
              />

              {/* Stop Loss */}
              <PriceFieldGroup
                label="Stop Loss"
                inputRef={slInputRef}
                value={sl}
                setValue={setSl}
                step={step}
                onIncrement={() => adjustPrice('sl', step)}
                onDecrement={() => adjustPrice('sl', -step)}
                stats={slStats}
                kind="sl"
              />

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="w-full mt-2 py-3 rounded-lg bg-warning text-bg-base font-bold text-sm hover:bg-warning/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: saving ? undefined : '#facc15', color: '#0b0b0b' }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? 'Saving…' : 'Modify position'}
              </button>
            </>
          )}

          {tab === 'partial' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Lots to close (max {position.lots})
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={position.lots}
                  value={partialLots}
                  onChange={(e) => setPartialLots(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-bg-base border border-border-primary font-mono text-sm text-text-primary outline-none focus:border-accent/50"
                />
                <p className="text-[10px] text-text-tertiary">
                  Remaining position will stay open at the current SL/TP.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handlePartial()}
                disabled={partialSaving || !onPartialClose}
                className="w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                style={{ backgroundColor: '#facc15', color: '#0b0b0b' }}
              >
                {partialSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {partialSaving ? 'Closing…' : 'Close lots'}
              </button>
              {!onPartialClose ? (
                <p className="text-[10px] text-text-tertiary text-center">
                  Partial close not available for this position type.
                </p>
              ) : null}
            </>
          )}

          {tab === 'closeby' && (
            <div className="py-6 text-center space-y-2">
              <p className="text-sm text-text-secondary font-medium">Close-by hedging</p>
              <p className="text-[11px] text-text-tertiary leading-relaxed">
                Pair this position with an opposite one to flatten exposure.
                <br />Coming soon — use Close from the positions table for now.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Sub-component: a single price field with input + stepper + stats ──

function PriceFieldGroup({
  label,
  inputRef,
  value,
  setValue,
  step,
  onIncrement,
  onDecrement,
  stats,
  kind,
}: {
  label: string;
  inputRef: React.Ref<HTMLInputElement>;
  value: string;
  setValue: (v: string) => void;
  step: number;
  onIncrement: () => void;
  onDecrement: () => void;
  stats: { pips: number; pnl: number; pct: number } | null;
  kind: 'sl' | 'tp';
}) {
  const hasValue = value !== '';
  // Direction expectation for color hint on the stats line.
  // For TP we expect positive (profit), for SL negative (loss).
  const expectPositive = kind === 'tp';
  const statColor =
    stats == null
      ? ''
      : (stats.pnl >= 0) === expectPositive
        ? 'text-buy'
        : 'text-sell';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-secondary">{label}</span>
        {hasValue ? (
          <button
            type="button"
            onClick={() => setValue('')}
            className="text-[10px] text-text-tertiary hover:text-text-primary"
            aria-label={`Clear ${label}`}
          >
            Clear
          </button>
        ) : null}
      </div>
      <div className="flex items-stretch gap-1.5">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            step={step}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Not set"
            className="w-full px-3 py-2.5 rounded-lg bg-bg-base border border-border-primary font-mono text-sm font-bold text-text-primary outline-none focus:border-accent/50 placeholder:text-text-tertiary placeholder:font-normal"
          />
          {hasValue ? (
            <button
              type="button"
              onClick={() => setValue('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-bg-hover text-text-tertiary hover:text-text-primary"
              aria-label={`Clear ${label}`}
              tabIndex={-1}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDecrement}
          className="px-2.5 rounded-lg border border-border-primary bg-bg-base hover:bg-bg-hover transition-colors"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onIncrement}
          className="px-2.5 rounded-lg border border-border-primary bg-bg-base hover:bg-bg-hover transition-colors"
          aria-label={`Increase ${label}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {stats ? (
        <div className={clsx('text-[11px] font-mono tabular-nums', statColor)}>
          {fmtPips(stats.pips)}  ·  {fmtMoney(stats.pnl)}  ·  {fmtPct(stats.pct)}
        </div>
      ) : null}
    </div>
  );
}
