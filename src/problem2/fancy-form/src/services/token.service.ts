import type { TokenBalanceResponse, TokenResponse } from '@/common/types/token';
import balanceData from '@/data/balance.json';
import tokensData from '@/data/prices.json';

export const TokenService = {
  getTokens: async (): Promise<TokenResponse[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(tokensData), 1000)
    );
  },
  getBalances: async (): Promise<TokenBalanceResponse[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(balanceData), 1000)
    );
  },
};
