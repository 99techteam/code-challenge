import type { WalletBalance } from '../types';
import { useState, useEffect } from 'react';

// Mock data
const MOCK_BALANCES: WalletBalance[] = [
  {
    token: {
      name: "Ethereum",
      symbol: "ETH",
      price: 1800,
      blockchain: "Ethereum"
    },
    amount: 2.5
  },
  {
    token: {
      name: "USD Coin",
      symbol: "USDC",
      price: 1,
      blockchain: "Polygon"
    },
    amount: 1000
  },
  {
    token: {
      name: "Bitcoin",
      symbol: "BTC",
      price: 35000,
      blockchain: "Bitcoin"
    },
    amount: 0.5
  }
];

export const useWalletBalances = () => {
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setIsLoading(true);
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate random error (10% chance)
        if (Math.random() < 0.1) {
          throw new Error('Failed to fetch wallet balances');
        }
        
        setBalances(MOCK_BALANCES);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, []);

  return { balances, isLoading, error };
};