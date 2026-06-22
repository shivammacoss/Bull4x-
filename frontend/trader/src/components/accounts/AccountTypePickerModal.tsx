'use client';

import { useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api/client';

export interface AvailableAccountGroup {
  id: string;
  name: string;
  description: string;
  leverage_default: number;
  minimum_deposit: number;
  spread_markup: number;
  commission_per_lot: number;
  swap_free: boolean;
}

function fmtMoney(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);
}

/** Build a list of common leverage tiers up to (and including) a given max. */
function leverageTiers(max: number): number[] {
  const common = [1, 2, 5, 10, 25, 50, 100, 200, 300, 400, 500, 1000];
  const tiers = common.filter((v) => v <= max);
  if (!tiers.includes(max)) tiers.push(max);
  return tiers.sort((a, b) => a - b);
}

type Step = 'type' | 'currency' | 'leverage';

type Mode = 'live' | 'demo';

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  /** Called after account is successfully created — parent should refetch accounts list. */
  onCreated?: (accountId: string) => void;
  /** Which mode the user is opening. 'demo' shows demo-only AccountGroups,
   *  skips the KYC gate on the backend, and auto-funds with virtual balance. */
  mode?: Mode;
};

export default function AccountTypePickerModal({ open, onClose, onCreated, mode = 'live' }: Props) {
  const isDemo = mode === 'demo';
  const [groups, setGroups] = useState<AvailableAccountGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('type');
  const [chosenCurrency, setChosenCurrency] = useState<string>('USD');
  const [chosenLeverage, setChosenLeverage] = useState<number | null>(null);

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedId) ?? null,
    [groups, selectedId],
  );

  const tiers = useMemo(
    () => (selectedGroup ? leverageTiers(selectedGroup.leverage_default) : []),
    [selectedGroup],
  );

  useEffect(() => {
    if (!open) return;
    setSelectedId(null);
    setStep('type');
    setChosenCurrency('USD');
    setChosenLeverage(null);
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await api.get<{ items: AvailableAccountGroup[] }>(
          '/accounts/available-groups',
          { is_demo: isDemo ? 'true' : 'false' },
        );
        if (cancelled) return;
        setGroups(Array.isArray(res.items) ? res.items : []);
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : 'Could not load account types');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, isDemo]);

  const goToCurrencyStep = () => {
    if (!selectedId || !selectedGroup) {
      toast.error('Select an account type');
      return;
    }
    setStep('currency');
  };

  const goToLeverageStep = () => {
    setChosenLeverage(selectedGroup?.leverage_default ?? null);
    setStep('leverage');
  };

  const handleCreate = async () => {
    if (!selectedId || !chosenLeverage) return;
    setCreating(true);
    try {
      const res = await api.post<{ id: string; account_number: string }>('/accounts/open', {
        account_group_id: selectedId,
        leverage: chosenLeverage,
        is_demo: isDemo,
        currency: chosenCurrency,
      });
      toast.success(isDemo ? 'Demo account created' : 'Trading account created');
      onClose();
      if (res?.id) {
        try {
          sessionStorage.setItem('ptd-accounts-expand', res.id);
        } catch {}
        onCreated?.(res.id);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'KYC_REQUIRED') {
        toast.error('Please complete KYC verification before opening a live account.');
        onClose();
      } else {
        toast.error(msg || 'Could not open account');
      }
    } finally {
      setCreating(false);
    }
  };

  const modalTitle = step === 'type'
    ? (isDemo ? 'Choose demo account type' : 'Choose account type')
    : step === 'currency'
      ? 'Select account currency'
      : 'Select leverage';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      width="2xl"
      className="border border-border-primary bg-bg-card max-h-[90vh] flex flex-col shadow-2xl"
      headerClassName="border-b border-border-primary bg-bg-card [&_h3]:text-text-primary [&_button]:text-text-tertiary [&_button:hover]:text-text-primary [&_button:hover]:bg-bg-hover"
      bodyClassName="bg-bg-card p-4 sm:p-5"
    >
      {/* ─── Step 1: Account type selection ─── */}
      {step === 'type' && (
        <div className="space-y-4">
          <p className="text-xs text-text-secondary leading-relaxed">
            {isDemo
              ? 'Demo accounts come pre-funded with virtual balance. Demo trades are kept separate from real trading and never affect your live equity.'
              : 'Pick the account that fits how you trade. You can open more accounts later from Accounts.'}
          </p>

          {loading ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-8 h-8 border-2 border-[#2196f3] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-text-secondary">Loading account types…</span>
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-xl border border-border-primary bg-bg-secondary p-6 text-center text-sm text-text-secondary">
              No account types are available yet. Please contact support.
            </div>
          ) : (
            <ul className="space-y-3 max-h-[min(60vh,420px)] overflow-y-auto pr-1">
              {groups.map((g) => {
                const isSel = selectedId === g.id;
                return (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(g.id)}
                      className={clsx(
                        'w-full text-left rounded-xl border-2 p-4 sm:p-5 transition-all',
                        isSel
                          ? 'border-[#2196f3] bg-[#2196f3]/[0.06] shadow-[0_0_0_3px_rgba(33,150,243,0.15)]'
                          : 'border-border-primary bg-bg-secondary hover:border-[#2196f3]/40 hover:bg-bg-hover',
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-bold text-text-primary">{g.name}</span>
                            {g.swap_free ? (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#2196f3]/15 text-[#2196f3] border border-[#2196f3]/25">
                                Swap-free
                              </span>
                            ) : null}
                          </div>
                          {g.description ? (
                            <p className="text-xs text-text-secondary leading-snug">{g.description}</p>
                          ) : null}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-2 pt-1 text-[11px]">
                            <div className="space-y-0.5">
                              <span className="block text-text-tertiary uppercase tracking-wider font-bold">
                                Min. balance
                              </span>
                              <span className="block text-text-primary font-mono font-bold tabular-nums text-sm">
                                {fmtMoney(g.minimum_deposit)}
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="block text-text-tertiary uppercase tracking-wider font-bold">
                                Max leverage
                              </span>
                              <span className="block text-text-primary font-mono font-bold tabular-nums text-sm">
                                1:{g.leverage_default}
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="block text-text-tertiary uppercase tracking-wider font-bold">
                                Commission / lot
                              </span>
                              <span className="block text-text-primary font-mono font-bold tabular-nums text-sm">
                                {g.commission_per_lot}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={clsx(
                            'shrink-0 mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                            isSel
                              ? 'border-[#2196f3] bg-[#2196f3]'
                              : 'border-border-secondary bg-bg-card',
                          )}
                        >
                          {isSel ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} /> : null}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-border-primary">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-border-primary bg-bg-card text-sm font-semibold text-text-primary hover:bg-bg-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading || groups.length === 0 || !selectedId}
              onClick={goToCurrencyStep}
              className="px-5 py-2.5 rounded-lg bg-[#2196f3] text-white text-sm font-bold hover:bg-[#1976d2] disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-[0_2px_8px_rgba(33,150,243,0.25)]"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Currency selection ─── */}
      {step === 'currency' && selectedGroup && (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => setStep('type')}
            className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to account types
          </button>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
              Account currency
            </label>
            <p className="text-[11px] text-text-tertiary leading-relaxed">
              Your account balance, P&amp;L, and margin will be shown in the selected currency. Market prices remain unchanged.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {CURRENCIES.map((c) => {
                const isSel = chosenCurrency === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setChosenCurrency(c.code)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-4 rounded-xl border-2 text-left transition-all',
                      isSel
                        ? 'border-[#2196f3] bg-[#2196f3]/[0.06] shadow-[0_0_0_3px_rgba(33,150,243,0.15)]'
                        : 'border-border-primary bg-bg-secondary hover:border-[#2196f3]/40 hover:bg-bg-hover',
                    )}
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-text-primary">{c.code}</span>
                        <span className="text-lg font-mono text-text-secondary">{c.symbol}</span>
                      </div>
                      <span className="text-[11px] text-text-tertiary">{c.label}</span>
                    </div>
                    <div
                      className={clsx(
                        'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                        isSel
                          ? 'border-[#2196f3] bg-[#2196f3]'
                          : 'border-border-secondary bg-bg-card',
                      )}
                    >
                      {isSel ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-border-primary">
            <button
              type="button"
              onClick={() => setStep('type')}
              className="px-5 py-2.5 rounded-lg border border-border-primary bg-bg-card text-sm font-semibold text-text-primary hover:bg-bg-hover transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goToLeverageStep}
              className="px-5 py-2.5 rounded-lg bg-[#2196f3] text-white text-sm font-bold hover:bg-[#1976d2] disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-[0_2px_8px_rgba(33,150,243,0.25)]"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3: Leverage selection ─── */}
      {step === 'leverage' && selectedGroup && (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => setStep('currency')}
            className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to currency
          </button>

          <div className="rounded-xl border-2 border-[#2196f3]/30 bg-[#2196f3]/[0.04] p-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-primary">{selectedGroup.name}</span>
              {selectedGroup.swap_free ? (
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-[#2196f3]/15 text-[#2196f3]">
                  Swap-free
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-text-tertiary">
              Currency: <span className="font-mono font-bold text-text-primary">{chosenCurrency}</span>
              {' · '}Max leverage: <span className="font-mono font-bold text-text-primary">1:{selectedGroup.leverage_default}</span>
              {' · '}Commission: <span className="font-mono font-bold text-text-primary">{selectedGroup.commission_per_lot}</span>
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
              Choose your leverage
            </label>
            <p className="text-[11px] text-text-tertiary leading-relaxed">
              Higher leverage increases both potential profit and risk. You can change this later when no positions are open.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
              {tiers.map((lev) => {
                const isSel = chosenLeverage === lev;
                const isMax = lev === selectedGroup.leverage_default;
                return (
                  <button
                    key={lev}
                    type="button"
                    onClick={() => setChosenLeverage(lev)}
                    className={clsx(
                      'relative px-3 py-3 rounded-lg border-2 text-center font-mono font-bold tabular-nums text-sm transition-all',
                      isSel
                        ? 'border-[#2196f3] bg-[#2196f3]/10 text-[#2196f3] shadow-[0_0_0_3px_rgba(33,150,243,0.15)]'
                        : 'border-border-primary bg-bg-secondary text-text-primary hover:border-[#2196f3]/40 hover:bg-bg-hover',
                    )}
                  >
                    1:{lev}
                    {isMax && (
                      <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-[#2196f3] text-white leading-none">
                        Max
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-border-primary">
            <button
              type="button"
              onClick={() => setStep('currency')}
              className="px-5 py-2.5 rounded-lg border border-border-primary bg-bg-card text-sm font-semibold text-text-primary hover:bg-bg-hover transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              disabled={creating || !chosenLeverage}
              onClick={() => void handleCreate()}
              className="px-5 py-2.5 rounded-lg bg-[#2196f3] text-white text-sm font-bold hover:bg-[#1976d2] disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-[0_2px_8px_rgba(33,150,243,0.25)]"
            >
              {creating ? 'Creating…' : `Open ${chosenCurrency} Account (1:${chosenLeverage})`}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
