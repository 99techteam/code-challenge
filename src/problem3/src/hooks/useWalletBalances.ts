/**
 * Hook for fetching wallet balances
 * In a real application, this would fetch from an API
 */

import { useFetch } from './useFetch';
import { mockWalletBalances } from '../mocks/mockData';
import type { WalletBalance } from '../types';

export const useWalletBalances = (): WalletBalance[] => {
  const { data: balances } = useFetch<WalletBalance[]>({
    fetchFn: async () => {
      // In a real application, this would be:
      // const response = await fetch('/api/wallet-balances', { signal });
      // return response.json();

      // For now, return mock data
      return Promise.resolve(mockWalletBalances);
    },
    initialData: [],
    delay: 100, // Simulate API delay
  });

  return balances;
};
