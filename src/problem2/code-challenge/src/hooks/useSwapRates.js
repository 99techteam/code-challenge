import { useQuery } from '@tanstack/react-query'
import getSwapRates from '../api/services/swapRateService.js'

function useSwapRates() {
  const { data: swapRates, isLoading: loading, error } = useQuery({
    queryKey: ['swapRates'],
    queryFn: ({ signal }) => getSwapRates({ signal }),
    staleTime: 0,
    refetchInterval: 1000,
  })

  return { swapRates, loading, error }
}

export default useSwapRates
