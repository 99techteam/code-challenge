export type PriceRecord = { currency: string; date: string; price: number };
export type TokenPrice = PriceRecord;

export function normalizePrices(input: unknown): TokenPrice[] {
  if (!Array.isArray(input)) throw new Error('The price feed returned an unexpected format.');
  const latest = new Map<string, TokenPrice>();
  for (const row of input as PriceRecord[]) {
    if (!row || typeof row.currency !== 'string' || !row.currency.trim() ||
        typeof row.price !== 'number' || !Number.isFinite(row.price) || row.price <= 0 ||
        typeof row.date !== 'string' || !Number.isFinite(Date.parse(row.date))) continue;
    const currency = row.currency.trim();
    const previous = latest.get(currency);
    if (!previous || Date.parse(row.date) >= Date.parse(previous.date)) {
      latest.set(currency, { currency, price: row.price, date: row.date });
    }
  }
  if (latest.size < 2) throw new Error('There are not enough priced currencies to make a quote.');
  return [...latest.values()].sort((a, b) => a.currency.localeCompare(b.currency));
}

export function parseAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function quote(amount: number, from: TokenPrice, to: TokenPrice): number {
  return amount * from.price / to.price;
}

export function formatAmount(amount: number, digits = 8): string {
  if (amount > 0 && amount < 10 ** -digits) return '< ' + (10 ** -digits);
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(amount);
}
