import { useMemo } from "react";
import { WalletBalance, EnrichedWalletBalance } from "../types/wallet";
import { getPriority, isSupportedBlockchain } from "../utils/blockchain";

export const useEnrichedWalletBalances = (
  balances: WalletBalance[],
  prices: Record<string, number>
): EnrichedWalletBalance[] => {
  return useMemo<EnrichedWalletBalance[]>(() => {
    return balances
      .filter((balance) => {
        // Only include balances with positive amounts and supported blockchains
        return isSupportedBlockchain(balance.blockchain) && balance.amount > 0;
      })
      .sort((lhs, rhs) => {
        // Sort by priority in descending order (higher priority first)
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        return rightPriority - leftPriority;
      })
      .map((balance) => {
        // Enrich with calculated fields
        const usdValue = (prices[balance.currency] || 0) * balance.amount;
        return {
          ...balance,
          formatted: balance.amount.toFixed(4),
          usdValue,
        };
      });
  }, [balances, prices]);
};
