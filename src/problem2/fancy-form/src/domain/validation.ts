import { parseAmount } from './amount.ts';

export interface SwapInput {
  readonly from: string;
  readonly to: string;
  readonly amountIn: string;
  readonly hasRate: boolean;
}

export interface SwapValidation {
  readonly valid: boolean;
  /** User-facing message; empty when there is nothing to report. */
  readonly error: string;
}

export function validateSwap({ from, to, amountIn, hasRate }: SwapInput): SwapValidation {
  const amount = parseAmount(amountIn);

  if (from === to) return { valid: false, error: 'Select two different currencies to swap.' };
  if (amountIn !== '' && amount === null) return { valid: false, error: 'Enter a valid number.' };
  if (amount !== null && amount <= 0) return { valid: false, error: 'Amount must be greater than zero.' };

  // An empty amount or missing price is incomplete, not an error worth showing.
  return { valid: amount !== null && hasRate, error: '' };
}
