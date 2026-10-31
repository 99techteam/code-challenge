import { AppError } from '../../errors/app-error.ts';
import type { PriceSnapshot, TokenPrice } from '../../types/index.ts';

const PRICE_URL = 'https://interview.switcheo.com/prices.json';

function normalizePrices(records: unknown[]): TokenPrice[] {
  const latest = new Map<string, TokenPrice>();

  for (const item of records) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Partial<TokenPrice>;
    if (typeof record.currency !== 'string' || typeof record.date !== 'string' ||
        typeof record.price !== 'number' || !Number.isFinite(record.price) || record.price <= 0) continue;

    const previous = latest.get(record.currency);
    const currentTime = Date.parse(record.date) || 0;
    const previousTime = previous ? Date.parse(previous.date) || 0 : -1;
    if (!previous || currentTime >= previousTime) latest.set(record.currency, record as TokenPrice);
  }

  return [...latest.values()].sort((a, b) => a.currency.localeCompare(b.currency));
}

export async function fetchTokenPrices(): Promise<PriceSnapshot> {
  let response: Response;
  try {
    response = await fetch(PRICE_URL, { cache: 'no-store' });
  } catch {
    throw new AppError('Could not connect to the token price feed. Check your connection.');
  }

  if (!response.ok) throw new AppError(`The token price feed returned an error (${response.status}).`);
  const records: unknown = await response.json();
  if (!Array.isArray(records)) throw new AppError('The token price feed returned an unexpected response.');

  const tokens = normalizePrices(records);
  if (!tokens.length) throw new AppError('The token price feed did not contain usable prices.');

  const latestTimestamp = Math.max(...tokens.map((token) => Date.parse(token.date) || 0));
  const snapshotDate = latestTimestamp
    ? new Date(latestTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'unknown date';
  return { tokens, snapshotDate };
}
