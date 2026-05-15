import { getTokenIcon } from '@/common/constants/token-mapping';
import type { Token } from '@/common/types/token';
import { TokenService } from '@/services/token.service';
import { create } from 'zustand';

export interface TokenServiceState {
  payToken: Token;
  recvToken: Token;
  tokens: Token[];
  loading: boolean;
  setPayToken: (token: Token) => void;
  setRecvToken: (token: Token) => void;
  setLoading: (loading: boolean) => void;
  fetchTokens: () => Promise<Token[] | null>;
}

export const useTokenStore = create<TokenServiceState>()((set, get) => ({
  payToken: {
    currency: 'USDT',
    date: '',
    price: 0,
  },
  recvToken: {
    currency: 'ETH',
    date: '',
    price: 0,
  },
  tokens: [],
  loading: false,
  setPayToken: (token: Token) => set({ payToken: token }),
  setRecvToken: (token: Token) => set({ recvToken: token }),
  setLoading: (loading: boolean) => set({ loading }),
  fetchTokens: async () => {
    set({ loading: true });
    try {
      const res = await TokenService.getTokens();
      const tokenMap = new Map<string, Token>();

      // Because there are some duplicated coin so we need to create a map to store unique tokens, also mapping icon for each token
      const formattedResponse = res.reduce((acc, token) => {
        if (tokenMap.has(token.currency)) return acc;
        const newToken = {
          ...token,
          symbol: getTokenIcon(token.currency),
        };

        tokenMap.set(token.currency, newToken);
        acc.push(newToken);
        return acc;
      }, [] as Token[]);

      set({
        tokens: formattedResponse,
        payToken: formattedResponse[0],
        recvToken: formattedResponse[1],
      });
      return res;
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));
