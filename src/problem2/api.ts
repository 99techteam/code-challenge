import type { PriceEntry } from './types';

const PRICES_URL = 'https://interview.switcheo.com/prices.json';

// Fetch the raw price feed. The endpoint returns an array of
// `{ currency, date, price }` entries. The same currency can appear
// multiple times with different timestamps, so the caller is responsible
// for deduplicating (see `dedupeLatest`).
export async function fetchPrices(): Promise<PriceEntry[]> {
  const res = await fetch(PRICES_URL);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch prices: ${res.status} ${res.statusText}`,
    );
  }
  const data = (await res.json()) as PriceEntry[];
  if (!Array.isArray(data)) {
    throw new Error('Unexpected price feed shape: expected an array.');
  }
  return data;
}

// Keep only the most recent price per currency. Entries without a valid
// numeric price are dropped (per the spec: "tokens that do not [have a
// price] can be omitted").
export function dedupeLatest(entries: PriceEntry[]): PriceEntry[] {
  const latest = new Map<string, PriceEntry>();
  for (const entry of entries) {
    if (!entry || typeof entry.price !== 'number' || !isFinite(entry.price)) {
      continue;
    }
    const prev = latest.get(entry.currency);
    if (!prev || new Date(entry.date) > new Date(prev.date)) {
      latest.set(entry.currency, entry);
    }
  }
  return [...latest.values()].sort((a, b) =>
    a.currency.localeCompare(b.currency),
  );
}
