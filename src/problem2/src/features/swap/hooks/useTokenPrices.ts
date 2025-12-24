import { useQuery } from '@tanstack/react-query';
import { fetchPrices } from '../services/priceService';

export function useTokenPrices() {
  return useQuery({
    queryKey: ['token-prices'],
    queryFn: fetchPrices,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}
