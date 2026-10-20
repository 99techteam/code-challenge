import { useState, useEffect } from 'react';

export const INITIAL_PRICES: Record<string, number> = {
  OSMO: 0.3773,
  ATOM: 7.1867,
  ETH: 1645.9337,
  WBTC: 26002.822,
  USDC: 1.0,
  ARB: 1.15,
  ZIL: 0.0165,
  NEO: 7.1283,
  LUNA: 0.4096,
  SHIB: 0.000008,
  SOL: 22.45
};

export function usePrices(): Record<string, number | undefined> {
  const [prices, setPrices] = useState<Record<string, number>>(INITIAL_PRICES);

  // Simulate slight price fluctuation for realistic dynamic behavior
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        // Randomly nudge ETH and ATOM by ±0.05%
        if (next.ETH) {
          next.ETH = Number((next.ETH * (1 + (Math.random() * 0.002 - 0.001))).toFixed(4));
        }
        if (next.ATOM) {
          next.ATOM = Number((next.ATOM * (1 + (Math.random() * 0.002 - 0.001))).toFixed(4));
        }
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return prices;
}

