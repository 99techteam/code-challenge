import { useQuery } from "@tanstack/react-query";
import { fetchCurrencies } from "../services/apiService";

export function useCurrencies() {
  const {
    data: currencies = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["currencies"],
    queryFn: fetchCurrencies,
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  return { currencies, isPending, error };
}
