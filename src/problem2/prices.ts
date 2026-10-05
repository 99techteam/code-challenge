import { useEffect, useState } from 'react';
import { normalizePrices, type Token } from './swap';

export const PRICE_URL = 'https://interview.switcheo.com/prices.json';
type PriceState =
  | { status: 'loading'; tokens: Token[] }
  | { status: 'ready'; tokens: Token[] }
  | { status: 'error'; tokens: Token[]; message: string };

export function useTokenPrices() {
  const [state, setState] = useState<PriceState>({
    status: 'loading',
    tokens: [],
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    setState({ status: 'loading', tokens: [] });

    async function load() {
      try {
        const response = await fetch(PRICE_URL, { signal: controller.signal });
        if (!response.ok) throw new Error('Price request failed.');
        const tokens = normalizePrices(await response.json());
        if (active) setState({ status: 'ready', tokens });
      } catch {
        if (active)
          setState({
            status: 'error',
            tokens: [],
            message: 'Prices are unavailable. Please try again.',
          });
      } finally {
        window.clearTimeout(timeout);
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [attempt]);

  return { ...state, retry: () => setAttempt((value) => value + 1) };
}
