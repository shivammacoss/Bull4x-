'use client';

import { useCallback, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import api from '@/lib/api/client';
import toast from 'react-hot-toast';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Monitor, Download, Key, Copy, RefreshCw, Trash2, Loader2,
  AlertTriangle, Check, Zap, ShieldCheck, CandlestickChart,
  HelpCircle, ListChecks,
} from 'lucide-react';

interface AccountWithKey {
  account_id: string;
  account_number: string;
  balance: number;
  equity: number;
  is_demo: boolean;
  currency: string;
  account_type: string;
  has_key: boolean;
  key_id: string | null;
  api_key: string | null;
  label: string;
  trades_count: number;
}

interface GeneratedKey {
  api_key: string;
  api_secret: string;
  account_number: string;
}

// Installer location — upload the built terminal here (or change the path).
const DOWNLOAD_URL = '/downloads/Bull4xTerminal-Setup.exe';

function fmt(n: number) { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

/** WebSocket tick-stream URL for the current host (api. subdomain in prod,
 *  gateway :8000 in local dev). Mirrors the Algo Connector logic. */
function deriveWsUrl(origin: string): string {
  if (!origin) return 'wss://api.<your-domain>/ws/algo/prices';
  try {
    const u = new URL(origin);
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1')
      return `ws://${u.hostname}:8000/ws/algo/prices`;
    const parts = u.hostname.split('.');
    if (parts[0] && ['trade', 'app', 'www'].includes(parts[0])) parts.shift();
    const proto = u.protocol === 'https:' ? 'wss' : 'ws';
    return `${proto}://api.${parts.join('.')}/ws/algo/prices`;
  } catch { return 'wss://api.<your-domain>/ws/algo/prices'; }
}

export default function DesktopTerminalPage() {
  const [accounts, setAccounts] = useState<AccountWithKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<GeneratedKey | null>(null);
  const [selectedAccId, setSelectedAccId] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ items: AccountWithKey[] }>('/algo/accounts');
      const items = res.items || [];
      setAccounts(items);
      if (!selectedAccId && items[0]) setSelectedAccId(items[0].account_id);
    } catch (e: any) { toast.error(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const selected = accounts.find(a => a.account_id === selectedAccId);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const restBase = origin ? `${origin}/api/algo` : '/api/algo';
  const wsBase = deriveWsUrl(origin);

  const generateKey = async (accountId: string) => {
    setActionLoading(accountId);
    try {
      const res = await api.post<GeneratedKey & { message: string }>('/algo/generate', { account_id: accountId });
      setGeneratedKey({ api_key: res.api_key, api_secret: res.api_secret, account_number: res.account_number });
      toast.success('API Key generated!');
      fetchData();
    } catch (e: any) { toast.error(e.message); }
    finally { setActionLoading(null); }
  };

  const revokeKey = async (keyId: string, accountNumber: string) => {
    if (!confirm(`Revoke the key for ${accountNumber}? The desktop terminal will disconnect from this account.`)) return;
    setActionLoading(keyId);
    try {
      await api.post('/algo/revoke', { key_id: keyId });
      toast.success('Key revoked');
      fetchData();
    } catch (e: any) { toast.error(e.message); }
    finally { setActionLoading(null); }
  };

  const copyText = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label || text);
    setTimeout(() => setCopied(null), 1500);
    toast.success('Copied to clipboard');
  };

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">

        {/* ─── Hero ─── */}
        <div className="relative overflow-hidden rounded-2xl border border-border-primary bg-card px-6 py-7 sm:px-8 sm:py-9 text-center shadow-sm">
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-accent/10 blur-2xl" />
          <div className="relative space-y-2.5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent text-white shadow-lg shadow-accent/25 mb-1">
              <Monitor size={26} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">Desktop Terminal</h1>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              A native Windows trading terminal with TradingView charts, a live watchlist and one-click
              order execution — powered by your Bull4x account.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                <CandlestickChart size={12} /> TradingView charts
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/25 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500">
                <Zap size={12} /> Live execution
              </span>
            </div>
          </div>
        </div>

        {/* ─── Download ─── */}
        <div className="rounded-2xl border border-border-primary bg-card shadow-sm p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-sm font-semibold text-text-primary flex items-center justify-center sm:justify-start gap-2">
              <Download size={14} className="text-accent" /> Get the Terminal
            </h2>
            <p className="text-xs text-text-tertiary mt-0.5">Windows 10/11 · 64-bit · installs in seconds.</p>
          </div>
          <a
            href={DOWNLOAD_URL}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors shadow-sm shadow-accent/25"
          >
            <Download size={16} /> Download for Windows
          </a>
        </div>

        {/* ─── Account + Generate Key ─── */}
        <div className="rounded-2xl border border-border-primary bg-card shadow-sm">
          <div className="px-5 py-4 border-b border-border-primary">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Key size={14} className="text-accent" /> Link a Trading Account
            </h2>
            <p className="text-xs text-text-tertiary mt-0.5">Generate the API key + secret you&apos;ll paste into the terminal.</p>
          </div>
          <div className="p-5 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-text-tertiary" /></div>
            ) : accounts.length === 0 ? (
              <p className="text-sm text-text-tertiary text-center py-8">No trading accounts found. Create one first.</p>
            ) : (
              <>
                <select
                  value={selectedAccId}
                  onChange={e => setSelectedAccId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border-primary bg-bg-input text-sm font-medium text-text-primary appearance-none cursor-pointer hover:border-accent/40 transition-colors focus:outline-none focus:border-accent/60"
                >
                  {accounts.map(a => (
                    <option key={a.account_id} value={a.account_id}>
                      {a.account_number} — {a.account_type}{a.is_demo ? ' (Demo)' : ''} — ${fmt(a.balance)}{a.has_key ? ' ✓ Linked' : ''}
                    </option>
                  ))}
                </select>

                {selected && (
                  selected.has_key ? (
                    <div className="rounded-lg border border-border-primary bg-bg-secondary/50 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-semibold text-green-500">Key active</span>
                      </div>
                      <div>
                        <label className="text-xs text-text-tertiary block mb-1.5">API Key</label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs bg-bg-input border border-border-primary rounded-lg px-3 py-2.5 font-mono text-text-primary truncate">{selected.api_key}</code>
                          <button
                            onClick={() => copyText(selected.api_key || '', 'key')}
                            className={clsx('px-3 py-2.5 rounded-lg border text-xs font-medium transition-all',
                              copied === 'key' ? 'border-green-500/40 bg-green-500/10 text-green-500' : 'border-border-primary bg-card text-text-secondary hover:text-text-primary hover:border-accent/40')}
                          >{copied === 'key' ? <Check size={14} /> : <Copy size={14} />}</button>
                        </div>
                      </div>
                      <p className="text-[11px] text-text-tertiary">
                        The secret is shown only once, at generation. Lost it? Regenerate below.
                      </p>
                      <div className="flex items-center gap-2 pt-2 border-t border-border-primary/50">
                        <button
                          onClick={() => generateKey(selected.account_id)}
                          disabled={actionLoading === selected.account_id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border-primary text-xs font-medium text-text-secondary hover:text-accent hover:border-accent/40 transition-colors"
                        >{actionLoading === selected.account_id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Regenerate</button>
                        <button
                          onClick={() => revokeKey(selected.key_id!, selected.account_number)}
                          disabled={actionLoading === selected.key_id!}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border-primary text-xs font-medium text-text-secondary hover:text-red-500 hover:border-red-500/40 transition-colors"
                        ><Trash2 size={12} /> Revoke</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => generateKey(selected.account_id)}
                      disabled={actionLoading === selected.account_id}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
                    >{actionLoading === selected.account_id ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />} Generate API Key</button>
                  )
                )}
              </>
            )}
          </div>
        </div>

        {/* ─── Step-by-step Setup Guide ─── */}
        <div className="rounded-2xl border border-border-primary bg-card shadow-sm">
          <div className="px-5 py-4 border-b border-border-primary">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <ListChecks size={14} className="text-accent" /> Setup Guide
            </h2>
            <p className="text-xs text-text-tertiary mt-0.5">Follow these 4 steps — takes about 2 minutes.</p>
          </div>
          <div className="p-5">
            <ol className="space-y-5">
              {[
                {
                  icon: Download, t: 'Download & install',
                  points: [
                    'Click the "Download for Windows" button above to get the installer.',
                    'Open the downloaded file and follow the installer (Windows 10 / 11, 64-bit).',
                    'If Windows SmartScreen shows a warning, click "More info" → "Run anyway".',
                  ],
                },
                {
                  icon: Key, t: 'Generate your API key',
                  points: [
                    'On this page, choose your trading account in the box above.',
                    'Click "Generate API Key" — a popup shows your API Key and API Secret.',
                    'Copy the Secret now — it is shown only once. Lost it? Just click Regenerate.',
                  ],
                },
                {
                  icon: ShieldCheck, t: 'Open the terminal & connect',
                  points: [
                    'Launch the terminal — a Connect box appears on first run.',
                    'Set "Connection" to Bull4x (the server addresses fill in automatically).',
                    'Paste your API Key and API Secret, then click Connect.',
                  ],
                },
                {
                  icon: Zap, t: 'Start trading',
                  points: [
                    'Your watchlist, live charts and account balance load instantly.',
                    'Click any instrument to chart it; set a lot size and hit BUY or SELL.',
                    'Open positions, pending orders and history show in the Trades panel at the bottom.',
                  ],
                },
              ].map((s, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white text-sm font-bold shrink-0">{i + 1}</span>
                    {i < 3 && <span className="w-px flex-1 bg-border-primary mt-1" />}
                  </div>
                  <div className="pb-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <s.icon size={15} className="text-accent" />
                      <h3 className="text-sm font-semibold text-text-primary">{s.t}</h3>
                    </div>
                    <ul className="space-y-1">
                      {s.points.map((p, j) => (
                        <li key={j} className="text-xs text-text-secondary leading-relaxed flex gap-2">
                          <span className="text-accent mt-0.5">•</span><span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>

            {/* Server addresses (usually auto-filled) */}
            <div className="mt-6 pt-4 border-t border-border-primary space-y-2">
              <p className="text-xs text-text-tertiary">Server addresses (already pre-filled in the terminal — only change for a local server):</p>
              {[
                { label: 'REST base', value: restBase, id: 'rest-base' },
                { label: 'WebSocket', value: wsBase, id: 'ws-base' },
              ].map(row => (
                <div key={row.id}>
                  <label className="text-xs text-text-tertiary block mb-1">{row.label}</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-bg-input border border-border-primary rounded-lg px-3 py-2.5 font-mono text-text-primary truncate">{row.value}</code>
                    <button
                      onClick={() => copyText(row.value, row.id)}
                      className={clsx('px-3 py-2.5 rounded-lg border text-xs font-medium transition-all shrink-0',
                        copied === row.id ? 'border-green-500/40 bg-green-500/10 text-green-500' : 'border-border-primary bg-card text-text-secondary hover:text-text-primary hover:border-accent/40')}
                    >{copied === row.id ? <Check size={14} /> : <Copy size={14} />}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── FAQ / Troubleshooting ─── */}
        <div className="rounded-2xl border border-border-primary bg-card shadow-sm">
          <div className="px-5 py-4 border-b border-border-primary">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <HelpCircle size={14} className="text-accent" /> Help &amp; Troubleshooting
            </h2>
          </div>
          <div className="p-5 grid gap-3 sm:grid-cols-2">
            {[
              { q: 'Terminal says "Invalid credentials"', a: 'Copy the full API Key and Secret with no extra spaces, and make sure Connection is set to Bull4x.' },
              { q: 'I lost my API Secret', a: 'The Secret is shown only once. Come back to this page and click Regenerate — the old key stops working and you get a fresh pair.' },
              { q: 'The chart looks empty', a: 'Pick a liquid instrument such as EURUSD, XAUUSD or BTCUSD, and check your internet connection.' },
              { q: 'Is my key safe?', a: 'Your Secret is stored only on your own PC and sent directly to Bull4x over a secure (HTTPS) connection. Never share it with anyone.' },
              { q: 'Which Windows do I need?', a: 'Windows 10 or 11, 64-bit. The terminal installs in a few seconds.' },
              { q: 'Can I use more than one account?', a: 'Yes — generate a key per account and switch by pasting the other key in Settings.' },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-border-primary bg-bg-secondary/40 p-3">
                <p className="text-xs font-semibold text-text-primary mb-1">{f.q}</p>
                <p className="text-[11px] leading-snug text-text-tertiary">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Generated Secret Modal ─── */}
        {generatedKey && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setGeneratedKey(null)}>
            <div className="bg-card border border-border-primary rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><AlertTriangle size={20} className="text-amber-500" /></div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Save Your Credentials</h2>
                  <p className="text-xs text-text-tertiary">{generatedKey.account_number}</p>
                </div>
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <p className="text-xs text-amber-500 font-medium">The API Secret will NOT be shown again. Copy it into the terminal now.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1.5">API Key</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-bg-input border border-border-primary rounded-lg px-3 py-2.5 font-mono text-text-primary break-all select-all">{generatedKey.api_key}</code>
                    <button onClick={() => copyText(generatedKey.api_key, 'modal-key')} className={clsx('px-3 py-2.5 rounded-lg border text-xs font-medium transition-all shrink-0', copied === 'modal-key' ? 'border-green-500/40 bg-green-500/10 text-green-500' : 'border-border-primary bg-card text-text-secondary hover:text-text-primary hover:border-accent/40')}>{copied === 'modal-key' ? <Check size={14} /> : <Copy size={14} />}</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-red-400 block mb-1.5">API Secret</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2.5 font-mono text-red-400 break-all select-all">{generatedKey.api_secret}</code>
                    <button onClick={() => copyText(generatedKey.api_secret, 'modal-secret')} className={clsx('px-3 py-2.5 rounded-lg border text-xs font-medium transition-all shrink-0', copied === 'modal-secret' ? 'border-green-500/40 bg-green-500/10 text-green-500' : 'border-border-primary bg-card text-text-secondary hover:text-text-primary hover:border-accent/40')}>{copied === 'modal-secret' ? <Check size={14} /> : <Copy size={14} />}</button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => copyText(`API Key: ${generatedKey.api_key}\nAPI Secret: ${generatedKey.api_secret}`, 'modal-both')}
                  className={clsx('py-2.5 rounded-lg border text-xs font-semibold transition-all', copied === 'modal-both' ? 'border-green-500/40 bg-green-500/10 text-green-500' : 'border-accent/30 bg-accent/10 text-accent hover:bg-accent/15')}
                >{copied === 'modal-both' ? <><Check size={12} className="inline mr-1" /> Copied!</> : <><Copy size={12} className="inline mr-1" /> Copy Both</>}</button>
                <button onClick={() => setGeneratedKey(null)} className="py-2.5 rounded-lg border border-border-primary bg-bg-secondary text-text-secondary text-xs font-semibold hover:bg-bg-hover transition-colors">I&apos;ve Saved It</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
