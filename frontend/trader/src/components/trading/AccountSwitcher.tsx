'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { ChevronDown, Check, Plus, Wallet } from 'lucide-react';
import { useTradingStore, type TradingAccount } from '@/stores/tradingStore';
import { setPersistedTradingAccountId } from '@/lib/tradingNav';
import { currencySymbol } from '@/lib/currency';

/**
 * Compact account switcher for the trading terminal top bar.
 * Click → dropdown listing every account (Live/Demo, group, balance) so the
 * trader can hot-swap which wallet routes the next order without leaving the chart.
 */
export default function AccountSwitcher({ compact = true }: { compact?: boolean }) {
  const { accounts, activeAccount, setActiveAccount, refreshPositions, refreshPendingOrders, refreshAccount } =
    useTradingStore();

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const handleSwitch = (acc: TradingAccount) => {
    if (acc.id === activeAccount?.id) {
      setOpen(false);
      return;
    }
    setActiveAccount(acc);
    setPersistedTradingAccountId(acc.id);
    Promise.all([refreshPositions(), refreshPendingOrders(), refreshAccount()]).catch(() => {});
    toast.success(`Switched to ${acc.account_number} · ${acc.is_demo ? 'Demo' : 'Live'}`);
    setOpen(false);
  };

  const fmtBalance = (n: number | null | undefined) =>
    typeof n === 'number'
      ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '—';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={
          activeAccount
            ? `Active: ${activeAccount.account_number} (${activeAccount.is_demo ? 'Demo' : 'Live'}) — click to switch`
            : 'Select an account'
        }
        className={clsx(
          'group flex items-center gap-1.5 rounded-md border border-border-secondary bg-bg-secondary/60',
          'hover:border-accent/50 hover:bg-bg-hover transition-colors',
          compact ? 'px-1.5 py-1' : 'px-2.5 py-1.5',
        )}
      >
        {activeAccount ? (
          <>
            <span
              className={clsx(
                'inline-block rounded-full shrink-0',
                compact ? 'w-1.5 h-1.5' : 'w-2 h-2',
                activeAccount.is_demo ? 'bg-warning' : 'bg-buy',
              )}
              aria-hidden
            />
            <span
              className={clsx(
                'font-mono font-extrabold text-text-primary tracking-tight truncate max-w-[6.5rem]',
                compact ? 'text-[10px]' : 'text-xs',
              )}
            >
              {activeAccount.account_number}
            </span>
            <span
              className={clsx(
                'font-extrabold uppercase rounded-sm shrink-0',
                compact ? 'text-[7px] px-1 py-0' : 'text-[8px] px-1 py-0.5',
                activeAccount.is_demo ? 'bg-warning/15 text-warning' : 'bg-buy/15 text-buy',
              )}
            >
              {activeAccount.is_demo ? 'Demo' : 'Live'}
            </span>
          </>
        ) : (
          <>
            <Wallet className={compact ? 'w-3 h-3 text-text-tertiary' : 'w-3.5 h-3.5 text-text-tertiary'} />
            <span className={clsx('text-text-tertiary font-semibold', compact ? 'text-[10px]' : 'text-xs')}>
              No account
            </span>
          </>
        )}
        <ChevronDown
          className={clsx(
            'text-text-tertiary group-hover:text-text-primary transition-transform',
            compact ? 'w-3 h-3' : 'w-3.5 h-3.5',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-72 max-w-[calc(100vw-2rem)] z-50
                     rounded-lg border border-border-primary bg-bg-secondary shadow-2xl
                     overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-border-glass bg-bg-base/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
              Switch Account
            </span>
            <span className="text-[10px] font-mono text-text-tertiary">
              {accounts.length} total
            </span>
          </div>

          {accounts.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <Wallet className="w-6 h-6 text-text-tertiary/40 mx-auto mb-2" />
              <p className="text-xs text-text-tertiary mb-3">No trading accounts yet</p>
              <Link
                href="/accounts"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-bold
                           bg-accent/15 text-accent hover:bg-accent/25 transition-colors"
              >
                <Plus className="w-3 h-3" /> Create account
              </Link>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto py-1">
              {accounts.map((acc) => {
                const isActive = acc.id === activeAccount?.id;
                const group = acc.account_group?.name;
                return (
                  <button
                    key={acc.id}
                    role="option"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => handleSwitch(acc)}
                    className={clsx(
                      'w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors',
                      isActive
                        ? 'bg-accent/10 border-l-2 border-accent'
                        : 'border-l-2 border-transparent hover:bg-bg-hover',
                    )}
                  >
                    <span
                      className={clsx(
                        'shrink-0 w-7 h-7 rounded-md flex items-center justify-center font-extrabold text-[10px]',
                        acc.is_demo
                          ? 'bg-warning/15 text-warning border border-warning/25'
                          : 'bg-buy/15 text-buy border border-buy/25',
                      )}
                    >
                      {acc.is_demo ? 'D' : 'L'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-extrabold text-[12px] text-text-primary tracking-tight truncate">
                          {acc.account_number}
                        </span>
                        {group ? (
                          <span className="text-[9px] font-semibold uppercase tracking-wide text-text-tertiary truncate">
                            {group}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-text-tertiary">
                          Bal:{' '}
                          <span className="text-text-secondary font-mono font-semibold">
                            {currencySymbol(acc.currency)}{fmtBalance(acc.balance)}
                          </span>
                        </span>
                        {typeof acc.leverage === 'number' ? (
                          <span className="text-[10px] text-text-tertiary">
                            Lev:{' '}
                            <span className="text-text-secondary font-mono font-semibold">
                              1:{acc.leverage}
                            </span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {isActive ? (
                      <Check className="w-4 h-4 text-accent shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}

          <div className="border-t border-border-glass">
            <Link
              href="/accounts"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold
                         text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <Wallet className="w-3 h-3" />
              Manage accounts
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
