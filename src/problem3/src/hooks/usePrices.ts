/**
 * Hook for fetching currency prices
 * In a real application, this would fetch from a price API
 */

import { useFetch } from './useFetch';
import { mockPrices } from '../mocks/mockData';
import type { Prices } from '../types';

export const usePrices = (): Prices => {
  const { data: prices } = useFetch<Prices>({
    fetchFn: async () => {
      // In a real application, this would be:
      // const response = await fetch('/api/prices', { signal });
      // return response.json();

      // For now, return mock data
      return Promise.resolve(mockPrices);
    },
    initialData: {},
    delay: 100, // Simulate API delay
  });

  return prices;
};
