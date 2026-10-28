import type { PriceTable } from '../domain/types.ts';
import type { PriceStatus } from './ports.ts';

export interface SwapState {
  readonly prices: PriceTable;
  /** Sorted symbols that have a price. */
  readonly symbols: readonly string[];
  readonly from: string;
  readonly to: string;
  readonly amountIn: string;
  readonly priceStatus: PriceStatus;
  readonly submitting: boolean;
}

export function createInitialState(): SwapState {
  return {
    prices: new Map(),
    symbols: [],
    from: 'ETH',
    to: 'USDC',
    amountIn: '',
    priceStatus: 'loading',
    submitting: false,
  };
}
