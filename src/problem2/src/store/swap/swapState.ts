import type { Token } from "../token/tokenState";

export interface SwapState {
  fromToken: Token;
  toToken: Token;
  amount: number;
  result?: number | null;
  exchangeRate?: Record<string, Record<string, number>>;
}

export const initialState: SwapState = {
  fromToken: {} as Token,
  toToken: {} as Token,
  amount: 0,
  result: null,
  exchangeRate: {}
};
