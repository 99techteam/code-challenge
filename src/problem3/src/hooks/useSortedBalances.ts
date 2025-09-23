import type { WalletBalance, FormattedWalletBalance } from '../types';
import { useMemo } from 'react';
import { BLOCKCHAIN_PRIORITIES } from '../constants';

export const useSortedBalances = (balances: WalletBalance[]): FormattedWalletBalance[] => {
  return useMemo(() => {
    return balances
      .map((balance): FormattedWalletBalance => ({
        ...balance,
        formatted: balance.amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6
        }),
        usdValue: balance.token.price * balance.amount
      }))
      .sort((a, b) => {
        // Sort by blockchain priority first
        const blockchainPriorityDiff = 
          (BLOCKCHAIN_PRIORITIES[a.token.blockchain as keyof typeof BLOCKCHAIN_PRIORITIES] || 999) -
          (BLOCKCHAIN_PRIORITIES[b.token.blockchain as keyof typeof BLOCKCHAIN_PRIORITIES] || 999);
        
        if (blockchainPriorityDiff !== 0) return blockchainPriorityDiff;

        // Then sort by USD value
        return b.usdValue - a.usdValue;
      });
  }, [balances]);
};