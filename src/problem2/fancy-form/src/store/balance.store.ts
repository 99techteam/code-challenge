import { getTokenIcon } from '@/common/constants/token-mapping';
import type { TokenBalance, TokenBalanceResponse } from '@/common/types/token';
import { TokenService } from '@/services/token.service';
import { create } from 'zustand';

export interface BalanceStore {
  loading: boolean;
  fetchBalances: () => Promise<void>;
  updateBalances: (amount: number, currency: string) => void;
  balances: TokenBalance[];
  balanceMap: Map<string, TokenBalance>;
  getBalanceByCurrency: (currency: string) => TokenBalance;
  setBalances: (balances: TokenBalance[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useBalanceStore = create<BalanceStore>((set, get) => ({
  loading: false,
  balanceMap: new Map<string, TokenBalance>(),
  fetchBalances: async () => {
    set({ loading: true });
    try {
      const balances = await TokenService.getBalances();

      const balanceMap = new Map<string, TokenBalance>();
      const newBalances = balances.reduce((acc, balance) => {
        const formattedBalance = {
          ...balance,
          symbol: getTokenIcon(balance.currency),
        };

        acc.push(formattedBalance);
        balanceMap.set(balance.currency, formattedBalance);

        return acc;
      }, [] as TokenBalance[]);

      set({ balances: newBalances, balanceMap });
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    } finally {
      set({ loading: false });
    }
  },
  getBalanceByCurrency: (currency: string) => {
    const { balanceMap } = get();

    return balanceMap.get(currency) || { amount: 0, currency };
  },
  setBalances: (balances: TokenBalance[]) => set({ balances }),
  setLoading: (loading: boolean) => set({ loading }),
  updateBalances: (amount: number, currency: string) => {
    const { balanceMap } = get();
    const balance = balanceMap.get(currency) || {
      amount: 0,
      currency,
      symbol: getTokenIcon(currency),
    };

    balanceMap.set(currency, { ...balance, amount });
    set({ balanceMap });
  },
  balances: [],
}));
