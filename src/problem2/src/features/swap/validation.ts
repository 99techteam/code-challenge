import type { SwapSelection, SwapValidationResult, TokenPrice } from '../../types/index.ts';

export function parseAmount(value: string): number | null {
  const normalized = value.trim().replaceAll(',', '');
  if (!normalized) return null;
  if (!/^\d*\.?\d+$/.test(normalized) && !/^\d+\.$/.test(normalized)) return Number.NaN;
  return Number(normalized);
}

export function validateSwap(
  amountText: string,
  selected: SwapSelection,
  tokens: TokenPrice[],
  payBalance: number,
): SwapValidationResult {
  const amount = parseAmount(amountText);
  if (amount === null || amount === 0) {
    return { valid: false, reason: 'empty', message: '' };
  }
  if (!Number.isFinite(amount) || amount < 0) {
    return {
      valid: false,
      reason: 'invalid',
      message: 'Enter a valid amount using numbers and a decimal point.',
    };
  }
  if (selected.pay === selected.receive) {
    return { valid: false, reason: 'same-token', message: 'Choose two different tokens to make a swap.' };
  }

  const payToken = tokens.find((token) => token.currency === selected.pay);
  const receiveToken = tokens.find((token) => token.currency === selected.receive);
  if (!payToken || !receiveToken) {
    return { valid: false, reason: 'unavailable', message: 'A price is not available for this token pair.' };
  }
  if (amount > payBalance) {
    return { valid: false, reason: 'balance', message: `Your demo balance is ${payBalance} ${selected.pay}.` };
  }

  const receiveAmount = amount * payToken.price / receiveToken.price;
  if (!Number.isFinite(receiveAmount)) {
    return { valid: false, reason: 'unavailable', message: 'Could not calculate a quote for this token pair.' };
  }

  return {
    valid: true,
    quote: {
      payAmount: amount,
      receiveAmount,
      paySymbol: selected.pay,
      receiveSymbol: selected.receive,
    },
  };
}
