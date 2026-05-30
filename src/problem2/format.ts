// Small display helpers for numbers shown in the swap form.

const COMPACT_THRESHOLD = 1_000_000;

export const formatBalance = (n: number): string => {
  if (!isFinite(n)) return '—';
  if (n === 0) return '0';
  if (n >= COMPACT_THRESHOLD) {
    return n.toLocaleString(undefined, {
      notation: 'compact',
      maximumFractionDigits: 2,
    });
  }
  if (n < 0.0001) return n.toExponential(2);
  if (n < 1) return n.toPrecision(4);
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
};

export const formatPrice = (n: number): string => {
  if (!isFinite(n) || n === 0) return '$0';
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toPrecision(4)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
};

export const formatPct = (n: number): string => `${n.toFixed(2)}%`;
