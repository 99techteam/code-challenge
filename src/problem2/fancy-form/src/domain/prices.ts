import type { PriceRow, PriceTable } from './types.ts';

export interface SwapQuote {
  readonly rate: number;
  readonly amountIn: number;
  readonly amountOut: number;
  readonly usdIn: number;
  readonly usdOut: number;
}

// Runtime guard for rows coming from an untrusted JSON payload.
export function isPriceRow(value: unknown): value is PriceRow {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.currency === 'string' &&
    typeof row.date === 'string' &&
    typeof row.price === 'number' &&
    Number.isFinite(row.price)
  );
}

// Exchange rate from two USD prices (priceFrom per priceTo), or null when
// either price is missing or the denominator is zero.
export function exchangeRate(
  priceFrom: number | null | undefined,
  priceTo: number | null | undefined,
): number | null {
  if (priceFrom == null || priceTo == null || priceTo === 0) return null;
  return priceFrom / priceTo;
}

// Collapse price rows down to one entry per currency, keeping the newest date.
export function dedupePrices(rows: Iterable<PriceRow>): Map<string, number> {
  const latest = new Map<string, { price: number; date: string }>();
  for (const row of rows) {
    const prev = latest.get(row.currency);
    if (!prev || new Date(row.date) > new Date(prev.date)) {
      latest.set(row.currency, { price: row.price, date: row.date });
    }
  }
  const prices = new Map<string, number>();
  for (const [currency, entry] of latest) prices.set(currency, entry.price);
  return prices;
}

// Price a swap of `amountIn` units of `from` into `to`, or null if either price is unknown.
export function quoteSwap(prices: PriceTable, from: string, to: string, amountIn: number): SwapQuote | null {
  const priceFrom = prices.get(from);
  const priceTo = prices.get(to);
  const rate = exchangeRate(priceFrom, priceTo);
  if (rate === null || priceFrom === undefined || priceTo === undefined) return null;
  const amountOut = amountIn * rate;
  return { rate, amountIn, amountOut, usdIn: amountIn * priceFrom, usdOut: amountOut * priceTo };
}
