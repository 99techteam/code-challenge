import { useQuery } from '@tanstack/react-query';
import type { PriceEntry, Token } from '../types';

const ICON_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

function deduplicatePrices(entries: PriceEntry[]): Token[] {
  const grouped = new Map<string, PriceEntry[]>();

  for (const entry of entries) {
    if (!entry.price || entry.price <= 0) continue;
    const existing = grouped.get(entry.currency) || [];
    existing.push(entry);
    grouped.set(entry.currency, existing);
  }

  return Array.from(grouped.entries()).map(([currency, items]) => {
    const sorted = items.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return {
      currency,
      price: sorted[0].price,
      iconUrl: `${ICON_BASE}/${currency}.svg`,
    };
  });
}

async function fetchPrices(): Promise<Token[]> {
  const res = await fetch('https://interview.switcheo.com/prices.json');
  if (!res.ok) throw new Error('Failed to fetch prices');
  const data: PriceEntry[] = await res.json();
  return deduplicatePrices(data);
}

export function usePrices() {
  const { data: tokens = [], isLoading: loading, error } = useQuery({
    queryKey: ['prices'],
    queryFn: fetchPrices,
  });

  return { tokens, loading, error: error?.message ?? null };
}
