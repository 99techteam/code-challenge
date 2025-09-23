import { useState, useEffect } from 'react';

const MOCK_PRICES: Record<string, number> = {
  'ETH': 1800,
  'USDC': 1,
  'BTC': 35000
};

export const usePrices = () => {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    // Simulate API call
    const fetchPrices = () => {
      setPrices(MOCK_PRICES);
    };

    fetchPrices();
  }, []);

  return prices;
};