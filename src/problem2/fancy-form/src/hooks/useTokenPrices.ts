import { useState, useEffect } from 'react';
import type { Token, TokenPrice } from '../types';

const PRICES_URL = 'https://interview.switcheo.com/prices.json';
const ICON_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

// Deduplicate by currency, keeping latest date entry
function deduplicatePrices(prices: TokenPrice[]): TokenPrice[] {
  const map = new Map<string, TokenPrice>();
  for (const p of prices) {
    const existing = map.get(p.currency);
    if (!existing || new Date(p.date) > new Date(existing.date)) {
      map.set(p.currency, p);
    }
  }
  return Array.from(map.values());
}

export function useTokenPrices() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const res = await fetch(PRICES_URL);
        if (!res.ok) throw new Error('Failed to fetch prices');
        const data: TokenPrice[] = await res.json();

        const unique = deduplicatePrices(data.filter((p) => p.price > 0));
        const tokenList: Token[] = unique.map((p) => ({
          symbol: p.currency,
          price: p.price,
          iconUrl: `${ICON_BASE}/${p.currency}.svg`,
        }));

        // Sort alphabetically
        tokenList.sort((a, b) => a.symbol.localeCompare(b.symbol));
        setTokens(tokenList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  return { tokens, loading, error };
}
