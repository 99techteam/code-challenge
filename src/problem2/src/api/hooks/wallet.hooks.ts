import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { walletService } from "@api";
import type { ExchangeFormData, WalletType } from "@types";
import { queryConfig } from "@common";

export const walletQueryKeys = {
  all: ["wallets"] as const,
};

export const useWallets = () => {
  return useQuery<WalletType[]>({
    ...queryConfig,
    queryKey: walletQueryKeys.all,
    queryFn: () => walletService.getWallets(),
  });
};

export const useExchangeWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ExchangeFormData) => {
      await walletService.exchangeWallet(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletQueryKeys.all });
    },
  });
};
