import { useEffect, useState } from 'react';
import type { PriceRecord, Token } from '../types';
import { PRICES_URL, tokensFromPrices } from '../lib/tokens';

interface PricesState {
  tokens: Token[];
  /** Quick symbol -> price lookup. */
  priceOf: (symbol: string) => number | undefined;
  loading: boolean;
  error: string | null;
}

/** Fetches the price feed once and exposes the derived token list. */
export function usePrices(): PricesState {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(PRICES_URL);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = (await res.json()) as PriceRecord[];
        if (cancelled) return;
        setTokens(tokensFromPrices(data));
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load prices');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const priceOf = (symbol: string) =>
    tokens.find((t) => t.symbol === symbol)?.price;

  return { tokens, priceOf, loading, error };
}
