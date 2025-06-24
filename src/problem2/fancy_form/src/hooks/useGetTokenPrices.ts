import { fetchTokenPrices } from "@/services/tokenService";
import type { Token } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useGetTokenPrices = () => {
  return useQuery<Token[]>({
    queryKey: ["tokenPrices"],
    queryFn: fetchTokenPrices,
    staleTime: 1000 * 60,
  });
};
