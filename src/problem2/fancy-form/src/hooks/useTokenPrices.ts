import { useQuery } from '@tanstack/react-query';
import { fetchTokenPrices } from '@/api/prices';
import { processTokenPrices } from '@/utils/token';
import type { Token } from '@/types';

const QUERY_KEY = ['token-prices'] as const;

/**
 * React Query hook for fetching and processing token prices.
 * - Deduplicates tokens
 * - Resolves icon URLs
 * - Auto-refreshes every 60s
 * - Stale after 30s
 */
export function useTokenPrices() {
  return useQuery<Token[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const rawPrices = await fetchTokenPrices();
      return processTokenPrices(rawPrices);
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10_000),
  });
}
