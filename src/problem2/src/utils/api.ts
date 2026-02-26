import type { PriceData } from '../types';

const PRICES_API_URL = 'https://interview.switcheo.com/prices.json';
const ICON_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

export const getTokenIconUrl = (symbol: string): string =>
  `${ICON_BASE_URL}/${symbol}.svg`;

interface PriceItem {
  currency: string;
  price: number;
  date: string;
}

export const fetchTokenPrices = async (): Promise<Map<string, PriceData>> => {
  const response = await fetch(PRICES_API_URL);
  if (!response.ok) throw new Error('Failed to fetch prices');
  const data: PriceItem[] = await response.json();

  const priceMap = new Map<string, PriceData>();
  for (const item of data) {
    if (!item.currency || typeof item.price !== 'number' || item.price <= 0) continue;
    const existing = priceMap.get(item.currency);
    if (!existing || new Date(item.date) > new Date(existing.date)) {
      priceMap.set(item.currency, { price: item.price, date: item.date });
    }
  }
  return priceMap;
};

export const simulateSwapRequest = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 1500));
