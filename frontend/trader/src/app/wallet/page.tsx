'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import DashboardShell from '@/components/layout/DashboardShell';
import DemoLockGate from '@/components/demo/DemoLockGate';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api/client';
import { useFxRate } from '@/hooks/useFxRate';
import { usePaymentLimits, formatLimitsHint } from '@/hooks/usePaymentLimits';
import { FxRateBadge, InrConversion } from '@/components/wallet/InrConversion';
import { currencySymbol } from '@/lib/currency';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet as WalletIcon,
  Clock,
  RefreshCcw,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  X,
  Copy,
  Check,
  Info,
  Smartphone,
  Landmark,
} from 'lucide-react';

interface AccountItem {
  id: string;
  currency?: string;
  is_demo?: boolean;
  balance?: number;
}

interface LiveAccountRow {
  id: string;
  account_number: string;
  balance: number;
  credit?: number;
  margin_used?: number;
  currency?: string;
  free_margin?: number;
}

interface WalletData {
  balance: number;
  currency: string;
  main_wallet_balance: number;
  total_deposited: number;
  total_withdrawn: number;
  pending_withdrawals: number;
  pending_deposits?: number;
  available_for_withdrawal?: number;
  total_live_balance?: number;
}

interface WalletSummaryResponse {
  balance?: number;
  credit?: number;
  equity?: number;
  main_wallet_balance?: number;
  total_deposited?: number;
  total_withdrawn?: number;
  pending_withdrawals?: number;
  pending_deposits?: number;
  available_for_withdrawal?: number;
  total_live_balance?: number;
  live_accounts?: LiveAccountRow[];
}

interface WalletListItem {
  id: string;
  created_at: string | null;
  type: string;
  method: string;
  amount: number;
  status: string;
  currency: string;
}

const DEMO_FUNDING_MSG =
  'Demo accounts cannot deposit, withdraw, or transfer funds. Open a live account to use wallet funding.';

/** Fixed coin/network options for crypto withdrawals. Value matches the backend
 *  crypto_network format ("COIN-NETWORK"). */
const CRYPTO_NETWORKS = [
  { value: 'USDT-TRC20', label: 'USDT · TRC20' },
  { value: 'USDT-ERC20', label: 'USDT · ERC20' },
  { value: 'USDC-ERC20', label: 'USDC · ERC20' },
  { value: 'BTC-Bitcoin', label: 'BTC · Bitcoin' },
  { value: 'ETH-ERC20', label: 'ETH · ERC20' },
  { value: 'SOL-Solana', label: 'SOL · Solana' },
  { value: 'XRP-XRP', label: 'XRP · XRP' },
] as const;

type FundingChannel = 'crypto' | 'manual';

interface CryptoWallet {
  id: string;
  coin: string;
  network: string;
  address: string;
  label: string;
}

interface ManualBankDetailsResponse {
  bank_name?: string;
  account_holder?: string;
  account_number?: string;
  ifsc_code?: string;
  upi_id?: string;
  qr_code_url?: string;
}

/**
 * Click-to-copy row for bank/UPI details on the deposit screen.
 * Shows label + value, button switches to a green tick for 1.4s after copy.
 * `wide` lets the row span two columns (used for UPI which can be long).
 */
function CopyField({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for older / insecure-context browsers.
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      toast.success(`${label} copied`);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error('Could not copy — long-press to copy manually');
    }
  };

  return (
    <div
      className={clsx(
        'group flex items-start justify-between gap-2 rounded-lg border border-border-primary/60 bg-bg-base/40 px-2.5 py-2 min-w-0',
        wide && 'sm:col-span-2',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-text-tertiary font-sans text-[10px] uppercase tracking-wide leading-tight">
          {label}
        </p>
        <p className="break-all font-mono text-text-primary text-xs sm:text-[13px] font-semibold mt-0.5">
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
        className={clsx(
          'shrink-0 mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-md border transition-all',
          copied
            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
            : 'border-border-primary text-text-tertiary hover:text-[#2196f3] hover:border-[#2196f3]/40 hover:bg-[#2196f3]/8',
        )}
      >
        {copied ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function WalletPageContent() {
  const isDemo = useAuthStore((s) => s.user?.is_demo);
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountFromUrl = searchParams.get('account');
  const withdrawDeepLinkHandled = useRef(false);

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [liveAccounts, setLiveAccounts] = useState<LiveAccountRow[]>([]);
  /** True when user has accounts but none are live (all demo) — block deposits, withdrawals, transfers. */
  const [demoFundingBlocked, setDemoFundingBlocked] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadGen = useRef(0);
  const fundPanelRef = useRef<HTMLDivElement>(null);

  const [fundMainTab, setFundMainTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [depositUiSection, setDepositUiSection] = useState<'crypto' | 'manual'>('crypto');
  const [withdrawUiSection, setWithdrawUiSection] = useState<'crypto' | 'bank'>('crypto');

  // Live USD→INR conversion is only shown on the UPI / manual tab (India-only payment).
  // The hook stays idle on the crypto tab to avoid pointless polling.
  const fxEnabled =
    (fundMainTab === 'deposit' && depositUiSection === 'manual') ||
    (fundMainTab === 'withdraw' && withdrawUiSection === 'bank');
  const { rate: fxRate, loading: fxLoading, refresh: refreshFxRate } = useFxRate({ enabled: fxEnabled });

  // Admin-configured deposit / withdrawal bounds. Hint strings derived
  // here so each amount input can render them without recomputing.
  const { limits: paymentLimits } = usePaymentLimits();
  const depositLimitsHint = formatLimitsHint(paymentLimits.deposit_min, paymentLimits.deposit_max);
  const withdrawLimitsHint = formatLimitsHint(paymentLimits.withdrawal_min, paymentLimits.withdrawal_max);
  // Admin crypto deposit wallets + which one the user is paying into.
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  const [selectedCryptoWalletId, setSelectedCryptoWalletId] = useState<string>('');

  const [depositChannel, setDepositChannel] = useState<FundingChannel>('crypto');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositTxId, setDepositTxId] = useState('');
  const [depositProofFile, setDepositProofFile] = useState<File | null>(null);
  const [manualBankInfo, setManualBankInfo] = useState<ManualBankDetailsResponse | null>(null);
  const [depositSubmitting, setDepositSubmitting] = useState(false);
  // Synchronous gate — React state flips between render frames, so a fast
  // double-tap can fire two submit handlers before the button re-renders as
  // disabled. The ref blocks the second call immediately.
  const depositInFlightRef = useRef(false);

  const [withdrawChannel, setWithdrawChannel] = useState<FundingChannel>('crypto');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCryptoNetwork, setWithdrawCryptoNetwork] = useState<string>(CRYPTO_NETWORKS[0].value);
  const [withdrawCryptoAddress, setWithdrawCryptoAddress] = useState('');
  const [manualWithdrawUpi, setManualWithdrawUpi] = useState('');
  const [manualWithdrawBank, setManualWithdrawBank] = useState('');
  const [manualWithdrawAccNo, setManualWithdrawAccNo] = useState('');
  const [manualWithdrawIfsc, setManualWithdrawIfsc] = useState('');
  const [manualWithdrawQrFile, setManualWithdrawQrFile] = useState<File | null>(null);
  const [withdrawPayoutMethod, setWithdrawPayoutMethod] = useState<'upi' | 'bank'>('upi');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const withdrawInFlightRef = useRef(false);

  /** Compact card transfers: trading ↔ main */
  const [balanceTransfer, setBalanceTransfer] = useState<{
    mode: 'to_main' | 'to_trading';
    tradingAccountId: string | null;
  } | null>(null);
  const [balanceTransferPickId, setBalanceTransferPickId] = useState('');
  const [balanceTransferAmount, setBalanceTransferAmount] = useState('');
  const [balanceTransferBusy, setBalanceTransferBusy] = useState(false);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      const id = ++loadGen.current;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setLoadError(null);

      try {
        const [summaryRes, wdRes, accountsRes] = await Promise.allSettled([
          api.get<WalletSummaryResponse>('/wallet/summary'),
          api.get<{ items?: WalletListItem[] }>('/wallet/withdrawals'),
          api.get<{ items?: AccountItem[] }>('/accounts'),
        ]);

        if (id !== loadGen.current) return;

        let currency = 'USD';
        let balance = 0;
        let mainWalletBalance = 0;
        let totalDeposited = 0;
        let totalWithdrawn = 0;
        let pendingWdAmount = 0;
        let pendingDepAmount = 0;
        let availableForWithdrawal = 0;
        let totalLiveBalance: number | undefined;

        if (summaryRes.status === 'fulfilled' && summaryRes.value) {
          const s = summaryRes.value;
          const live = s.live_accounts || [];
          setLiveAccounts(live);
          mainWalletBalance = Number(s.main_wallet_balance) || 0;
          totalDeposited = Number(s.total_deposited) || 0;
          totalWithdrawn = Number(s.total_withdrawn) || 0;
          pendingWdAmount = Number(s.pending_withdrawals) || 0;
          pendingDepAmount = Number(s.pending_deposits) || 0;
          availableForWithdrawal =
            typeof s.available_for_withdrawal === 'number'
              ? s.available_for_withdrawal
              : Math.max(0, mainWalletBalance - pendingWdAmount);
          totalLiveBalance =
            typeof s.total_live_balance === 'number' ? s.total_live_balance : undefined;

          let targetId = selectedAccountId;
          if (!targetId || !live.some((a) => a.id === targetId)) {
            targetId =
              accountFromUrl && live.some((a) => a.id === accountFromUrl)
                ? accountFromUrl
                : live[0]?.id ?? null;
          }
          setSelectedAccountId(targetId);

          const sel = live.find((a) => a.id === targetId);
          balance = sel ? Number(sel.balance) || 0 : Number(s.balance) || 0;
          if (sel?.currency) currency = sel.currency;
        } else if (accountsRes.status === 'fulfilled') {
          const items = accountsRes.value?.items || [];
          const live = items.find((a) => a.is_demo === false) || items[0];
          if (live && typeof live.balance === 'number') balance = live.balance;
          if (summaryRes.status === 'rejected') {
            setLoadError('Wallet summary unavailable — balance from account only.');
            toast.error('Could not load wallet summary (totals may be incomplete).');
          }
        } else {
          const msg =
            summaryRes.status === 'rejected' && summaryRes.reason instanceof Error
              ? summaryRes.reason.message
              : 'Failed to load wallet';
          setLoadError(msg);
          toast.error(msg);
        }

        const wdItems =
          wdRes.status === 'fulfilled' ? wdRes.value?.items || [] : [];

        // Deposits always credit main wallet directly — no trading account required.
        setDemoFundingBlocked(false);

        if (wdRes.status === 'rejected') {
          toast.error('Could not load pending withdrawal count.');
        }

        const pendingWd = wdItems.filter(
          (w) => (w.status || '').toLowerCase() === 'pending',
        ).length;

        setWallet({
          balance,
          currency,
          main_wallet_balance: mainWalletBalance,
          total_deposited: totalDeposited,
          total_withdrawn: totalWithdrawn,
          pending_withdrawals: pendingWd,
          pending_deposits: pendingDepAmount,
          available_for_withdrawal: availableForWithdrawal,
          total_live_balance: totalLiveBalance,
        });
      } catch (err) {
        if (id !== loadGen.current) return;
        const message = err instanceof Error ? err.message : 'Failed to load wallet';
        setLoadError(message);
        toast.error(message);
        setDemoFundingBlocked(false);
        setWallet({
          balance: 0,
          currency: 'USD',
          main_wallet_balance: 0,
          total_deposited: 0,
          total_withdrawn: 0,
          pending_withdrawals: 0,
        });
      } finally {
        if (id === loadGen.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [selectedAccountId, accountFromUrl],
  );

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet?.currency || 'USD',
    }).format(n);

  const selectedCryptoWallet = cryptoWallets.find((w) => w.id === selectedCryptoWalletId) ?? null;

  useEffect(() => {
    setDepositChannel(depositUiSection === 'crypto' ? 'crypto' : 'manual');
  }, [depositUiSection]);

  useEffect(() => {
    setWithdrawChannel(withdrawUiSection === 'crypto' ? 'crypto' : 'manual');
  }, [withdrawUiSection]);

  // Load admin crypto deposit wallets when the crypto deposit tab is shown.
  useEffect(() => {
    if (fundMainTab !== 'deposit' || depositUiSection !== 'crypto') return;
    let cancelled = false;
    (async () => {
      try {
        const list = await api.get<CryptoWallet[]>('/wallet/crypto-wallets');
        if (cancelled) return;
        const wallets = Array.isArray(list) ? list : [];
        setCryptoWallets(wallets);
        setSelectedCryptoWalletId((prev) =>
          prev && wallets.some((w) => w.id === prev) ? prev : (wallets[0]?.id ?? ''),
        );
      } catch {
        if (!cancelled) setCryptoWallets([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fundMainTab, depositUiSection]);

  const loadManualBankDetails = useCallback(async () => {
    try {
      const amt = parseFloat(depositAmount);
      const body =
        !Number.isNaN(amt) && amt > 0 ? { amount: amt } : {};
      const d = await api.post<ManualBankDetailsResponse>('/wallet/deposit/bank-details', body);
      setManualBankInfo(d && Object.keys(d).length > 0 ? d : null);
    } catch {
      setManualBankInfo(null);
    }
  }, [depositAmount]);

  const scrollToFundPanel = () => {
    requestAnimationFrame(() => {
      fundPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const openDepositModal = () => {
    if (demoFundingBlocked) {
      toast.error(DEMO_FUNDING_MSG);
      return;
    }
    setDepositAmount('');
    setDepositTxId('');
    setDepositProofFile(null);
    setDepositUiSection('crypto');
    setManualBankInfo(null);
    setFundMainTab('deposit');
    scrollToFundPanel();
  };

  const openWithdrawModal = () => {
    if (demoFundingBlocked) {
      toast.error(DEMO_FUNDING_MSG);
      return;
    }
    setWithdrawAmount('');
    setWithdrawCryptoAddress('');
    setWithdrawUiSection('crypto');
    setManualWithdrawUpi('');
    setManualWithdrawBank('');
    setManualWithdrawAccNo('');
    setManualWithdrawIfsc('');
    setManualWithdrawQrFile(null);
    setFundMainTab('withdraw');
    scrollToFundPanel();
  };

  useEffect(() => {
    if (fundMainTab !== 'deposit' || depositUiSection !== 'manual') return;
    void loadManualBankDetails();
  }, [fundMainTab, depositUiSection, loadManualBankDetails]);

  /** Open withdraw modal from main wallet (?action=withdraw); external payouts use main balance only. */
  useEffect(() => {
    if (loading || withdrawDeepLinkHandled.current) return;
    const act = searchParams.get('action');
    if (!act || act.toLowerCase() !== 'withdraw') return;
    if (demoFundingBlocked) {
      withdrawDeepLinkHandled.current = true;
      toast.error(DEMO_FUNDING_MSG);
      const next = new URLSearchParams(searchParams.toString());
      next.delete('action');
      const qs = next.toString();
      router.replace(qs ? `/wallet?${qs}` : '/wallet', { scroll: false });
      return;
    }
    withdrawDeepLinkHandled.current = true;
    setFundMainTab('withdraw');
    setWithdrawUiSection('crypto');
    setWithdrawAmount('');
    setWithdrawCryptoAddress('');
    setManualWithdrawUpi('');
    setManualWithdrawBank('');
    setManualWithdrawAccNo('');
    setManualWithdrawIfsc('');
    setManualWithdrawQrFile(null);
    scrollToFundPanel();
    const next = new URLSearchParams(searchParams.toString());
    next.delete('action');
    const qs = next.toString();
    router.replace(qs ? `/wallet?${qs}` : '/wallet', { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once when deep-linked
  }, [loading, searchParams, router, demoFundingBlocked]);

  const submitWithdraw = async () => {
    if (withdrawInFlightRef.current) return; // gate fast double-taps
    if (demoFundingBlocked) {
      toast.error(DEMO_FUNDING_MSG);
      return;
    }
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    // Pre-flight against latest known available balance so the user gets a
    // clear local message instead of waiting for the API to reject.
    const avail = wallet?.available_for_withdrawal ?? wallet?.main_wallet_balance ?? 0;
    if (amt > avail + 0.005) {
      const pending = wallet?.pending_withdrawals ?? 0;
      const balance = wallet?.main_wallet_balance ?? 0;
      toast.error(
        pending > 0
          ? `Available: $${avail.toFixed(2)} ($${balance.toFixed(2)} balance − pending withdrawals).`
          : `Insufficient main wallet balance. Available: $${avail.toFixed(2)}.`,
      );
      return;
    }
    withdrawInFlightRef.current = true;
    try {
      if (withdrawChannel === 'crypto') {
        const addr = withdrawCryptoAddress.trim();
        if (!addr) {
          toast.error('Enter your crypto wallet address');
          return;
        }
        if (!manualWithdrawQrFile) {
          toast.error('Upload your wallet QR image');
          return;
        }
        setWithdrawSubmitting(true);
        try {
          const fd = new FormData();
          fd.append('amount', String(amt));
          fd.append('crypto_address', addr);
          fd.append('crypto_network', withdrawCryptoNetwork);
          fd.append('file', manualWithdrawQrFile);
          const token = api.getToken();
          const res = await fetch('/api/v1/wallet/withdraw/manual/', {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd,
          });
          const raw = await res.text();
          let json: { detail?: unknown } = {};
          try {
            json = raw ? JSON.parse(raw) : {};
          } catch {
            throw new Error(raw.slice(0, 200) || `Request failed (${res.status})`);
          }
          if (!res.ok) {
            const d = json.detail;
            throw new Error(
              typeof d === 'string'
                ? d
                : Array.isArray(d)
                  ? d.map((x: { msg?: string }) => x.msg).join(', ')
                  : 'Withdrawal failed',
            );
          }
          toast.success(`Crypto withdrawal of $${amt.toLocaleString()} submitted — pending approval`);
          setWithdrawAmount('');
          setWithdrawCryptoAddress('');
          setManualWithdrawQrFile(null);
          void fetchData(true);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Withdrawal failed');
        }
        return;
      }

      const upi = manualWithdrawUpi.trim();
      const accNo = manualWithdrawAccNo.trim();
      const ifsc = manualWithdrawIfsc.trim();
      const bankName = manualWithdrawBank.trim();

      if (withdrawPayoutMethod === 'upi') {
        if (!upi && !manualWithdrawQrFile) {
          toast.error('Enter your UPI ID and/or upload a QR code');
          return;
        }
      } else {
        if (!accNo || !ifsc || !bankName) {
          toast.error('Fill in account number, IFSC code, and bank name');
          return;
        }
      }

      setWithdrawSubmitting(true);
      try {
        const fd = new FormData();
        fd.append('amount', String(amt));
        fd.append('upi_id', withdrawPayoutMethod === 'upi' ? upi : '');
        // For bank transfer: pack account details into bank_name so the admin
        // sees the full payout info in one field. Backend stores it as-is.
        if (withdrawPayoutMethod === 'bank') {
          fd.append('bank_name', `${bankName} | A/C: ${accNo} | IFSC: ${ifsc}`);
        } else {
          fd.append('bank_name', bankName);
        }
        if (manualWithdrawQrFile) fd.append('file', manualWithdrawQrFile);
        const token = api.getToken();
        const res = await fetch('/api/v1/wallet/withdraw/manual/', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
        const raw = await res.text();
        let json: { detail?: unknown; message?: string } = {};
        try {
          json = raw ? JSON.parse(raw) : {};
        } catch {
          throw new Error(raw.slice(0, 200) || `Request failed (${res.status})`);
        }
        if (!res.ok) {
          const d = json.detail;
          const msg =
            typeof d === 'string'
              ? d
              : Array.isArray(d)
                ? d.map((x: { msg?: string }) => x.msg).join(', ')
                : 'Withdrawal failed';
          throw new Error(msg);
        }
        toast.success(`Manual withdrawal of $${amt.toLocaleString()} submitted — pending approval`);
        setWithdrawAmount('');
        setManualWithdrawUpi('');
        setManualWithdrawBank('');
        setManualWithdrawQrFile(null);
        void fetchData(true);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Withdrawal failed');
      }
    } finally {
      setWithdrawSubmitting(false);
      withdrawInFlightRef.current = false;
    }
  };

  const submitDeposit = async () => {
    if (depositInFlightRef.current) return; // gate fast double-taps
    if (demoFundingBlocked) {
      toast.error(DEMO_FUNDING_MSG);
      return;
    }
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    depositInFlightRef.current = true;
    try {
      if (depositChannel === 'crypto' && !selectedCryptoWalletId) {
        toast.error('Select a crypto wallet to deposit into');
        return;
      }
      if (!depositTxId.trim()) {
        toast.error(
          depositChannel === 'crypto'
            ? 'Enter your transaction hash / ID'
            : 'Enter your bank / UPI transaction or reference ID',
        );
        return;
      }
      if (!depositProofFile) {
        toast.error('Upload a screenshot of your payment');
        return;
      }
      setDepositSubmitting(true);
      try {
        const fd = new FormData();
        fd.append('amount', String(amt));
        fd.append('transaction_id', depositTxId.trim());
        fd.append('file', depositProofFile);
        if (depositChannel === 'crypto' && selectedCryptoWalletId) {
          fd.append('crypto_wallet_id', selectedCryptoWalletId);
        }
        const token = api.getToken();
        const res = await fetch('/api/v1/wallet/deposit/manual', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
          credentials: 'include',
        });
        const raw = await res.text();
        let json: { detail?: unknown; message?: string } = {};
        try {
          json = raw ? JSON.parse(raw) : {};
        } catch {
          throw new Error(raw.slice(0, 200) || `Request failed (${res.status})`);
        }
        if (!res.ok) {
          const d = json.detail;
          const msg =
            typeof d === 'string'
              ? d
              : Array.isArray(d)
                ? d.map((x: { msg?: string }) => x.msg).join(', ')
                : 'Deposit failed';
          throw new Error(msg);
        }
        toast.success(
          `Manual deposit of $${amt.toLocaleString()} submitted — pending approval`,
        );
        setDepositAmount('');
        setDepositTxId('');
        setDepositProofFile(null);
        void fetchData(true);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Deposit failed');
      }
    } finally {
      setDepositSubmitting(false);
      depositInFlightRef.current = false;
    }
  };

  const openTransferToMain = (tradingAccountId: string) => {
    if (demoFundingBlocked) {
      toast.error(DEMO_FUNDING_MSG);
      return;
    }
    setBalanceTransfer({ mode: 'to_main', tradingAccountId });
    setBalanceTransferAmount('');
  };

  const openTransferFromMain = (tradingAccountId: string | null) => {
    if (demoFundingBlocked) {
      toast.error(DEMO_FUNDING_MSG);
      return;
    }
    setBalanceTransfer({ mode: 'to_trading', tradingAccountId });
    setBalanceTransferAmount('');
    const pick =
      tradingAccountId ??
      (selectedAccountId && liveAccounts.some((a) => a.id === selectedAccountId)
        ? selectedAccountId
        : liveAccounts[0]?.id) ??
      '';
    setBalanceTransferPickId(pick);
  };

  const closeBalanceTransfer = () => {
    setBalanceTransfer(null);
    setBalanceTransferAmount('');
    setBalanceTransferBusy(false);
  };

  const submitBalanceTransfer = async () => {
    if (demoFundingBlocked) {
      toast.error(DEMO_FUNDING_MSG);
      return;
    }
    if (!balanceTransfer) return;
    const tradingId =
      balanceTransfer.mode === 'to_main'
        ? balanceTransfer.tradingAccountId
        : balanceTransfer.tradingAccountId ?? balanceTransferPickId;
    if (!tradingId) {
      toast.error('Select a trading account');
      return;
    }
    const amt = parseFloat(balanceTransferAmount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setBalanceTransferBusy(true);
    try {
      if (balanceTransfer.mode === 'to_main') {
        const res = await api.post<{ message?: string }>('/wallet/transfer-trading-to-main', {
          from_account_id: tradingId,
          amount: amt,
        });
        toast.success(res?.message || `$${amt.toLocaleString()} moved to main wallet`);
      } else {
        const res = await api.post<{ message?: string }>('/wallet/transfer-main-to-trading', {
          to_account_id: tradingId,
          amount: amt,
        });
        const num = liveAccounts.find((a) => a.id === tradingId)?.account_number ?? '';
        toast.success(res?.message || `$${amt.toLocaleString()} sent to ${num || 'trading account'}`);
      }
      closeBalanceTransfer();
      void fetchData(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Transfer failed');
      setBalanceTransferBusy(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell mainClassName="flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="w-8 h-8 border-2 border-[#2196f3] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-text-secondary">Loading wallet...</span>
        </div>
      </DashboardShell>
    );
  }

  if (isDemo) {
    return (
      <DashboardShell>
        <DemoLockGate
          feature="Deposits & Withdrawals"
          description="Funding is only available on real trading accounts. Register a live account to deposit, withdraw and transfer funds."
        >
          <></>
        </DemoLockGate>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell mainClassName="flex flex-col min-h-0 overflow-hidden p-0">
      <div className="dashboard-main-scroll flex-1 min-h-0 min-w-0 overflow-y-auto bg-bg-base">
        <div className="w-full max-w-full space-y-4 sm:space-y-6 px-2.5 sm:px-4 py-3 sm:py-4 pb-24 md:px-6 md:py-6">
          {/* Crucial-ui style page header */}
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-text-primary">Wallet</h1>
              <p className="text-sm text-text-secondary mt-1 max-w-xl">
                Manage deposits and withdrawals. Approved funds credit your main wallet.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void fetchData(true)}
              disabled={refreshing}
              className={clsx(
                'p-2 rounded-lg bg-card border border-border-primary hover:bg-bg-hover transition-all active:scale-95 shrink-0',
                refreshing && 'animate-spin cursor-not-allowed opacity-50',
              )}
              aria-label="Refresh wallet"
            >
              <RefreshCcw className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          {loadError && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-text-primary">
              {loadError}
            </div>
          )}

          {demoFundingBlocked && (
            <div className="rounded-xl border border-sell/30 bg-sell/10 px-3 py-2.5 text-xs text-text-primary">
              <p className="font-bold text-sell">Demo account — funding disabled</p>
              <p className="text-text-secondary mt-1 leading-relaxed">{DEMO_FUNDING_MSG}</p>
            </div>
          )}

          {/* ── Account Cards Grid ── */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {/* ── Main Wallet Card ── */}
              <div
                className="relative group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-accent)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-[60px] bg-[#2196f3]/[0.04] group-hover:bg-[#2196f3]/[0.08] transition-colors duration-500" />
                <div className="relative p-3 sm:p-4 md:p-5 flex flex-col gap-2.5 sm:gap-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#2196f3]/25"
                      style={{ background: 'linear-gradient(135deg, rgba(33,150,243,0.18) 0%, rgba(33,150,243,0.05) 100%)' }}
                    >
                      <WalletIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#2196f3]" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 6px rgba(33,150,243,0.5))' }} />
                    </div>
                    {(wallet?.pending_withdrawals ?? 0) > 0 && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                        {wallet?.pending_withdrawals} pending
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#2196f3]/60 mb-0.5 sm:mb-1">Main Wallet</p>
                    <p className="text-sm sm:text-lg md:text-xl font-bold tabular-nums font-mono text-text-primary truncate">
                      {fmt(wallet?.main_wallet_balance ?? 0)}
                    </p>
                  </div>
                  {liveAccounts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => openTransferFromMain(liveAccounts.length === 1 ? liveAccounts[0].id : null)}
                      disabled={demoFundingBlocked}
                      title="Add to trading account"
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-bold transition-all bg-[#2196f3]/10 text-[#2196f3] border border-[#2196f3]/20 hover:bg-[#2196f3]/20 hover:border-[#2196f3]/40 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ArrowUpFromLine className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                      To Trading
                    </button>
                  )}
                </div>
              </div>

              {/* ── Live Account Cards ── */}
              {liveAccounts.map((a) => {
                const cur = a.currency || wallet?.currency || 'USD';
                const bal = Number(a.balance) || 0;
                const line = new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(bal);
                const isSel = a.id === selectedAccountId;
                const num = a.account_number || '';
                const isManaged = num.startsWith('IF') || num.startsWith('CF');
                const isPool = num.startsWith('PM') || num.startsWith('MM') || num.startsWith('CT');
                const cardLabel = num.startsWith('IF') ? 'PAMM Investment'
                  : num.startsWith('CF') ? 'Copy Trade Account'
                  : num.startsWith('PM') ? 'PAMM Master Pool'
                  : num.startsWith('CT') ? 'Copy Master Pool'
                  : num;
                const ac = isManaged ? { r: '245,158,11', hex: '#f59e0b' } : isPool ? { r: '168,85,247', hex: '#a855f7' } : { r: '33,150,243', hex: '#2196f3' };

                return (
                  <div
                    key={a.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Trading account ${num}`}
                    onClick={() => setSelectedAccountId(a.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedAccountId(a.id); } }}
                    className={clsx(
                      'relative group rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer outline-none hover:scale-[1.02]',
                      isSel && 'ring-2 ring-[#2196f3]/30',
                    )}
                    style={{
                      background: 'var(--bg-card)',
                      border: `1px solid rgba(${ac.r},${isSel ? 0.35 : 0.15})`,
                      boxShadow: isSel ? `0 2px 12px rgba(${ac.r},0.1)` : '0 2px 12px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-[60px] transition-colors duration-500"
                      style={{ background: `rgba(${ac.r},0.03)` }}
                    />
                    <div className="relative p-3 sm:p-4 md:p-5 flex flex-col gap-2.5 sm:gap-3">
                      <div className="flex items-center justify-between">
                        <div
                          className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, rgba(${ac.r},0.18) 0%, rgba(${ac.r},0.05) 100%)`, border: `1px solid rgba(${ac.r},0.22)` }}
                        >
                          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} style={{ color: ac.hex, filter: `drop-shadow(0 0 6px rgba(${ac.r},0.5))` }} />
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-0.5 sm:mb-1 truncate" style={{ color: `rgba(${ac.r},0.6)` }}>
                          {cardLabel}
                        </p>
                        <p className="text-sm sm:text-lg md:text-xl font-bold tabular-nums font-mono text-text-primary truncate">{line}</p>
                      </div>
                      {!isManaged ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openTransferToMain(a.id); }}
                            disabled={demoFundingBlocked}
                            title="Move to main wallet"
                            className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-border-primary bg-bg-hover/40 py-2 text-[10px] font-semibold text-text-tertiary hover:bg-bg-hover hover:text-accent hover:border-accent/25 transition-all disabled:opacity-40"
                          >
                            <ArrowDownToLine className="h-3 w-3" strokeWidth={2.25} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openTransferFromMain(a.id); }}
                            disabled={demoFundingBlocked}
                            title="Add from main wallet"
                            className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-border-primary bg-bg-hover/40 py-2 text-[10px] font-semibold text-text-tertiary hover:bg-bg-hover hover:text-accent hover:border-accent/25 transition-all disabled:opacity-40"
                          >
                            <ArrowUpFromLine className="h-3 w-3" strokeWidth={2.25} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center rounded-xl border py-2 text-[10px] font-bold tracking-wide"
                          style={{ borderColor: `rgba(${ac.r},0.15)`, color: `rgba(${ac.r},0.5)`, background: `rgba(${ac.r},0.04)` }}
                        >
                          Managed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {liveAccounts.length > 1 && wallet?.total_live_balance != null &&
              Math.abs((wallet.total_live_balance ?? 0) - (wallet.balance || 0)) > 0.009 && (
              <p className="px-1 text-[11px] text-text-tertiary">
                All live accounts total:{' '}
                <span className="font-mono font-semibold text-text-secondary">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: wallet?.currency || 'USD' }).format(wallet.total_live_balance)}
                </span>
              </p>
            )}
          </div>

          <div
            ref={fundPanelRef}
            id="wallet-fund-panel"
            className="scroll-mt-24 overflow-hidden rounded-xl border border-border-primary bg-card"
          >
            {/* Curved “crucial” tab shell — slides with spring; no mid-tab seam */}
            <div className="relative flex min-h-[52px] border-b border-border-primary bg-card">
              <div
                className="pointer-events-none absolute inset-0 z-0"
                aria-hidden
              >
                <div
                  className="absolute top-0 h-full w-1/2 transition-[transform] duration-500 ease-[cubic-bezier(0.34,1.45,0.64,1)] will-change-transform"
                  style={{
                    transform:
                      fundMainTab === 'deposit' ? 'translate3d(0,0,0)' : 'translate3d(100%,0,0)',
                  }}
                >
                  <div
                    className={clsx(
                      'absolute inset-x-1.5 top-0 h-full rounded-t-2xl border-2 border-b-0 border-accent bg-card-nested',
                      'animate-wallet-main-tab-glow',
                    )}
                  />
                </div>
              </div>
              {(['deposit', 'withdraw'] as const).map((t) => {
                const active = fundMainTab === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFundMainTab(t)}
                    className={clsx(
                      'relative z-10 flex-1 border-0 bg-transparent py-3.5 text-sm font-semibold capitalize outline-none',
                      'transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/50',
                      active ? 'text-accent' : 'text-text-secondary hover:text-text-primary',
                    )}
                  >
                    {active ? (
                      <span
                        key={fundMainTab}
                        className="relative inline-block animate-wallet-main-tab-text drop-shadow-[0_0_20px_rgba(33,150,243,0.7)]"
                      >
                        {t === 'deposit' ? 'Deposit' : 'Withdraw'}
                      </span>
                    ) : (
                      <span className="relative inline-block">{t === 'deposit' ? 'Deposit' : 'Withdraw'}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div
              key={fundMainTab}
              className="space-y-5 bg-card-nested p-4 md:p-6 animate-wallet-fund-enter-lg"
            >
              {fundMainTab === 'deposit' ? (
                <>
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                      <ArrowDownToLine className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-text-primary">Deposit funds</h2>
                      <p className="text-sm text-text-secondary">Add funds to your wallet or accounts</p>
                    </div>
                  </div>

                  {/* Deposit To */}
                  <div>
                    <p className="text-xs text-text-tertiary mb-2 font-medium uppercase tracking-wide">Deposit To</p>
                    <button
                      type="button"
                      className="w-full py-3.5 rounded-xl bg-[#2196f3] text-white font-bold text-sm flex items-center justify-center gap-2"
                    >
                      <WalletIcon className="w-4 h-4" />
                      Wallet
                    </button>
                  </div>

                  {/* Deposit Method Tabs */}
                  <div className="flex gap-2 border-b border-border-glass">
                    {(['crypto', 'manual'] as const).map((method) => {
                      const active = depositUiSection === method;
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setDepositUiSection(method)}
                          className={clsx(
                            'px-4 py-2.5 text-sm font-semibold transition-all border-b-2',
                            active
                              ? 'border-accent text-accent'
                              : 'border-transparent text-text-tertiary hover:text-text-primary'
                          )}
                        >
                          {method === 'crypto' ? 'Crypto' : 'Bank / UPI'}
                        </button>
                      );
                    })}
                  </div>

                  {depositUiSection === 'crypto' ? (
                    <>
                      {/* Manual crypto deposit — pick wallet, pay to address/QR, upload proof */}
                      {cryptoWallets.length === 0 ? (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
                          <p className="text-xs text-amber-500/90">
                            No crypto wallets are configured yet. Please contact support or use the Bank / UPI option.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <label className="text-xs text-text-secondary">Select coin / network</label>
                            <select
                              value={selectedCryptoWalletId}
                              onChange={(e) => setSelectedCryptoWalletId(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-border-primary bg-bg-secondary text-text-primary outline-none focus:border-accent/50 text-sm"
                            >
                              {cryptoWallets.map((w) => (
                                <option key={w.id} value={w.id}>{w.label}</option>
                              ))}
                            </select>
                          </div>

                          {selectedCryptoWallet ? (
                            <div className="rounded-xl border border-border-primary bg-bg-secondary px-3 py-3 sm:px-4 space-y-3">
                              <p className="text-xs font-bold text-text-primary">
                                Send {selectedCryptoWallet.coin} ({selectedCryptoWallet.network}) to this address
                              </p>
                              <div className="flex justify-center">
                                <div className="rounded-lg bg-white p-3">
                                  <QRCodeCanvas value={selectedCryptoWallet.address} size={180} />
                                </div>
                              </div>
                              <CopyField label="Wallet address" value={selectedCryptoWallet.address} wide />
                              <p className="text-[11px] text-amber-500/90">
                                Send only {selectedCryptoWallet.coin} on the {selectedCryptoWallet.network} network — wrong network means lost funds.
                              </p>
                            </div>
                          ) : null}

                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <label className="text-xs text-text-secondary">Amount (USD)</label>
                              {depositLimitsHint ? (
                                <span className="text-[10px] text-text-tertiary font-mono">{depositLimitsHint}</span>
                              ) : null}
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-bold">$</span>
                              <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                onWheel={(e) => e.currentTarget.blur()}
                                placeholder="0.00"
                                className="w-full pl-7 pr-4 py-3 rounded-xl border border-border-primary bg-bg-secondary text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/50 font-mono font-bold text-lg"
                              />
                            </div>
                          </div>

                          <div className="space-y-1 min-w-0">
                            <label className="text-xs text-text-secondary">
                              Transaction hash / ID <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={depositTxId}
                              onChange={(e) => setDepositTxId(e.target.value)}
                              placeholder="Paste the blockchain transaction hash"
                              className="w-full px-4 py-3 rounded-xl border border-border-primary bg-bg-secondary text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/50 font-mono text-sm"
                            />
                          </div>

                          <div className="space-y-1 min-w-0">
                            <label className="text-xs text-text-secondary">
                              Payment screenshot <span className="text-red-400">*</span>
                            </label>
                            <label
                              className={clsx(
                                'flex flex-col items-center justify-center w-full min-w-0 py-5 sm:py-6 px-2 rounded-xl border-2 border-dashed cursor-pointer transition-all',
                                depositProofFile ? 'border-accent/40 bg-accent/5' : 'border-border-primary hover:border-accent/30',
                              )}
                            >
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf,.webp"
                                className="hidden"
                                onChange={(e) => setDepositProofFile(e.target.files?.[0] ?? null)}
                              />
                              {depositProofFile ? (
                                <span className="text-sm font-medium text-[#2196f3] px-2 text-center">{depositProofFile.name}</span>
                              ) : (
                                <span className="text-xs text-[#666]">JPG, PNG, PDF, WEBP — max 10 MB</span>
                              )}
                            </label>
                          </div>

                          <button
                            type="button"
                            onClick={() => void submitDeposit()}
                            disabled={demoFundingBlocked || depositSubmitting || !depositAmount || !depositTxId.trim() || !depositProofFile}
                            className={clsx(
                              'w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.99]',
                              demoFundingBlocked || depositSubmitting || !depositAmount || !depositTxId.trim() || !depositProofFile
                                ? 'bg-bg-hover text-text-tertiary cursor-not-allowed'
                                : 'bg-accent text-white hover:bg-[#5cffb8] shadow-neon-green-lg',
                            )}
                          >
                            {depositSubmitting ? 'Submitting…' : `Submit deposit${depositAmount ? ` — $${parseFloat(depositAmount || '0').toLocaleString()}` : ''}`}
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Manual deposit — amount + bank details + proof */}
                      <FxRateBadge rate={fxRate} loading={fxLoading} onRefresh={refreshFxRate} />
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-xs text-text-secondary">Amount (USD)</label>
                          {depositLimitsHint ? (
                            <span className="text-[10px] text-text-tertiary font-mono">{depositLimitsHint}</span>
                          ) : null}
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-bold">$</span>
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            onWheel={(e) => e.currentTarget.blur()}
                            onBlur={() => void loadManualBankDetails()}
                            placeholder="0.00"
                            className="w-full pl-7 pr-4 py-3 rounded-xl border border-border-primary bg-bg-secondary text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/50 font-mono font-bold text-lg"
                          />
                        </div>
                        <InrConversion usdAmount={depositAmount} rate={fxRate} />
                      </div>

                      <div className="rounded-xl border border-border-primary bg-bg-secondary px-3 py-3 sm:px-4 space-y-2.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-text-primary">Pay to this account (from admin)</p>
                          {manualBankInfo && (manualBankInfo.bank_name || manualBankInfo.account_number) ? (
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-text-tertiary">
                              Tap <Copy className="inline w-3 h-3 -mt-0.5" /> to copy
                            </span>
                          ) : null}
                        </div>
                        {manualBankInfo && (manualBankInfo.bank_name || manualBankInfo.account_number) ? (
                          <div className="min-w-0 space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {manualBankInfo.bank_name ? (
                                <CopyField label="Bank" value={manualBankInfo.bank_name} />
                              ) : null}
                              {manualBankInfo.account_holder ? (
                                <CopyField label="Holder" value={manualBankInfo.account_holder} />
                              ) : null}
                              {manualBankInfo.account_number ? (
                                <CopyField label="A/C Number" value={manualBankInfo.account_number} />
                              ) : null}
                              {manualBankInfo.ifsc_code ? (
                                <CopyField label="IFSC" value={manualBankInfo.ifsc_code} />
                              ) : null}
                              {manualBankInfo.upi_id ? (
                                <CopyField label="UPI ID" value={manualBankInfo.upi_id} wide />
                              ) : null}
                            </div>
                            {manualBankInfo.qr_code_url ? (
                              <div className="pt-1 flex justify-center">
                                <img
                                  src={manualBankInfo.qr_code_url}
                                  alt="Payment QR"
                                  className="w-full max-w-[220px] max-h-48 object-contain rounded-lg border border-border-primary bg-bg-base"
                                />
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-[11px] text-amber-500/90">
                            No bank details configured yet. Enter amount and refresh, or contact support.
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => void loadManualBankDetails()}
                          className="text-[10px] font-semibold text-[#2196f3] hover:underline"
                        >
                          Refresh bank details
                        </button>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <label className="text-xs text-text-secondary">
                          Transaction / reference ID <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={depositTxId}
                          onChange={(e) => setDepositTxId(e.target.value)}
                          placeholder="UTR or reference from your bank/UPI app"
                          className="w-full px-4 py-3 rounded-xl border border-border-primary bg-bg-secondary text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/50 font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <label className="text-xs text-text-secondary">
                          Payment screenshot <span className="text-red-400">*</span>
                        </label>
                        <label
                          className={clsx(
                            'flex flex-col items-center justify-center w-full min-w-0 py-5 sm:py-6 px-2 rounded-xl border-2 border-dashed cursor-pointer transition-all',
                            depositProofFile
                              ? 'border-accent/40 bg-accent/5'
                              : 'border-border-primary hover:border-accent/30',
                          )}
                        >
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf,.webp"
                            className="hidden"
                            onChange={(e) => setDepositProofFile(e.target.files?.[0] ?? null)}
                          />
                          {depositProofFile ? (
                            <span className="text-sm font-medium text-[#2196f3] px-2 text-center">{depositProofFile.name}</span>
                          ) : (
                            <span className="text-xs text-[#666]">JPG, PNG, PDF, WEBP — max 10 MB</span>
                          )}
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => void submitDeposit()}
                        disabled={
                          demoFundingBlocked ||
                          depositSubmitting ||
                          !depositAmount ||
                          !depositTxId.trim() ||
                          !depositProofFile
                        }
                        className={clsx(
                          'w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.99]',
                          demoFundingBlocked ||
                            depositSubmitting ||
                            !depositAmount ||
                            !depositTxId.trim() ||
                            !depositProofFile
                            ? 'bg-bg-hover text-text-tertiary cursor-not-allowed'
                            : 'bg-accent text-white hover:bg-[#5cffb8] shadow-neon-green-lg',
                        )}
                      >
                        {depositSubmitting ? 'Submitting…' : `Deposit${depositAmount ? ` — $${parseFloat(depositAmount || '0').toLocaleString()}` : ''}`}
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Withdraw header */}
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                      <ArrowUpFromLine className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-text-primary">Withdraw funds</h2>
                      <p className="text-sm text-text-secondary">Withdraw from your main wallet</p>
                    </div>
                  </div>

                  {/* Wallet balance */}
                  <div className="rounded-xl border border-border-primary bg-bg-secondary p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary mb-1">Wallet Balance</p>
                    <p className="text-xl font-mono font-bold text-text-primary tabular-nums">
                      {fmt(wallet?.main_wallet_balance ?? 0)}
                    </p>
                  </div>

                  <p className="text-xs text-text-tertiary leading-relaxed">
                    Withdrawals are sent from your <span className="text-text-primary font-medium">main wallet</span> only. Ensure the amount
                    you need is available on the main wallet before requesting a payout.
                  </p>

                  {/* Payment method sub-tabs */}
                  <div className="flex gap-1 p-1 rounded-xl bg-bg-secondary border border-border-secondary">
                    <button
                      type="button"
                      onClick={() => setWithdrawUiSection('crypto')}
                      className={clsx(
                        'flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200',
                        withdrawUiSection === 'crypto'
                          ? 'bg-accent text-white'
                          : 'text-text-tertiary hover:text-text-primary',
                      )}
                    >
                      Crypto
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawUiSection('bank')}
                      className={clsx(
                        'flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-200',
                        withdrawUiSection === 'bank'
                          ? 'bg-accent text-white'
                          : 'text-text-tertiary hover:text-text-primary',
                      )}
                    >
                      Bank
                    </button>
                  </div>

                  {withdrawUiSection === 'crypto' ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs text-text-secondary">Coin / network</label>
                        <select
                          value={withdrawCryptoNetwork}
                          onChange={(e) => setWithdrawCryptoNetwork(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-border-primary bg-bg-secondary text-text-primary outline-none focus:border-accent/50 text-sm"
                        >
                          {CRYPTO_NETWORKS.map((n) => (
                            <option key={n.value} value={n.value}>{n.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <label className="text-xs text-text-secondary">Amount (USD)</label>
                            {withdrawLimitsHint ? (
                              <span className="text-[10px] text-text-tertiary font-mono truncate">{withdrawLimitsHint}</span>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setWithdrawAmount(
                                String(
                                  Math.max(
                                    0,
                                    wallet?.available_for_withdrawal ?? wallet?.main_wallet_balance ?? 0,
                                  ),
                                )
                              )
                            }
                            className="text-xs font-bold text-[#2196f3] hover:underline"
                          >
                            Max
                          </button>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-bold">$</span>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            onWheel={(e) => e.currentTarget.blur()}
                            placeholder="0.00"
                            className="w-full pl-7 pr-4 py-3 rounded-xl border border-border-primary bg-bg-secondary text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/50 font-mono font-bold text-lg"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <label className="text-xs text-text-secondary">
                          Your wallet address <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={withdrawCryptoAddress}
                          onChange={(e) => setWithdrawCryptoAddress(e.target.value)}
                          placeholder="Paste your crypto wallet address"
                          className="w-full px-4 py-3 rounded-xl border border-border-primary bg-bg-secondary text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/50 font-mono text-sm"
                        />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <label className="text-xs text-text-secondary">
                          Your wallet QR image <span className="text-red-400">*</span>
                        </label>
                        <label
                          className={clsx(
                            'flex flex-col items-center justify-center w-full min-w-0 py-5 sm:py-6 px-2 rounded-xl border-2 border-dashed cursor-pointer transition-all',
                            manualWithdrawQrFile ? 'border-accent/40 bg-accent/5' : 'border-border-primary hover:border-accent/30',
                          )}
                        >
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf,.webp"
                            className="hidden"
                            onChange={(e) => setManualWithdrawQrFile(e.target.files?.[0] ?? null)}
                          />
                          {manualWithdrawQrFile ? (
                            <span className="text-sm font-medium text-[#2196f3] px-2 text-center">{manualWithdrawQrFile.name}</span>
                          ) : (
                            <span className="text-xs text-[#666]">Upload your address QR — JPG, PNG, WEBP</span>
                          )}
                        </label>
                      </div>
                      <p className="text-[11px] text-text-tertiary">Processing time: up to 24 hours.</p>

                      <button
                        type="button"
                        onClick={() => void submitWithdraw()}
                        disabled={
                          demoFundingBlocked ||
                          withdrawSubmitting ||
                          !withdrawAmount ||
                          !withdrawCryptoAddress.trim() ||
                          !manualWithdrawQrFile
                        }
                        className={clsx(
                          'w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.99]',
                          demoFundingBlocked ||
                            withdrawSubmitting ||
                            !withdrawAmount ||
                            !withdrawCryptoAddress.trim() ||
                            !manualWithdrawQrFile
                            ? 'bg-bg-hover text-text-tertiary cursor-not-allowed'
                            : 'bg-accent text-white hover:bg-[#5cffb8] shadow-neon-green-lg',
                        )}
                      >
                        {withdrawSubmitting
                          ? 'Submitting…'
                          : `Withdraw funds${withdrawAmount ? ` — ${fmt(parseFloat(withdrawAmount || '0'))}` : ''}`}
                      </button>
                    </>
                  ) : (
                    <>
                      <FxRateBadge rate={fxRate} loading={fxLoading} onRefresh={refreshFxRate} />
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <label className="text-xs text-text-secondary">Amount (USD)</label>
                            {withdrawLimitsHint ? (
                              <span className="text-[10px] text-text-tertiary font-mono truncate">{withdrawLimitsHint}</span>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setWithdrawAmount(
                                String(
                                  Math.max(
                                    0,
                                    wallet?.available_for_withdrawal ?? wallet?.main_wallet_balance ?? 0,
                                  ),
                                )
                              )
                            }
                            className="text-xs font-bold text-[#2196f3] hover:underline"
                          >
                            Max
                          </button>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-bold">$</span>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            onWheel={(e) => e.currentTarget.blur()}
                            placeholder="0.00"
                            className="w-full pl-7 pr-4 py-3 rounded-xl border border-border-primary bg-bg-secondary text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/50 font-mono font-bold text-lg"
                          />
                        </div>
                        <InrConversion usdAmount={withdrawAmount} rate={fxRate} />
                      </div>

                      {/* Withdrawal method guidance — recommends UPI or Bank based on INR amount */}
                      {(() => {
                        const usd = parseFloat(withdrawAmount);
                        const rate = fxRate ? parseFloat(fxRate.rate) : 0;
                        const inr = Number.isFinite(usd) && usd > 0 && rate > 0 ? usd * rate : 0;
                        const recommendUpi = inr > 0 && inr < 10000;
                        const recommendBank = inr >= 10000;
                        const fmtInr = (n: number) =>
                          new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
                        return (
                          <div className="rounded-xl border border-border-primary bg-bg-secondary/60 px-3 py-3 sm:px-4 space-y-2.5">
                            <div className="flex items-center gap-2">
                              <Info className="w-3.5 h-3.5 text-accent shrink-0" />
                              <p className="text-xs font-bold text-text-primary">Which payout method should I use?</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div
                                className={clsx(
                                  'rounded-lg border px-3 py-2.5 transition-colors',
                                  recommendUpi ? 'border-accent/50 bg-accent/8' : 'border-border-primary',
                                )}
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Smartphone className={clsx('w-3.5 h-3.5', recommendUpi ? 'text-accent' : 'text-text-tertiary')} />
                                  <span className="text-[11px] font-bold text-text-primary">UPI</span>
                                  {recommendUpi ? <span className="ml-auto text-[9px] font-extrabold uppercase tracking-wider text-accent">Recommended</span> : null}
                                </div>
                                <p className="text-[10px] text-text-secondary leading-snug">
                                  For withdrawals <span className="font-semibold text-text-primary">below {fmtInr(10000)}</span>. Instant payout.
                                </p>
                              </div>
                              <div
                                className={clsx(
                                  'rounded-lg border px-3 py-2.5 transition-colors',
                                  recommendBank ? 'border-accent/50 bg-accent/8' : 'border-border-primary',
                                )}
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Landmark className={clsx('w-3.5 h-3.5', recommendBank ? 'text-accent' : 'text-text-tertiary')} />
                                  <span className="text-[11px] font-bold text-text-primary">Bank Transfer</span>
                                  {recommendBank ? <span className="ml-auto text-[9px] font-extrabold uppercase tracking-wider text-accent">Recommended</span> : null}
                                </div>
                                <p className="text-[10px] text-text-secondary leading-snug">
                                  For <span className="font-semibold text-text-primary">{fmtInr(10000)} and above</span>. Bypasses UPI limits.
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Payout method toggle — UPI or Bank Transfer */}
                      <div className="flex rounded-xl border border-border-primary bg-bg-secondary p-1 gap-1">
                        {(['upi', 'bank'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setWithdrawPayoutMethod(m)}
                            className={clsx(
                              'flex-1 py-2.5 rounded-lg text-xs font-bold transition-all text-center',
                              withdrawPayoutMethod === m
                                ? 'bg-accent text-white shadow-sm'
                                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
                            )}
                          >
                            {m === 'upi' ? 'UPI' : 'Bank Transfer'}
                          </button>
                        ))}
                      </div>

                      {withdrawPayoutMethod === 'upi' ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs text-text-secondary">UPI ID</label>
                              <input
                                type="text"
                                value={manualWithdrawUpi}
                                onChange={(e) => setManualWithdrawUpi(e.target.value)}
                                placeholder="yourname@upi"
                                className="w-full px-4 py-3 rounded-xl border border-border-primary bg-bg-secondary text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/50 font-mono text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-text-secondary">Bank name</label>
                              <input
                                type="text"
                                value={manualWithdrawBank}
                                onChange={(e) => setManualWithdrawBank(e.target.value)}
                                placeholder="e.g. HDFC, SBI"
                                className="w-full px-4 py-3 rounded-xl border border-border-primary bg-bg-secondary text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/50 text-sm"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs text-text-secondary">Bank name <span className="text-sell">*</span></label>
                              <input
                                type="text"
                                value={manualWithdrawBank}
                                onChange={(e) => setManualWithdrawBank(e.target.value)}
                                placeholder="e.g. HDFC, SBI"
                                className="w-full px-4 py-3 rounded-xl border border-border-primary bg-bg-secondary text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/50 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-text-secondary">Account number <span className="text-sell">*</span></label>
                              <input
                                type="text"
                                value={manualWithdrawAccNo}
                                onChange={(e) => setManualWithdrawAccNo(e.target.value)}
                                placeholder="1234567890"
                                className="w-full px-4 py-3 rounded-xl border border-border-primary bg-bg-secondary text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/50 font-mono text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-text-secondary">IFSC code <span className="text-sell">*</span></label>
                            <input
                              type="text"
                              value={manualWithdrawIfsc}
                              onChange={(e) => setManualWithdrawIfsc(e.target.value.toUpperCase())}
                              placeholder="HDFC0001234"
                              className="w-full px-4 py-3 rounded-xl border border-border-primary bg-bg-secondary text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/50 font-mono text-sm uppercase"
                            />
                          </div>
                        </>
                      )}
                      {withdrawPayoutMethod === 'upi' && (
                      <div className="space-y-1">
                        <label className="text-xs text-text-secondary">Your QR code (optional)</label>
                        <label
                          className={clsx(
                            'flex flex-col items-center justify-center w-full py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all',
                            manualWithdrawQrFile
                              ? 'border-accent/40 bg-accent/5'
                              : 'border-border-primary hover:border-accent/30',
                          )}
                        >
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf,.webp"
                            className="hidden"
                            onChange={(e) => setManualWithdrawQrFile(e.target.files?.[0] ?? null)}
                          />
                          {manualWithdrawQrFile ? (
                            <span className="text-sm font-medium text-[#2196f3] px-2 text-center">
                              {manualWithdrawQrFile.name}
                            </span>
                          ) : (
                            <span className="text-xs text-text-tertiary">JPG, PNG, PDF, WEBP</span>
                          )}
                        </label>
                      </div>
                      )}
                      {(() => {
                        const upiReady = withdrawPayoutMethod === 'upi' && (manualWithdrawUpi.trim() || manualWithdrawQrFile);
                        const bankReady = withdrawPayoutMethod === 'bank' && manualWithdrawBank.trim() && manualWithdrawAccNo.trim() && manualWithdrawIfsc.trim();
                        const canSubmit = !demoFundingBlocked && !withdrawSubmitting && !!withdrawAmount && (upiReady || bankReady);
                        return (
                          <button
                            type="button"
                            onClick={() => void submitWithdraw()}
                            disabled={!canSubmit}
                            className={clsx(
                              'w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.99]',
                              !canSubmit
                                ? 'bg-bg-hover text-text-tertiary cursor-not-allowed'
                                : 'bg-accent text-white hover:bg-[#5cffb8] shadow-neon-green-lg',
                            )}
                          >
                            {withdrawSubmitting ? 'Submitting…' : 'Withdraw funds'}
                          </button>
                        );
                      })()}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <Card variant="glass" className="flex flex-col gap-1 border-border-glass/30 relative overflow-hidden group">
              <div className="flex items-center gap-2 text-success text-[10px] md:text-xs font-bold uppercase tracking-wider">
                <ArrowDownLeft className="w-3 h-3" /> Total Deposits
              </div>
              <div className="text-base md:text-xl font-bold text-text-primary tabular-nums font-mono">
                {fmt(wallet?.total_deposited || 0)}
              </div>
              <div className="absolute top-0 right-0 w-12 h-12 bg-success/5 rounded-bl-full group-hover:bg-success/10 transition-colors" />
            </Card>
            <Card variant="glass" className="flex flex-col gap-1 border-border-glass/30 relative overflow-hidden group">
              <div className="flex items-center gap-2 text-buy text-[10px] md:text-xs font-bold uppercase tracking-wider">
                <ArrowUpRight className="w-3 h-3" /> Total Withdrawals
              </div>
              <div className="text-base md:text-xl font-bold text-text-primary tabular-nums font-mono">
                {fmt(wallet?.total_withdrawn || 0)}
              </div>
              <div className="absolute top-0 right-0 w-12 h-12 bg-buy/5 rounded-bl-full group-hover:bg-buy/10 transition-colors" />
            </Card>
          </div>

          <div className="bg-bg-secondary/50 border border-border-glass/20 rounded-xl p-4 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-buy/10 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-buy" />
            </div>
            <div>
              <h5 className="text-text-primary font-bold text-xs uppercase tracking-wide">Processing Time</h5>
              <p className="text-text-tertiary text-[10px] leading-relaxed mt-0.5">
                OxaPay and manual bank/UPI options are reviewed by finance; most requests are processed within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      {balanceTransfer && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wallet-transfer-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm"
            aria-label="Close"
            onClick={closeBalanceTransfer}
          />
          <div
            className="relative w-full max-w-sm rounded-t-2xl border border-border-primary bg-card-nested p-4 shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <h2 id="wallet-transfer-title" className="pr-6 text-sm font-bold text-text-primary">
                {balanceTransfer.mode === 'to_main' ? 'Move to main wallet' : 'Add from main wallet'}
              </h2>
              <button
                type="button"
                onClick={closeBalanceTransfer}
                className="shrink-0 rounded-lg p-1 text-text-secondary transition-colors hover:bg-bg-hover"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {balanceTransfer.mode === 'to_trading' && !balanceTransfer.tradingAccountId ? (
              <div className="mb-3 space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Trading account
                </label>
                <select
                  value={balanceTransferPickId}
                  onChange={(e) => setBalanceTransferPickId(e.target.value)}
                  className="w-full rounded-lg border border-border-primary bg-bg-primary px-2.5 py-2 text-xs font-mono text-text-primary outline-none focus:border-accent/40"
                >
                  {liveAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_number} ({acc.currency || 'USD'})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {balanceTransfer.mode === 'to_main' && balanceTransfer.tradingAccountId ? (
              <p className="mb-3 font-mono text-[11px] text-text-tertiary">
                From{' '}
                {liveAccounts.find((x) => x.id === balanceTransfer.tradingAccountId)?.account_number ?? '—'}
              </p>
            ) : null}
            {balanceTransfer.mode === 'to_trading' && balanceTransfer.tradingAccountId ? (
              <p className="mb-3 font-mono text-[11px] text-text-tertiary">
                To{' '}
                {liveAccounts.find((x) => x.id === balanceTransfer.tradingAccountId)?.account_number ?? '—'}
              </p>
            ) : null}
            {(() => {
              const tradingId =
                balanceTransfer.mode === 'to_main'
                  ? balanceTransfer.tradingAccountId
                  : balanceTransfer.tradingAccountId ?? balanceTransferPickId;
              const tradingAcc = liveAccounts.find((a) => a.id === tradingId);
              const acctCur = tradingAcc?.currency || 'USD';
              const isInr = acctCur === 'INR';
              const inputCur = balanceTransfer.mode === 'to_main' ? acctCur : 'USD';
              const inputSym = currencySymbol(inputCur);
              const maxAmt =
                balanceTransfer.mode === 'to_trading'
                  ? Number(wallet?.main_wallet_balance ?? 0)
                  : Number(tradingAcc?.balance ?? 0);
              return (
                <div className="mb-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                      Amount ({inputCur})
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setBalanceTransferAmount(maxAmt > 0 ? maxAmt.toFixed(2) : '')
                      }
                      disabled={maxAmt <= 0}
                      className="text-[10px] font-bold text-[#2196f3] hover:underline disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Max: {inputSym}{maxAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-tertiary">
                      {inputSym}
                    </span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={balanceTransferAmount}
                      onChange={(e) => setBalanceTransferAmount(e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-border-primary bg-bg-primary py-2 pl-7 pr-3 text-sm font-mono font-bold text-text-primary outline-none focus:border-accent/40"
                    />
                  </div>
                  {isInr && balanceTransfer.mode === 'to_trading' && balanceTransferAmount ? (
                    <InrConversion usdAmount={balanceTransferAmount} rate={fxRate} className="mt-1" />
                  ) : null}
                  {isInr && balanceTransfer.mode === 'to_main' && balanceTransferAmount ? (() => {
                    const r = fxRate ? parseFloat(fxRate.rate) : 0;
                    const amt = parseFloat(balanceTransferAmount);
                    if (!r || !Number.isFinite(amt) || amt <= 0) return null;
                    const usd = amt / r;
                    return (
                      <div className="text-xs text-text-secondary flex items-center gap-1.5 mt-1">
                        <span className="text-text-tertiary">=</span>
                        <span className="font-mono font-bold text-accent">
                          ${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-text-tertiary">to main wallet</span>
                      </div>
                    );
                  })() : null}
                </div>
              );
            })()}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeBalanceTransfer}
                className="flex-1 rounded-lg border border-border-primary py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitBalanceTransfer()}
                disabled={balanceTransferBusy}
                className={clsx(
                  'flex-1 rounded-lg py-2 text-xs font-bold transition-colors',
                  balanceTransferBusy
                    ? 'cursor-not-allowed bg-border-primary text-text-tertiary opacity-60'
                    : 'bg-accent text-black hover:bg-accent/90',
                )}
              >
                {balanceTransferBusy ? '…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardShell>
  );
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell mainClassName="flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="w-8 h-8 border-2 border-[#2196f3] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-text-secondary">Loading wallet…</span>
          </div>
        </DashboardShell>
      }
    >
      <WalletPageContent />
    </Suspense>
  );
}
