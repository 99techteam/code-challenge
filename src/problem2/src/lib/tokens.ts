import type { PriceRecord, Token } from '../types';

export const PRICES_URL = 'https://interview.switcheo.com/prices.json';

const ICON_BASE =
  'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

/** Build the SVG icon URL for a token symbol. */
export function iconUrl(symbol: string): string {
  return `${ICON_BASE}/${symbol}.svg`;
}

/**
 * Turn the raw price feed into a clean, de-duplicated token list.
 *
 * The feed contains duplicate currencies (and entries with no usable price);
 * we keep the most recent priced record per currency, drop anything priced at
 * zero or below, and sort alphabetically for a predictable picker order.
 */
export function tokensFromPrices(records: PriceRecord[]): Token[] {
  const latest = new Map<string, PriceRecord>();

  for (const record of records) {
    if (!record || typeof record.price !== 'number' || record.price <= 0) {
      continue;
    }
    const existing = latest.get(record.currency);
    if (!existing || new Date(record.date) > new Date(existing.date)) {
      latest.set(record.currency, record);
    }
  }

  return [...latest.values()]
    .map((record) => ({
      symbol: record.currency,
      price: record.price,
      icon: iconUrl(record.currency),
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}

/** Format a number as a token amount, trimming noisy trailing zeros. */
export function formatAmount(value: number, maxDecimals = 6): string {
  if (!Number.isFinite(value)) return '0';
  if (value === 0) return '0';
  // Very small values: show enough significant digits to be meaningful.
  const decimals = value < 1 ? Math.min(8, maxDecimals + 2) : maxDecimals;
  return value
    .toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    })
    .replace(/,/g, value >= 1000 ? ',' : '');
}

/** Format a USD value. */
export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return '$0.00';
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
