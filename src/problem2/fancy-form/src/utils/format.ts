/**
 * Format a number as a currency-like display string.
 * Uses compact notation for very large numbers.
 */
export function formatAmount(value: number, maxDecimals = 6): string {
  if (value === 0) return '0';

  if (Math.abs(value) < 0.000001) {
    return value.toExponential(2);
  }

  if (Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
  }

  // Determine appropriate decimal places based on magnitude
  const decimals = Math.abs(value) >= 1 ? Math.min(maxDecimals, 4) : maxDecimals;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a number as USD display.
 */
export function formatUsd(value: number): string {
  if (value === 0) return '$0.00';

  if (value < 0.01) {
    return '<$0.01';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Parse a string input to a number, handling edge cases.
 * Returns NaN for invalid inputs.
 */
export function parseAmountInput(input: string): number {
  if (!input || input === '.' || input === '') return 0;
  const parsed = parseFloat(input);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validate and sanitize numeric input for the amount field.
 * Returns the sanitized string or null if invalid.
 */
export function sanitizeAmountInput(value: string): string | null {
  // Allow empty
  if (value === '') return '';

  // Allow just a dot for starting decimal input
  if (value === '.') return '0.';

  // Only allow numbers and a single dot
  const regex = /^\d*\.?\d*$/;
  if (!regex.test(value)) return null;

  // Prevent leading zeros except "0." or "0"
  if (value.length > 1 && value.startsWith('0') && value[1] !== '.') {
    return value.replace(/^0+/, '') || '0';
  }

  return value;
}
