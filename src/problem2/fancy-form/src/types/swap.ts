export const SwapDirection = {
  SELL: 'sell',
  BUY: 'buy',
} as const;

export type SwapDirection = (typeof SwapDirection)[keyof typeof SwapDirection];

export const SwapStatus = {
  IDLE: 'idle',
  CONFIRMING: 'confirming',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type SwapStatus = (typeof SwapStatus)[keyof typeof SwapStatus];

export interface SwapFormState {
  sellToken: import('./token').Token | null;
  buyToken: import('./token').Token | null;
  sellAmount: string;
  buyAmount: string;
  status: SwapStatus;
}
