const SYMBOLS: Record<string, string> = { USD: '$', INR: '₹' };

export function currencySymbol(currency?: string | null): string {
  return SYMBOLS[(currency || 'USD').toUpperCase()] ?? '$';
}

export function formatMoney(amount: number, currency?: string | null): string {
  const cur = (currency || 'USD').toUpperCase();
  const sym = currencySymbol(cur);
  const abs = Math.abs(amount);
  const formatted = cur === 'INR'
    ? abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${amount < 0 ? '-' : ''}${sym}${formatted}`;
}

export function formatMoneySign(amount: number, currency?: string | null): string {
  const prefix = amount >= 0 ? '+' : '';
  return `${prefix}${formatMoney(amount, currency)}`;
}
