'use client';



import { useState, useEffect } from 'react';

import { clsx } from 'clsx';

import toast from 'react-hot-toast';

import DashboardShell from '@/components/layout/DashboardShell';

import DemoLockGate from '@/components/demo/DemoLockGate';

import { useAuthStore } from '@/stores/authStore';

import api from '@/lib/api/client';



type TabId = 'ib' | 'sub-broker' | 'network';

async function copyText(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    return true;
  } catch {
    return false;
  }
}

function CopyPopup({ value, label, onClose }: { value: string; label: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[90vw] max-w-md rounded-2xl border border-accent/30 bg-card p-5 shadow-[0_0_40px_rgba(33,150,243,0.2)] animate-wallet-fund-enter-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Copied!</h3>
          <button type="button" onClick={onClose} className="text-text-tertiary hover:text-text-primary text-lg leading-none">&times;</button>
        </div>
        <p className="text-xxs text-text-tertiary mb-2">{label}</p>
        <div className="flex items-center gap-2 rounded-lg border border-border-primary bg-bg-secondary p-3">
          <span className="flex-1 text-xs font-mono text-accent break-all select-all">{value}</span>
          <button
            type="button"
            onClick={async () => {
              const ok = await copyText(value);
              if (ok) toast.success('Copied again!');
              else toast.error('Copy failed — try selecting manually');
            }}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border border-accent text-accent hover:bg-accent hover:text-black transition-colors"
          >
            Copy
          </button>
        </div>
        <p className="text-xxs text-text-tertiary mt-3 text-center">You can also long-press the text above to copy manually.</p>
      </div>
    </div>
  );
}



const TABS: { id: TabId; label: string }[] = [

  { id: 'ib', label: 'IB Program' },

  { id: 'sub-broker', label: 'Sub-Broker' },

  { id: 'network', label: 'My Network' },

];



function fmt(n: number) { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function fmtDate(d: string) { try { return new Date(d).toLocaleDateString(); } catch { return d; } }

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}



export default function BusinessPage() {

  const isDemo = useAuthStore((s) => s.user?.is_demo);

  const [tab, setTab] = useState<TabId>('ib');

  const tabIndex = TABS.findIndex((t) => t.id === tab);

  const slideIndex = tabIndex >= 0 ? tabIndex : 0;

  if (isDemo) {
    return (
      <DashboardShell>
        <DemoLockGate
          feature="Affiliates & IB rewards"
          description="IB commissions, sub-broker partnerships and network payouts require a real trading account. Register a live account to start earning."
        >
          <></>
        </DemoLockGate>
      </DashboardShell>
    );
  }



  return (

    <DashboardShell mainClassName="p-0 flex flex-col min-h-0 overflow-hidden">

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">

          <section className="relative overflow-hidden rounded-xl border border-border-primary bg-card mb-4 sm:mb-5">

            <div

              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.12] via-transparent to-accent/[0.05]"

              aria-hidden

            />

            <div className="relative z-10 px-4 sm:px-6 py-5 sm:py-8">

              <h1 className="text-xl sm:text-3xl font-bold text-text-primary mb-2 leading-tight">Business</h1>

            </div>

          </section>

          <div className="overflow-hidden rounded-xl border border-border-primary bg-card">

            <div className="relative flex min-h-[52px] border-b border-border-primary bg-card">

              <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>

                <div

                  className="absolute top-0 h-full w-1/3 transition-[transform] duration-500 ease-[cubic-bezier(0.34,1.45,0.64,1)] will-change-transform"

                  style={{ transform: `translate3d(${slideIndex * 100}%,0,0)` }}

                >

                  <div

                    className={clsx(

                      'absolute inset-x-1 top-0 h-full rounded-t-2xl border-2 border-b-0 border-accent bg-card-nested',

                      'animate-wallet-main-tab-glow',

                    )}

                  />

                </div>

              </div>

              {TABS.map((t) => {

                const active = tab === t.id;

                return (

                  <button

                    key={t.id}

                    type="button"

                    onClick={() => setTab(t.id)}

                    className={clsx(

                      'relative z-10 flex-1 min-w-0 border-0 bg-transparent py-3.5 px-1 sm:px-2 text-xs sm:text-sm font-semibold outline-none',

                      'transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/50',

                      active ? 'text-accent' : 'text-text-secondary hover:text-text-primary',

                    )}

                  >

                    {active ? (

                      <span className="relative inline-block animate-wallet-main-tab-text drop-shadow-[0_0_20px_rgba(33,150,243,0.7)]">

                        {t.label}

                      </span>

                    ) : (

                      <span className="relative inline-block truncate">{t.label}</span>

                    )}

                  </button>

                );

              })}

            </div>

            <div key={tab} className="bg-card-nested p-4 md:p-6 animate-wallet-fund-enter-lg min-h-[200px]">

              {tab === 'ib' && <IBTab />}

              {tab === 'sub-broker' && <SubBrokerTab />}

              {tab === 'network' && <NetworkTab />}

            </div>

          </div>

        </div>

      </div>

    </DashboardShell>

  );

}





function IBTab() {

  const [status, setStatus] = useState<any>(null);

  const [dashboard, setDashboard] = useState<any>(null);

  const [referrals, setReferrals] = useState<any[]>([]);

  const [commissions, setCommissions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [applying, setApplying] = useState(false);

  const [copyPopup, setCopyPopup] = useState<{ value: string; label: string } | null>(null);

  const [accounts, setAccounts] = useState<any[]>([]);

  const [selectedAccount, setSelectedAccount] = useState('');

  const [claiming, setClaiming] = useState(false);

  const [showClaimModal, setShowClaimModal] = useState(false);



  useEffect(() => {

    (async () => {

      try {

        const s = await api.get<any>('/business/status');

        setStatus(s);

        if (s.is_ib) {

          const [d, r, c] = await Promise.all([

            api.get<any>('/business/ib/dashboard'),

            api.get<any>('/business/ib/referrals'),

            api.get<any>('/business/ib/commissions'),

          ]);

          setDashboard(d);

          setReferrals(r.items || []);

          setCommissions(c.items || []);

        }

      } catch {} finally { setLoading(false); }

    })();

  }, []);



  const handleApply = async () => {

    setApplying(true);

    try {

      await api.post('/business/apply', {});

      toast.success('IB application submitted!');

      const s = await api.get<any>('/business/status');

      setStatus(s);

    } catch (e: any) { toast.error(e.message || 'Failed'); } finally { setApplying(false); }

  };



  if (loading) return <Spinner />;



  if (!status?.is_ib && status?.application_status === 'pending') {

    return (

      <div className="rounded-xl border border-border-primary bg-card p-6 sm:p-8 noise-texture text-center max-w-lg mx-auto">

        <div className="text-2xl mb-2">⏳</div>

        <h3 className="text-sm font-semibold text-text-primary">Application Pending</h3>

        <p className="text-xxs text-text-tertiary mt-1">Your IB application is under review by the admin team.</p>

      </div>

    );

  }



  if (!status?.is_ib) {

    return (

      <div className="rounded-xl border border-border-primary bg-card p-6 sm:p-10 noise-texture text-center space-y-5 max-w-2xl mx-auto">

        <h3 className="text-lg sm:text-xl font-bold text-text-primary">Become an Introducing Broker</h3>

        <button

          type="button"

          onClick={handleApply}

          disabled={applying}

          className={clsx(

            'w-full max-w-xs mx-auto px-6 py-3.5 rounded-xl text-sm font-bold transition-all border-2 border-accent',

            applying ? 'opacity-50 cursor-not-allowed' : 'bg-accent text-black hover:brightness-110 shadow-[0_0_24px_rgba(33,150,243,0.35)]',

          )}

        >

          {applying ? 'Submitting...' : 'Apply Now'}

        </button>

      </div>

    );

  }



  return (

    <div className="space-y-4">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        {[

          { label: 'Total Earned', value: `$${fmt(dashboard?.total_earned || 0)}`, color: 'text-success' },

          { label: 'Pending Payout', value: `$${fmt(dashboard?.pending_payout || 0)}`, color: 'text-warning' },

          { label: 'Referrals', value: String(dashboard?.total_referrals || 0), color: 'text-accent' },

          { label: 'Level', value: `L${dashboard?.level || 1}`, color: 'text-text-primary' },

        ].map(c => (

          <div key={c.label} className="rounded-xl border border-border-primary bg-card p-3 noise-texture">

            <p className="text-xxs text-text-tertiary">{c.label}</p>

            <p className={clsx('text-lg font-bold font-mono tabular-nums mt-0.5', c.color)}>{c.value}</p>

          </div>

        ))}

      </div>

      {(dashboard?.pending_payout || 0) > 0 && (
        <div className="rounded-xl border border-accent/30 bg-card p-4 noise-texture">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xxs text-text-tertiary">Pending Payout Available</p>
              <p className="text-xl font-bold font-mono text-warning mt-0.5">${fmt(dashboard.pending_payout)}</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  const accts = await api.get<any[]>('/business/ib/accounts');
                  setAccounts(accts || []);
                  if (accts?.length === 1) setSelectedAccount(accts[0].id);
                  setShowClaimModal(true);
                } catch { toast.error('Failed to load accounts'); }
              }}
              className="px-4 py-2.5 text-sm font-bold rounded-xl bg-accent text-black hover:brightness-110 transition-all shadow-[0_0_16px_rgba(33,150,243,0.3)]"
            >
              Claim Payout
            </button>
          </div>
        </div>
      )}

      {showClaimModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowClaimModal(false)}>
          <div className="w-[90vw] max-w-md rounded-2xl border border-accent/30 bg-card p-5 shadow-[0_0_40px_rgba(33,150,243,0.2)] animate-wallet-fund-enter-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Claim IB Payout</h3>
              <button type="button" onClick={() => setShowClaimModal(false)} className="text-text-tertiary hover:text-text-primary text-lg leading-none">&times;</button>
            </div>
            <p className="text-xs text-text-secondary mb-1">Amount: <span className="text-warning font-bold font-mono">${fmt(dashboard?.pending_payout || 0)}</span></p>
            <p className="text-xxs text-text-tertiary mb-3">Select the trading account to receive your IB earnings:</p>
            {accounts.length === 0 ? (
              <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger text-center">
                No live trading account found. Create a live account first to claim your payout.
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                  {accounts.map((a: any) => (
                    <label
                      key={a.id}
                      className={clsx(
                        'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                        selectedAccount === a.id
                          ? 'border-accent bg-accent/10'
                          : 'border-border-primary hover:border-accent/50',
                      )}
                    >
                      <input type="radio" name="claim-account" value={a.id} checked={selectedAccount === a.id} onChange={() => setSelectedAccount(a.id)} className="accent-accent" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary truncate">{a.label || `Account ${a.login}`}</p>
                        <p className="text-xxs text-text-tertiary">{a.currency} &middot; Balance: ${fmt(a.balance)}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!selectedAccount || claiming}
                  onClick={async () => {
                    setClaiming(true);
                    try {
                      const res = await api.post<any>('/business/ib/claim-payout', { account_id: selectedAccount });
                      toast.success(`$${fmt(res.amount)} credited to your account!`);
                      setShowClaimModal(false);
                      const [d, c] = await Promise.all([
                        api.get<any>('/business/ib/dashboard'),
                        api.get<any>('/business/ib/commissions'),
                      ]);
                      setDashboard(d);
                      setCommissions(c.items || []);
                    } catch (e: any) { toast.error(e.message || 'Payout failed'); }
                    finally { setClaiming(false); }
                  }}
                  className={clsx(
                    'w-full py-3 rounded-xl text-sm font-bold transition-all border-2 border-accent',
                    !selectedAccount || claiming
                      ? 'opacity-50 cursor-not-allowed'
                      : 'bg-accent text-black hover:brightness-110 shadow-[0_0_24px_rgba(33,150,243,0.35)]',
                  )}
                >
                  {claiming ? 'Processing...' : `Claim $${fmt(dashboard?.pending_payout || 0)}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {dashboard?.referral_link && (

        <div className="rounded-xl border border-border-primary bg-card p-4 noise-texture">

          <p className="text-xxs text-text-tertiary mb-2">Your Referral Link</p>

          <div className="flex items-center gap-2">

            <input type="text" readOnly value={dashboard.referral_link} className="flex-1 text-xs font-mono bg-bg-secondary border border-border-primary rounded-lg px-3 py-2 text-text-primary focus:outline-none" />

            <button type="button" onClick={async () => { const ok = await copyText(dashboard.referral_link); if (ok) { toast.success('Referral link copied!'); setCopyPopup({ value: dashboard.referral_link, label: 'Your Referral Link' }); } else { setCopyPopup({ value: dashboard.referral_link, label: 'Your Referral Link — copy manually' }); } }} className="shrink-0 px-3 py-2 text-xs font-semibold rounded-lg border border-accent text-accent hover:bg-accent hover:text-black transition-colors">Copy</button>

          </div>

          <div className="flex items-center gap-2 mt-2">
            <p className="text-xxs text-text-tertiary">Code: <span className="text-accent font-mono font-bold">{dashboard.referral_code}</span></p>
            <button type="button" onClick={async () => { const ok = await copyText(dashboard.referral_code); if (ok) { toast.success('Code copied!'); setCopyPopup({ value: dashboard.referral_code, label: 'Your Referral Code' }); } else { setCopyPopup({ value: dashboard.referral_code, label: 'Your Referral Code — copy manually' }); } }} className="px-2 py-0.5 text-xxs font-semibold rounded border border-accent/50 text-accent hover:bg-accent hover:text-black transition-colors">Copy</button>
          </div>

        </div>

      )}



      {referrals.length > 0 && (

        <div className="rounded-xl border border-border-primary bg-card noise-texture overflow-hidden">

          <div className="px-4 py-3 border-b border-border-primary"><h3 className="text-xs font-semibold text-text-primary">My Referrals</h3></div>

          <table className="w-full text-xs">

            <thead><tr className="border-b border-border-primary text-xxs text-text-tertiary">

              <th className="px-4 py-2 text-left">User</th><th className="px-4 py-2 text-left">Joined</th><th className="px-4 py-2 text-right">Balance</th>

            </tr></thead>

            <tbody>

              {referrals.map((r: any) => (

                <tr key={r.id} className="border-b border-border-primary/50 hover:bg-bg-hover/30">

                  <td className="px-4 py-2"><p className="text-text-primary">{r.referred_user?.name}</p><p className="text-xxs text-text-tertiary">{r.referred_user?.email}</p></td>

                  <td className="px-4 py-2 text-text-tertiary">{r.referred_user?.joined_at ? fmtDate(r.referred_user.joined_at) : '—'}</td>

                  <td className="px-4 py-2 text-right font-mono text-text-primary">${fmt(r.total_deposit || 0)}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}



      {commissions.length > 0 && (

        <div className="rounded-xl border border-border-primary bg-card noise-texture overflow-hidden">

          <div className="px-4 py-3 border-b border-border-primary"><h3 className="text-xs font-semibold text-text-primary">Commission History</h3></div>

          <table className="w-full text-xs">

            <thead><tr className="border-b border-border-primary text-xxs text-text-tertiary">

              <th className="px-4 py-2 text-left">From</th><th className="px-4 py-2 text-left">Type</th><th className="px-4 py-2 text-left">Level</th><th className="px-4 py-2 text-right">Amount</th><th className="px-4 py-2 text-right">Status</th>

            </tr></thead>

            <tbody>

              {commissions.map((c: any) => (

                <tr key={c.id} className="border-b border-border-primary/50 hover:bg-bg-hover/30">

                  <td className="px-4 py-2"><p className="text-text-primary">{c.source_user?.name}</p></td>

                  <td className="px-4 py-2 text-text-secondary capitalize">{c.commission_type?.replace('_', ' ')}</td>

                  <td className="px-4 py-2 text-text-secondary">L{c.mlm_level}</td>

                  <td className="px-4 py-2 text-right font-mono text-success">${fmt(c.amount || 0)}</td>

                  <td className="px-4 py-2 text-right"><span className={clsx('px-1.5 py-0.5 rounded text-xxs font-medium', c.status === 'paid' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning')}>{c.status}</span></td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

      {copyPopup && <CopyPopup value={copyPopup.value} label={copyPopup.label} onClose={() => setCopyPopup(null)} />}

    </div>

  );

}





function SubBrokerTab() {

  const [status, setStatus] = useState<any>(null);

  const [dashboard, setDashboard] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [applying, setApplying] = useState(false);

  const [companyName, setCompanyName] = useState('');

  const [copyPopup, setCopyPopup] = useState<{ value: string; label: string } | null>(null);

  const [sbAccounts, setSbAccounts] = useState<any[]>([]);

  const [sbSelectedAccount, setSbSelectedAccount] = useState('');

  const [sbClaiming, setSbClaiming] = useState(false);

  const [sbShowClaimModal, setSbShowClaimModal] = useState(false);



  useEffect(() => {

    (async () => {

      try {

        const s = await api.get<any>('/business/status');

        setStatus(s);

        if (s.is_ib) {

          try {

            const d = await api.get<any>('/business/sub-broker/dashboard');

            setDashboard(d);

          } catch {}

        }

      } catch {} finally { setLoading(false); }

    })();

  }, []);



  const handleApply = async () => {

    setApplying(true);

    try {

      await api.post('/business/apply-sub-broker', { company_name: companyName || undefined });

      toast.success('Sub-broker application submitted!');

      const s = await api.get<any>('/business/status');

      setStatus(s);

    } catch (e: any) { toast.error(e.message || 'Failed'); } finally { setApplying(false); }

  };



  if (loading) return <Spinner />;



  if (status?.application_status === 'pending') {

    return (

      <div className="rounded-xl border border-border-primary bg-card p-6 sm:p-8 noise-texture text-center max-w-lg mx-auto">

        <div className="text-2xl mb-2">⏳</div>

        <h3 className="text-sm font-semibold text-text-primary">Application Pending</h3>

        <p className="text-xxs text-text-tertiary mt-1">Your sub-broker application is under review.</p>

      </div>

    );

  }



  if (dashboard) {

    return (

      <div className="space-y-4">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {[

            { label: 'Clients', value: String(dashboard.direct_clients || 0), color: 'text-accent' },

            { label: 'Total Earned', value: `$${fmt(dashboard.total_earned || 0)}`, color: 'text-success' },

            { label: 'Pending', value: `$${fmt(dashboard.pending_payout || 0)}`, color: 'text-warning' },

            { label: 'Commission', value: `$${fmt(dashboard.total_commission || 0)}`, color: 'text-text-primary' },

          ].map(c => (

            <div key={c.label} className="rounded-xl border border-border-primary bg-card p-3 noise-texture">

              <p className="text-xxs text-text-tertiary">{c.label}</p>

              <p className={clsx('text-lg font-bold font-mono tabular-nums mt-0.5', c.color)}>{c.value}</p>

            </div>

          ))}

        </div>

        {(dashboard?.pending_payout || 0) > 0 && (
          <div className="rounded-xl border border-accent/30 bg-card p-4 noise-texture">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xxs text-text-tertiary">Pending Payout Available</p>
                <p className="text-xl font-bold font-mono text-warning mt-0.5">${fmt(dashboard.pending_payout)}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const accts = await api.get<any[]>('/business/ib/accounts');
                    setSbAccounts(accts || []);
                    if (accts?.length === 1) setSbSelectedAccount(accts[0].id);
                    setSbShowClaimModal(true);
                  } catch { toast.error('Failed to load accounts'); }
                }}
                className="px-4 py-2.5 text-sm font-bold rounded-xl bg-accent text-black hover:brightness-110 transition-all shadow-[0_0_16px_rgba(33,150,243,0.3)]"
              >
                Claim Payout
              </button>
            </div>
          </div>
        )}

        {sbShowClaimModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSbShowClaimModal(false)}>
            <div className="w-[90vw] max-w-md rounded-2xl border border-accent/30 bg-card p-5 shadow-[0_0_40px_rgba(33,150,243,0.2)] animate-wallet-fund-enter-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Claim Sub-Broker Payout</h3>
                <button type="button" onClick={() => setSbShowClaimModal(false)} className="text-text-tertiary hover:text-text-primary text-lg leading-none">&times;</button>
              </div>
              <p className="text-xs text-text-secondary mb-1">Amount: <span className="text-warning font-bold font-mono">${fmt(dashboard?.pending_payout || 0)}</span></p>
              <p className="text-xxs text-text-tertiary mb-3">Select the trading account to receive your earnings:</p>
              {sbAccounts.length === 0 ? (
                <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger text-center">
                  No live trading account found. Create a live account first to claim your payout.
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                    {sbAccounts.map((a: any) => (
                      <label
                        key={a.id}
                        className={clsx(
                          'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                          sbSelectedAccount === a.id
                            ? 'border-accent bg-accent/10'
                            : 'border-border-primary hover:border-accent/50',
                        )}
                      >
                        <input type="radio" name="sb-claim-account" value={a.id} checked={sbSelectedAccount === a.id} onChange={() => setSbSelectedAccount(a.id)} className="accent-accent" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text-primary truncate">{a.label || `Account ${a.login}`}</p>
                          <p className="text-xxs text-text-tertiary">{a.currency} &middot; Balance: ${fmt(a.balance)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={!sbSelectedAccount || sbClaiming}
                    onClick={async () => {
                      setSbClaiming(true);
                      try {
                        const res = await api.post<any>('/business/ib/claim-payout', { account_id: sbSelectedAccount });
                        toast.success(`$${fmt(res.amount)} credited to your account!`);
                        setSbShowClaimModal(false);
                        const d = await api.get<any>('/business/sub-broker/dashboard');
                        setDashboard(d);
                      } catch (e: any) { toast.error(e.message || 'Payout failed'); }
                      finally { setSbClaiming(false); }
                    }}
                    className={clsx(
                      'w-full py-3 rounded-xl text-sm font-bold transition-all border-2 border-accent',
                      !sbSelectedAccount || sbClaiming
                        ? 'opacity-50 cursor-not-allowed'
                        : 'bg-accent text-black hover:brightness-110 shadow-[0_0_24px_rgba(33,150,243,0.35)]',
                    )}
                  >
                    {sbClaiming ? 'Processing...' : `Claim $${fmt(dashboard?.pending_payout || 0)}`}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border-primary bg-card p-4 noise-texture">

          <p className="text-xxs text-text-tertiary mb-2">Your Referral Code</p>

          <div className="flex items-center gap-2">

            <span className="text-lg font-bold font-mono text-accent">{dashboard.referral_code}</span>

            <button type="button" onClick={async () => { const ok = await copyText(dashboard.referral_code); if (ok) { toast.success('Referral code copied!'); setCopyPopup({ value: dashboard.referral_code, label: 'Your Referral Code' }); } else { setCopyPopup({ value: dashboard.referral_code, label: 'Your Referral Code — copy manually' }); } }} className="px-2 py-1 text-xxs font-semibold rounded-lg border border-accent text-accent hover:bg-accent hover:text-black transition-colors">Copy</button>

          </div>

        </div>



        {dashboard.clients?.length > 0 && (

          <div className="rounded-xl border border-border-primary bg-card noise-texture overflow-hidden">

            <div className="px-4 py-3 border-b border-border-primary"><h3 className="text-xs font-semibold text-text-primary">Your Clients</h3></div>

            <table className="w-full text-xs">

              <thead><tr className="border-b border-border-primary text-xxs text-text-tertiary">

                <th className="px-4 py-2 text-left">Client</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-right">Balance</th><th className="px-4 py-2 text-left">Joined</th>

              </tr></thead>

              <tbody>

                {dashboard.clients.map((c: any) => (

                  <tr key={c.user_id} className="border-b border-border-primary/50 hover:bg-bg-hover/30">

                    <td className="px-4 py-2"><p className="text-text-primary">{c.name}</p><p className="text-xxs text-text-tertiary">{c.email}</p></td>

                    <td className="px-4 py-2"><span className={clsx('px-1.5 py-0.5 rounded text-xxs font-medium', c.status === 'active' ? 'bg-success/15 text-success' : 'bg-text-tertiary/15 text-text-tertiary')}>{c.status}</span></td>

                    <td className="px-4 py-2 text-right font-mono text-text-primary">${fmt(c.total_balance || 0)}</td>

                    <td className="px-4 py-2 text-text-tertiary">{c.joined_at ? fmtDate(c.joined_at) : '—'}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

        {copyPopup && <CopyPopup value={copyPopup.value} label={copyPopup.label} onClose={() => setCopyPopup(null)} />}

      </div>

    );

  }



  return (

    <div className="rounded-xl border border-border-primary bg-card p-6 sm:p-10 noise-texture text-center space-y-5 max-w-2xl mx-auto">

      <h3 className="text-lg sm:text-xl font-bold text-text-primary">Become a Sub-Broker</h3>

      <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">Partner with us as a sub-broker. Get your own referral code, manage clients, and earn revenue share on all their trading activity.</p>

      <div className="max-w-sm mx-auto text-left">

        <label className="text-xxs text-text-secondary block mb-1">Company Name (optional)</label>

        <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your company name" className="skeu-input w-full text-text-primary rounded-xl py-2.5 px-4 text-xs border-border-primary focus:border-accent focus:ring-1 focus:ring-accent/30" />

      </div>

      <button

        type="button"

        onClick={handleApply}

        disabled={applying}

        className={clsx(

          'w-full max-w-xs mx-auto px-6 py-3.5 rounded-xl text-sm font-bold transition-all border-2 border-accent',

          applying ? 'opacity-50 cursor-not-allowed' : 'bg-accent text-black hover:brightness-110 shadow-[0_0_24px_rgba(33,150,243,0.35)]',

        )}

      >

        {applying ? 'Submitting...' : 'Apply as Sub-Broker'}

      </button>

    </div>

  );

}





function NetworkTab() {

  const [tree, setTree] = useState<any>(null);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    (async () => {

      try {

        const res = await api.get<any>('/business/ib/tree');

        setTree(res);

      } catch {}

      setLoading(false);

    })();

  }, []);



  if (loading) return <Spinner />;

  if (!tree) return <div className="rounded-xl border border-dashed border-border-primary bg-bg-secondary/50 py-16 px-4 text-center text-sm text-text-secondary max-w-lg mx-auto">You need to be an approved IB to see your network.</div>;



  return (

    <div className="space-y-4">

      <div className="rounded-xl border border-border-primary bg-card p-4 noise-texture">

        <div className="flex items-center justify-between mb-3">

          <h3 className="text-sm font-semibold text-text-primary">Your MLM Network</h3>

          <span className="text-xxs text-text-tertiary">{tree.total_nodes || 0} members</span>

        </div>

        <div className="flex items-center gap-3 text-xs">

          <span className="text-text-tertiary">Your Code: <span className="text-accent font-mono font-bold">{tree.root?.referral_code}</span></span>

          <span className="text-text-tertiary">Level: <span className="text-text-primary font-bold">L{tree.root?.level}</span></span>

          <span className="text-text-tertiary">Total Earned: <span className="text-success font-mono font-bold">${fmt(tree.root?.total_earned || 0)}</span></span>

        </div>

      </div>



      {tree.tree?.length > 0 ? (

        <div className="rounded-xl border border-border-primary bg-card p-4 noise-texture">

          <h4 className="text-xs font-semibold text-text-primary mb-3">Downline Tree</h4>

          <div className="space-y-1">

            {tree.tree.map((node: any) => <TreeNode key={node.id} node={node} depth={0} />)}

          </div>

        </div>

      ) : (

        <div className="text-center py-8 text-xs text-text-tertiary">No downline members yet. Share your referral link to grow your network.</div>

      )}

    </div>

  );

}





function TreeNode({ node, depth }: { node: any; depth: number }) {

  const [expanded, setExpanded] = useState(depth < 2);

  const hasChildren = node.children?.length > 0;



  return (

    <div style={{ marginLeft: depth * 20 }}>

      <button onClick={() => hasChildren && setExpanded(!expanded)} className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded hover:bg-bg-hover/30 transition-fast text-xs">

        {hasChildren ? (

          <span className="text-text-tertiary">{expanded ? '▼' : '▶'}</span>

        ) : (

          <span className="text-text-tertiary ml-1">•</span>

        )}

        <span className="text-text-primary font-medium">{node.name || node.email}</span>

        <span className="text-xxs text-accent font-mono">L{node.depth}</span>

        <span className="text-xxs text-text-tertiary ml-auto font-mono">${fmt(node.total_earned || 0)}</span>

        {!node.is_active && <span className="text-xxs px-1 py-0.5 rounded bg-danger/15 text-danger">inactive</span>}

      </button>

      {expanded && hasChildren && node.children.map((child: any) => (

        <TreeNode key={child.id} node={child} depth={depth + 1} />

      ))}

    </div>

  );

}

