import { useQuery } from '@tanstack/react-query';
import { fetchPrices } from '../fetchdata';

// Custom hook to get token currency data with caching
export const useGetTokenCurrency = () => {
  return useQuery({
    queryKey: ['tokenCurrency'],
    queryFn: fetchPrices,
  });
};
