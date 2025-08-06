import { useState, useEffect } from 'react';
import type { EnrichedToken } from '@/types/swap';
import { calculateExchangeRate } from '@/lib/precision';

export const useExchangeRate = (
  fromToken: EnrichedToken | null,
  toToken: EnrichedToken | null
) => {
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);

  // Calculate exchange rate when tokens change
  useEffect(() => {
    if (fromToken && toToken) {
      const fromPrice = fromToken.price || 0;
      const toPrice = toToken.price || 0;

      if (fromPrice > 0 && toPrice > 0) {
        const rate = calculateExchangeRate(fromPrice, toPrice);
        setExchangeRate(rate);
      } else {
        setExchangeRate(null);
      }
    } else {
      setExchangeRate(null);
    }
  }, [fromToken, toToken]);

  return {
    exchangeRate,
  };
};