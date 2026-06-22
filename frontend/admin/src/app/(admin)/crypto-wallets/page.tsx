'use client';

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { adminApi, formatApiErrorDetail } from '@/lib/api';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';
import { Bitcoin, Edit2, Loader2, Plus, Trash2, X } from 'lucide-react';

interface CryptoWallet {
  id: string;
  coin: string;
  network: string;
  address: string;
  is_active: boolean;
  sort_order: number;
}

/** Common coin/network presets — admin can also type a custom coin/network. */
const PRESETS = [
  { coin: 'USDT', network: 'TRC20' },
  { coin: 'USDT', network: 'ERC20' },
  { coin: 'USDC', network: 'ERC20' },
  { coin: 'BTC', network: 'Bitcoin' },
  { coin: 'ETH', network: 'ERC20' },
  { coin: 'SOL', network: 'Solana' },
  { coin: 'XRP', network: 'XRP' },
];

const EMPTY = { coin: 'USDT', network: 'TRC20', address: '', is_active: true, sort_order: 0 };

export default function CryptoWalletsPage() {
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CryptoWallet | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CryptoWallet | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get<CryptoWallet[]>('/crypto-wallets');
      setWallets(Array.isArray(res) ? res : []);
    } catch (e) {
      toast.error(formatApiErrorDetail(e instanceof Error ? e.message : e) || 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setModalOpen(true);
  };

  const openEdit = (w: CryptoWallet) => {
    setEditing(w);
    setForm({ coin: w.coin, network: w.network, address: w.address, is_active: w.is_active, sort_order: w.sort_order || 0 });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.coin.trim() || !form.network.trim() || !form.address.trim()) {
      toast.error('Coin, network and address are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        coin: form.coin.trim().toUpperCase(),
        network: form.network.trim(),
        address: form.address.trim(),
        is_active: form.is_active,
        sort_order: Number(form.sort_order) || 0,
      };
      if (editing) {
        await adminApi.put(`/crypto-wallets/${editing.id}`, payload);
        toast.success('Wallet updated');
      } else {
        await adminApi.post('/crypto-wallets', payload);
        toast.success('Wallet added');
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e instanceof Error ? e.message : e) || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (w: CryptoWallet) => {
    try {
      await adminApi.put(`/crypto-wallets/${w.id}`, {
        coin: w.coin, network: w.network, address: w.address,
        is_active: !w.is_active, sort_order: w.sort_order || 0,
      });
      await load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e instanceof Error ? e.message : e) || 'Update failed');
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/crypto-wallets/${deleteTarget.id}`);
      toast.success('Wallet removed');
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e instanceof Error ? e.message : e) || 'Delete failed');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-accent" /> Crypto Wallets
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Deposit addresses users pay into. The QR is generated automatically from the address.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add wallet
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-text-tertiary" />
        </div>
      ) : wallets.length === 0 ? (
        <div className="rounded-xl border border-border-primary bg-bg-secondary p-10 text-center text-text-tertiary text-sm">
          No crypto wallets yet. Click “Add wallet” to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {wallets.map((w) => (
            <div key={w.id} className="rounded-xl border border-border-primary bg-bg-secondary p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-text-primary">{w.coin} · {w.network}</p>
                  <button
                    onClick={() => toggleActive(w)}
                    className={cn(
                      'mt-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full',
                      w.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-500/15 text-gray-400',
                    )}
                  >
                    {w.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(w)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-tertiary hover:text-accent">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(w)} className="p-1.5 rounded-md hover:bg-bg-hover text-text-tertiary hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="rounded-lg bg-white p-2.5">
                  <QRCodeCanvas value={w.address} size={120} />
                </div>
              </div>
              <p className="break-all font-mono text-[11px] text-text-secondary bg-bg-base/50 rounded-md px-2 py-1.5 border border-border-primary/60">
                {w.address}
              </p>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-border-primary bg-bg-secondary p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-text-primary">{editing ? 'Edit wallet' : 'Add crypto wallet'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 text-text-tertiary hover:text-text-primary"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={`${p.coin}-${p.network}`}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, coin: p.coin, network: p.network }))}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium border',
                    form.coin === p.coin && form.network === p.network
                      ? 'border-accent text-accent bg-accent/10'
                      : 'border-border-primary text-text-secondary hover:border-accent/40',
                  )}
                >
                  {p.coin}·{p.network}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Coin</label>
                <input value={form.coin} onChange={(e) => setForm((f) => ({ ...f, coin: e.target.value }))} placeholder="USDT" className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-base text-text-primary text-sm outline-none focus:border-accent/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-secondary">Network</label>
                <input value={form.network} onChange={(e) => setForm((f) => ({ ...f, network: e.target.value }))} placeholder="TRC20" className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-base text-text-primary text-sm outline-none focus:border-accent/50" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-secondary">Wallet address</label>
              <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Paste the deposit address" className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-base text-text-primary font-mono text-sm outline-none focus:border-accent/50" />
            </div>

            {form.address.trim() ? (
              <div className="flex flex-col items-center gap-1.5 pt-1">
                <div className="rounded-lg bg-white p-2.5"><QRCodeCanvas value={form.address.trim()} size={120} /></div>
                <span className="text-[10px] text-text-tertiary">QR preview (auto-generated)</span>
              </div>
            ) : null}

            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
              Active (shown to users)
            </label>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2 rounded-lg border border-border-primary text-text-secondary text-sm font-semibold hover:bg-bg-hover">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update' : 'Add wallet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border-primary bg-bg-secondary p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-text-primary">Remove wallet?</h2>
            <p className="text-sm text-text-secondary">
              {deleteTarget.coin} · {deleteTarget.network} will no longer be shown to users for deposits.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 rounded-lg border border-border-primary text-text-secondary text-sm font-semibold hover:bg-bg-hover">Cancel</button>
              <button onClick={doDelete} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:opacity-90">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
