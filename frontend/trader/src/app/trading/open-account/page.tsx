'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { ArrowLeft } from 'lucide-react';
import { tradingTerminalUrl, setPersistedTradingAccountId } from '@/lib/tradingNav';

interface OpenAccountResponse {
  id: string;
  account_number: string;
  balance: number;
  account_group_id: string;
  account_group_name: string;
}

interface GroupItem {
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

function leverageTiers(max: number): number[] {
  const common = [1, 2, 5, 10, 25, 50, 100, 200, 300, 400, 500, 1000];
  const tiers = common.filter((v) => v <= max);
  if (!tiers.includes(max)) tiers.push(max);
  return tiers.sort((a, b) => a - b);
}

type Step = 'type' | 'leverage';

function OpenAccountPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('type');
  const [chosenLeverage, setChosenLeverage] = useState<number | null>(null);

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selected) ?? null,
    [groups, selected],
  );

  const tiers = useMemo(
    () => (selectedGroup ? leverageTiers(selectedGroup.leverage_default) : []),
    [selectedGroup],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<{ items: GroupItem[] }>('/accounts/available-groups');
        if (!cancelled) setGroups(Array.isArray(res.items) ? res.items : []);
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : 'Could not load account types');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const preselectId = searchParams.get('group');
  useEffect(() => {
    if (!preselectId || groups.length === 0) return;
    if (groups.some((g) => g.id === preselectId)) setSelected(preselectId);
  }, [preselectId, groups]);

  const goToLeverageStep = (groupId: string) => {
    setSelected(groupId);
    const g = groups.find((x) => x.id === groupId);
    if (g) {
      setChosenLeverage(g.leverage_default);
      setStep('leverage');
    }
  };

  const openAccount = async () => {
    if (!selected || !chosenLeverage) return;
    setOpening(selected);
    try {
      const res = await api.post<OpenAccountResponse>('/accounts/open', {
        account_group_id: selected,
        leverage: chosenLeverage,
      });
      toast.success('Trading account created — opening terminal…');
      if (res?.id) {
        setPersistedTradingAccountId(res.id);
        router.push(tradingTerminalUrl(res.id, { view: 'chart' }));
      } else {
        router.push('/trading');
      }
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not open account');
    } finally {
      setOpening(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-bg-primary">
      <div className="page-main max-w-3xl mx-auto py-6 sm:py-8 space-y-6">
        {/* ─── Step 1: Choose account type ─── */}
        {step === 'type' && (
          <>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-text-primary">Open live account</h1>
              <p className="text-xs sm:text-sm text-text-tertiary mt-1">
                Choose an account type configured by your broker. If a minimum opening amount is set and you already have
                funded live accounts, that amount is moved from your existing balances into this new account. Your first
                account opens at $0 until you deposit; you must meet the minimum balance before placing trades.
              </p>
            </div>

            {loading ? (
              <div className="text-sm text-text-tertiary py-12 text-center">Loading account types…</div>
            ) : groups.length === 0 ? (
              <div className="rounded-xl border border-border-glass bg-bg-secondary p-8 text-center text-sm text-text-tertiary">
                No account types are available yet. Please contact support.
              </div>
            ) : (
              <ul className="space-y-3">
                {groups.map((g) => {
                  const isSel = selected === g.id;
                  return (
                    <li
                      key={g.id}
                      className={clsx(
                        'rounded-xl border overflow-hidden transition-colors',
                        isSel ? 'border-buy bg-buy/5' : 'border-border-glass bg-bg-secondary',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(g.id)}
                        className="w-full text-left p-4 sm:p-5 space-y-2"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-text-primary">{g.name}</span>
                          {g.swap_free ? (
                            <span className="text-xxs font-bold uppercase px-2 py-0.5 rounded-full bg-buy/15 text-buy">
                              Swap-free
                            </span>
                          ) : null}
                        </div>
                        {g.description ? (
                          <p className="text-xxs sm:text-xs text-text-tertiary">{g.description}</p>
                        ) : null}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xxs text-text-tertiary">
                          <div>
                            Min. balance (to trade){' '}
                            <span className="text-text-primary font-mono">{fmtMoney(g.minimum_deposit)}</span>
                          </div>
                          <div>
                            Max leverage <span className="text-text-primary font-mono">1:{g.leverage_default}</span>
                          </div>
                          <div>
                            Commission / lot{' '}
                            <span className="text-text-primary font-mono">{g.commission_per_lot}</span>
                          </div>
                        </div>
                      </button>
                      {isSel ? (
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 flex flex-col sm:flex-row gap-2 sm:justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="md"
                            onClick={() => setSelected(null)}
                            className="sm:w-auto"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="md"
                            onClick={() => goToLeverageStep(g.id)}
                            className="sm:w-auto"
                          >
                            Continue — choose leverage
                          </Button>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {/* ─── Step 2: Choose leverage ─── */}
        {step === 'leverage' && selectedGroup && (
          <>
            <div>
              <button
                type="button"
                onClick={() => setStep('type')}
                className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors mb-3"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to account types
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-text-primary">Select leverage</h1>
              <p className="text-xs sm:text-sm text-text-tertiary mt-1">
                Choose the leverage for your <span className="font-bold text-text-primary">{selectedGroup.name}</span> account.
                Higher leverage increases both potential profit and risk. You can change this later when no positions are open.
              </p>
            </div>

            <div className="rounded-xl border-2 border-buy/30 bg-buy/5 p-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-primary">{selectedGroup.name}</span>
                {selectedGroup.swap_free ? (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-buy/15 text-buy">
                    Swap-free
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] text-text-tertiary">
                Max leverage: <span className="font-mono font-bold text-text-primary">1:{selectedGroup.leverage_default}</span>
                {' · '}Commission: <span className="font-mono font-bold text-text-primary">{selectedGroup.commission_per_lot}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                Choose your leverage
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                          ? 'border-buy bg-buy/10 text-buy shadow-[0_0_0_3px_rgba(33,150,243,0.15)]'
                          : 'border-border-glass bg-bg-secondary text-text-primary hover:border-buy/40 hover:bg-bg-hover',
                      )}
                    >
                      1:{lev}
                      {isMax && (
                        <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-buy text-white leading-none">
                          Max
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-3 border-t border-border-glass">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setStep('type')}
                className="sm:w-auto"
              >
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                loading={opening === selected}
                disabled={!chosenLeverage}
                onClick={() => void openAccount()}
                className="sm:w-auto"
              >
                {opening ? 'Creating…' : `Open Account (1:${chosenLeverage})`}
              </Button>
            </div>
          </>
        )}

        <p className="text-xxs text-text-tertiary">
          <Link href="/trading" className="text-buy hover:underline">
            Back to trading
          </Link>
          {' · '}
          <Link href="/dashboard" className="text-buy hover:underline">
            Dashboard
          </Link>
          {' · '}
          <Link href="/accounts" className="text-buy hover:underline">
            Accounts
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function OpenAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 overflow-y-auto bg-bg-primary">
          <div className="page-main max-w-3xl mx-auto py-6 sm:py-8">
            <div className="text-sm text-text-tertiary py-12 text-center">Loading…</div>
          </div>
        </div>
      }
    >
      <OpenAccountPageInner />
    </Suspense>
  );
}
