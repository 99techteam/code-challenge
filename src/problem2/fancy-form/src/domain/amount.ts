// Parse a decimal amount string, or return null if it is not a valid number.
export function parseAmount(str: string | null | undefined): number | null {
  if (!str) return null;
  if (!/^\d*\.?\d*$/.test(str)) return null;
  const n = Number(str);
  if (!Number.isFinite(n)) return null;
  return n;
}

// Format a token amount with up to 8 decimals, trimming trailing zeros.
export function formatAmount(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '0';
  if (v === 0) return '0';
  return v.toFixed(8).replace(/\.?0+$/, '');
}

// Format a USD value, e.g. 1645.937 -> "$1,645.94".
export function formatUsd(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—';
  if (v === 0) return '$0.00';
  if (Math.abs(v) >= 1) {
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '$' + v.toLocaleString('en-US', { maximumSignificantDigits: 4 });
}
