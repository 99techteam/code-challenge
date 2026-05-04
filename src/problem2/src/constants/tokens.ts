import { Token } from '../types';
import pricesData from '../prices.json';

type PriceEntry = { currency: string; date: string; price: number };

const latestPrice = (symbol: string) => {
  const items = (pricesData as PriceEntry[]).filter(
    (p) => p.currency.toUpperCase() === symbol.toUpperCase()
  );
  if (items.length === 0) return 0;
  return items.reduce((a, b) =>
    new Date(b.date).getTime() > new Date(a.date).getTime() ? b : a
  ).price;
};

// Eagerly import all token icons (svg/png) and build a symbol -> url map
const iconModules = import.meta.glob<{ default: string }>(
  '../tokens/*.{svg,png}',
  { eager: true }
);

const iconMap: Record<string, string> = {};
for (const path in iconModules) {
  const file = path.split('/').pop()!;
  const base = file.replace(/\.(svg|png)$/i, '');
  iconMap[base.toUpperCase()] = (iconModules[path] as any).default;
}

const FRIENDLY_NAMES: Record<string, string> = {
  ETH: 'Ethereum',
  WBTC: 'Wrapped Bitcoin',
  USDC: 'USD Coin',
  BUSD: 'Binance USD',
  ATOM: 'Cosmos',
  OSMO: 'Osmosis',
};

const DEFAULT_BALANCES: Record<string, number> = {
  ETH: 1.5,
  WBTC: 0.05,
  USDC: 5000,
  BUSD: 3000,
  ATOM: 25,
  OSMO: 100,
};

// Build full token list from prices.json currencies
const currencies = Array.from(
  new Set((pricesData as PriceEntry[]).map((p) => p.currency))
);

export const MOCK_TOKENS: Token[] = currencies.map((symbol) => {
  const upper = symbol.toUpperCase();
  const icon =
    iconMap[upper] ??
    // Try some common alt naming fallbacks
    (upper === 'USD' ? iconMap['USDC'] : undefined) ??
    iconMap['ETH']; // final fallback

  return {
    symbol: upper,
    name: FRIENDLY_NAMES[upper] ?? upper,
    icon,
    balance: DEFAULT_BALANCES[upper] ?? 0,
    price: latestPrice(upper),
  };
});
