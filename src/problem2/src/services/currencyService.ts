import type { PriceRecord } from '../types/currency';

const PRICES_URL = 'https://interview.switcheo.com/prices.json';
const ICON_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

export const getIconUrl = (currency: string) => `${ICON_BASE}/${encodeURIComponent(currency)}.svg`;

export async function fetchCurrencies(): Promise<PriceRecord[]> {
  const response = await fetch(PRICES_URL);
  if (!response.ok) throw new Error(`Unable to load prices (${response.status})`);
  const records = (await response.json()) as PriceRecord[];
  const latest = new Map<string, PriceRecord>();
  for (const item of records) {
    if (!item?.currency || !Number.isFinite(item.price) || item.price <= 0) continue;
    const previous = latest.get(item.currency);
    if (!previous || new Date(item.date).getTime() >= new Date(previous.date).getTime()) latest.set(item.currency, item);
  }
  return [...latest.values()].sort((a, b) => a.currency.localeCompare(b.currency));
}

export function convert(amount: number, from: PriceRecord, to: PriceRecord): number {
  return amount * from.price / to.price;
}
