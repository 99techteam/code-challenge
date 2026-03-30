export function formatAmount(value: number, decimals = 6): string {
  if (value === 0) return '0';
  if (value >= 1) return value.toLocaleString('en-US', { maximumFractionDigits: Math.min(decimals, 4) });
  return value.toFixed(decimals);
}

export function formatUSD(value: number): string {
  if (value >= 0.01) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (value > 0) {
    return `$${value.toFixed(6)}`;
  }
  return '$0.00';
}

export function formatRate(rate: number): string {
  if (rate >= 1) return rate.toLocaleString('en-US', { maximumFractionDigits: 4 });
  if (rate >= 0.0001) return rate.toFixed(6);
  return rate.toExponential(2);
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
