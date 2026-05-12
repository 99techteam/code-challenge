import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Token, SwapQuote, DefaultToken } from "../types";
import { FEE_PERCENT } from "../constants/tokens";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const removeDuplicatePrices = (data: DefaultToken[]) =>
  data.reduce<DefaultToken[]>((acc, current) => {
    const existing = acc.find((item) => item.currency === current.currency);

    if (!existing) {
      acc.push(current);
      return acc;
    }

    if (new Date(current.date) > new Date(existing.date)) {
      Object.assign(existing, current);
    }

    return acc;
  }, []);

export function parseAmount(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

export function calculateSwapQuote(
  fromAmount: string,
  fromToken: Token,
  toToken: Token,
): SwapQuote | null {
  const amount = parseAmount(fromAmount);
  if (!amount || amount <= 0) return null;
  const rate = fromToken?.price / toToken?.price;
  const feeMultiplier = 1 - FEE_PERCENT / 100;
  const toAmount = amount * rate * feeMultiplier;

  return {
    fromAmount,
    toAmount: toAmount.toFixed(6),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
