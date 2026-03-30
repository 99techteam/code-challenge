import type { Token } from '../types';

export function calcToAmount(fromToken: Token | null, toToken: Token | null, fromAmount: string): string {
  if (!fromToken || !toToken || !fromAmount) return '';
  const num = parseFloat(fromAmount);
  if (isNaN(num) || num < 0) return '';
  return (num * (fromToken.price / toToken.price)).toFixed(6);
}

export function calcFromAmount(fromToken: Token | null, toToken: Token | null, toAmount: string): string {
  if (!fromToken || !toToken || !toAmount) return '';
  const num = parseFloat(toAmount);
  if (isNaN(num) || num < 0) return '';
  return (num * (toToken.price / fromToken.price)).toFixed(6);
}
