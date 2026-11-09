export const PRICE_URL = 'https://interview.switcheo.com/prices.json';

export function normalizePrices(data) {
  if (!Array.isArray(data)) throw new Error('Invalid price response.');
  const latest = new Map();
  for (const row of data) {
    if (!row || typeof row.currency !== 'string' || !/^[a-zA-Z0-9]+$/.test(row.currency)
      || typeof row.price !== 'number' || !Number.isFinite(row.price) || row.price <= 0
      || typeof row.date !== 'string' || !Number.isFinite(Date.parse(row.date))) continue;
    const previous = latest.get(row.currency);
    // For equal timestamps, keep the last observation in source order.
    if (!previous || Date.parse(row.date) >= Date.parse(previous.date)) {
      latest.set(row.currency, { currency: row.currency, price: row.price, date: row.date });
    }
  }
  if (latest.size < 2) throw new Error('Not enough priced tokens are available.');
  return [...latest.values()].sort((a, b) => a.currency.localeCompare(b.currency));
}

export async function loadPrices(fetcher = fetch) {
  const response = await fetcher(PRICE_URL, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Could not load prices.');
  return normalizePrices(await response.json());
}

export function quote(amount, from, to) {
  if (typeof amount !== 'string' || !/^(?:\d+\.?\d*|\.\d+)$/.test(amount.trim())) {
    throw new Error('Enter a positive decimal amount.');
  }
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) throw new Error('Enter an amount greater than zero.');
  if (!from || !to || from.currency === to.currency) throw new Error('Choose two different tokens.');
  if (![from.price, to.price].every(p => Number.isFinite(p) && p > 0)) {
    throw new Error('A price is unavailable for this pair.');
  }
  const received = value * (from.price / to.price);
  if (!Number.isFinite(received) || received <= 0) throw new Error('This amount is outside the supported range.');
  return received;
}

export function formatAmount(value) {
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 8 }).format(value);
}
