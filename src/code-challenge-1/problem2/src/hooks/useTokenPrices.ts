import { useState, useEffect } from 'react';
import type { Token, TokenPrice } from '../types';

const PRICES_URL = 'https://interview.switcheo.com/prices.json';
const ICON_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

export function useTokenPrices() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch(PRICES_URL);
        if (!res.ok) throw new Error('failed to fetch prices');
        const data: TokenPrice[] = await res.json();

        // deduplicate — keep the latest price per currency
        const priceMap = new Map<string, number>();
        for (const entry of data) {
          priceMap.set(entry.currency, entry.price);
        }

        const result: Token[] = Array.from(priceMap.entries()).map(([currency, price]) => ({
          currency,
          price,
          iconUrl: `${ICON_BASE}/${currency}.svg`,
        }));

        setTokens(result.sort((a, b) => a.currency.localeCompare(b.currency)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, []);

  return { tokens, loading, error };
}
