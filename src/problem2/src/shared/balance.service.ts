import type { DemoBalances, SwapQuote } from '../types/index.ts';
import { AppError } from '../errors/app-error.ts';

const STORAGE_KEY = 'orbit-demo-balances-v1';

export const INITIAL_BALANCES: Readonly<DemoBalances> = Object.freeze({
  USDC: 2480.5,
  USD: 900,
  ETH: 1.24,
  BTC: 0.08,
  OSMO: 850,
  ATOM: 44,
  SWTH: 22000,
  BUSD: 1200,
  USDT: 540,
});

export function getBalances(): DemoBalances {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    const stored: unknown = rawValue ? JSON.parse(rawValue) : {};
    const balances: DemoBalances = { ...INITIAL_BALANCES };
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      for (const [symbol, amount] of Object.entries(stored)) {
        if (typeof amount === 'number' && Number.isFinite(amount) && amount >= 0) {
          balances[symbol] = amount;
        }
      }
    }
    return balances;
  } catch {
    return { ...INITIAL_BALANCES };
  }
}

export function getBalance(symbol: string): number {
  return getBalances()[symbol] ?? 0;
}

export function applyDemoSwap(quote: SwapQuote): void {
  const balances = getBalances();
  balances[quote.paySymbol] = Math.max(0, getBalance(quote.paySymbol) - quote.payAmount);
  balances[quote.receiveSymbol] = getBalance(quote.receiveSymbol) + quote.receiveAmount;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(balances));
  } catch {
    throw new AppError('Could not save demo balances in this browser.');
  }
}
