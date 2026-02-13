import { useQuery } from "@tanstack/react-query";
import { priceService } from "@api";
import type { TokenPriceType } from "@types";
import { queryConfig } from "@common";

const queryKeys = {
  all: ["prices"] as const,
};

export const useAllPrices = () => {
  return useQuery<TokenPriceType[]>({
    ...queryConfig,
    queryKey: queryKeys.all,
    queryFn: () => priceService.getTokenPrice(),
  });
};
