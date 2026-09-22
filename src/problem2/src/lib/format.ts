/** Fewest fraction digits any amount is shown with. */
const MIN_DECIMALS = 2;
/** Most fraction digits any amount is shown with. */
const MAX_DECIMALS = 8;

/**
 * How many fraction digits an amount of a token needs to stay meaningful.
 *
 * Precision has to track price: one unit of a $26,000 asset is a large amount of
 * money, so it needs six places before the digits stop mattering, while a
 * $0.004 asset is traded in the hundreds of thousands and two is plenty.
 */
export function decimalsForPrice(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return MIN_DECIMALS;

  const magnitude = Math.ceil(Math.log10(price)) + 1;
  return Math.min(MAX_DECIMALS, Math.max(MIN_DECIMALS, magnitude));
}

/**
 * Group-separated amount rounded to `decimals` places — `1.250000`, `80,318.12`.
 * With `pad` off, trailing zeros are dropped instead: `2`, `1.25`.
 */
export function formatAmount(value: number, decimals: number, pad = true): string {
  if (!Number.isFinite(value)) return '';

  return value.toLocaleString('en-US', {
    minimumFractionDigits: pad ? decimals : 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Parse what the user typed. Returns 0 for anything that is not a number so
 * callers can render a blank result instead of `NaN`.
 */
export function parseAmount(raw: string): number {
  const value = Number.parseFloat(raw.replace(/,/g, ''));
  return Number.isFinite(value) ? value : 0;
}

/**
 * Keep an amount field to digits and at most one decimal point, the way the
 * design's inputs do — invalid characters never make it into state.
 */
export function sanitizeAmountInput(raw: string): string {
  const digitsAndDots = raw.replace(/[^0-9.]/g, '');
  const firstDot = digitsAndDots.indexOf('.');
  if (firstDot === -1) return digitsAndDots;

  return (
    digitsAndDots.slice(0, firstDot + 1) + digitsAndDots.slice(firstDot + 1).replace(/\./g, '')
  );
}

/**
 * How long ago something happened, for the "Updated" line: `just now`,
 * `42s ago`, `5m ago`, `2d ago`. Relative all the way up: the row answers "is
 * this stale?", and a figure to compare against nothing beats a date to read.
 */
export function formatRelativeTime(from: number, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - from) / 1000));
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${String(seconds)}s ago`;

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${String(minutes)}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${String(hours)}h ago`;

  return `${String(Math.round(hours / 24))}d ago`;
}
