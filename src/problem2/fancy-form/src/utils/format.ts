/**
 * Formats a numeric value for display, handling scientific notation for tiny numbers
 * and adding thousands separators for large ones.
 */
export function formatAmount(value: number): string {
  if (value === 0) return '0';
  if (value < 0.000001) return value.toExponential(4);
  if (value < 1) return value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  if (value < 1000) return value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/**
 * Formats a currency price with appropriate decimal precision.
 * Shows more decimals for small prices and 2 for large ones.
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : 2
  });
}
