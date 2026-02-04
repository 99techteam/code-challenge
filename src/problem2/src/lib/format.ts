export function formatUsd(n: number, maxFractionDigits = 2): string {
  if (!Number.isFinite(n)) return '$—';
  return n.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: maxFractionDigits
  });
}

export function formatNumber(n: number, maxFractionDigits = 6): string {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, {
    maximumFractionDigits: maxFractionDigits
  });
}

export function roundTo(n: number, decimals: number): number {
  const m = 10 ** decimals;
  return Math.round((n + Number.EPSILON) * m) / m;
}

export function safeParseAmount(input: string): number {
  // Allow empty / partial inputs; caller can validate.
  const cleaned = input.replace(/,/g, '').trim();
  if (cleaned === '') return NaN;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}
