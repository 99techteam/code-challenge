import { useState, useCallback, useEffect } from 'react';
import { fetchTokenPrices } from '../utils/api';

type PriceMap = Map<string, { price: number; date: string }>;

/** Cache the in-flight or last successful request so effect re-runs (e.g. Strict Mode) don't duplicate the API call. */
let cachedPricesPromise: Promise<PriceMap> | null = null;

export const useTokenPrices = () => {
  const [priceMap, setPriceMap] = useState<PriceMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (isRetry = false) => {
    if (isRetry) cachedPricesPromise = null;
    setLoading(true);
    setError(null);

    if (cachedPricesPromise) {
      try {
        const map = await cachedPricesPromise;
        setPriceMap(map);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
      return;
    }

    const promise = fetchTokenPrices();
    cachedPricesPromise = promise;
    try {
      const map = await promise;
      setPriceMap(map);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      cachedPricesPromise = null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let id: number;
    const useIdle = typeof window.requestIdleCallback === 'function';
    if (useIdle) {
      id = window.requestIdleCallback(() => load(), { timeout: 300 });
    } else {
      id = window.setTimeout(load, 0) as unknown as number;
    }
    return () => {
      if (useIdle) window.cancelIdleCallback!(id);
      else clearTimeout(id);
    };
  }, [load]);

  const retry = useCallback(() => load(true), [load]);

  const tokens = Array.from(priceMap.keys()).sort();
  return { priceMap, tokens, loading, error, lastUpdated, retry };
};
