export function formatNumber(
  value: number,
  options: { decimals?: number; compact?: boolean; prefix?: string } = {}
): string {
  const { decimals = 2, compact = false, prefix = "" } = options;
  if (isNaN(value) || value === 0) return `${prefix}0`;
  if (compact && value >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(2)}M`;
  if (compact && value >= 1_000) return `${prefix}${(value / 1_000).toFixed(2)}K`;
  return `${prefix}${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: decimals })}`;
}

export function formatTokenAmount(amount: number): string {
  if (amount === 0) return "0.00";
  if (amount < 0.0001) return "< 0.0001";
  const decimals = amount < 1 ? 6 : 4;
  return amount.toFixed(decimals).replace(/\.?0+$/, "");
}

export function formatUSDValue(amount: number, price: number): string {
  const usdValue = amount * price;
  if (usdValue === 0) return "$0.00";
  if (usdValue < 0.01) return "< $0.01";
  return formatNumber(usdValue, { decimals: 2, prefix: "$" });
}