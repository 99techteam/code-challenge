import { useState, useCallback, useEffect, useMemo } from 'react';
import { fetchTokenPrices } from '../utils/api';

type PriceMap = Map<string, { price: number; date: string }>;

export const useTokenPrices = () => {
  const [priceMap, setPriceMap] = useState<PriceMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const map = await fetchTokenPrices();
      setPriceMap(map);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => load(), [load]);

  const tokens = useMemo(() => Array.from(priceMap.keys()).sort(), [priceMap]);
  return { priceMap, tokens, loading, error, lastUpdated, retry };
};
