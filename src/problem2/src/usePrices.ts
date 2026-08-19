import { useEffect, useState } from 'react';
import type { Token } from './types';

const PRICES_URL = 'https://interview.switcheo.com/prices.json';

interface RawPrice {
  currency: string;
  date: string;
  price: number;
}

export function usePrices() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(PRICES_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load prices (${res.status})`);
        return res.json() as Promise<RawPrice[]>;
      })
      .then((raw) => {
        if (cancelled) return;

        const latestByCurrency = new Map<string, RawPrice>();
        for (const entry of raw) {
          const existing = latestByCurrency.get(entry.currency);
          if (!existing || new Date(entry.date) > new Date(existing.date)) {
            latestByCurrency.set(entry.currency, entry);
          }
        }

        const list = Array.from(latestByCurrency.values())
          .filter((entry) => entry.price > 0)
          .map((entry) => ({ symbol: entry.currency, price: entry.price }))
          .sort((a, b) => a.symbol.localeCompare(b.symbol));

        setTokens(list);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load prices');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { tokens, loading, error };
}
