export const PRICES_URL = 'https://interview.switcheo.com/prices.json';

export type PriceRow = {
  currency: string;
  date: string; // ISO
  price: number;
};

export type TokenPrice = {
  symbol: string;
  price: number;
  date: string; // latest ISO used
};

function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

/**
 * Fetches prices from the provided endpoint and returns a deduped list
 * (keeping the newest row per currency).
 */
export async function fetchLatestPrices(signal?: AbortSignal): Promise<TokenPrice[]> {
  const res = await fetch(PRICES_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch prices (HTTP ${res.status})`);
  }

  const rows = (await res.json()) as unknown;
  if (!Array.isArray(rows)) {
    throw new Error('Unexpected prices payload (expected array)');
  }

  const map = new Map<string, TokenPrice>();

  for (const r of rows as PriceRow[]) {
    if (!r || typeof r.currency !== 'string' || typeof r.date !== 'string' || !isFiniteNumber(r.price)) {
      continue;
    }

    const symbol = r.currency.trim();
    if (!symbol) continue;

    const prev = map.get(symbol);
    if (!prev) {
      map.set(symbol, { symbol, price: r.price, date: r.date });
      continue;
    }

    // Keep the newest date; if equal, prefer the last one.
    const prevTime = Date.parse(prev.date);
    const thisTime = Date.parse(r.date);

    if (!Number.isFinite(prevTime) || !Number.isFinite(thisTime)) {
      map.set(symbol, { symbol, price: r.price, date: r.date });
      continue;
    }

    if (thisTime >= prevTime) {
      map.set(symbol, { symbol, price: r.price, date: r.date });
    }
  }

  const list = [...map.values()]
    .filter((t) => t.price > 0)
    .sort((a, b) => a.symbol.localeCompare(b.symbol));

  return list;
}

export function buildTokenIconUrl(symbol: string): string {
  // Repo indicates filenames match token shorthand name. We'll try exact symbol.
  // Example: https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/SWTH.svg
  return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${encodeURIComponent(symbol)}.svg`;
}
