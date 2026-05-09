import type { WalletBalance } from './models';

/** Replace with your app’s data layer (context, React Query, etc.). */
export function useWalletBalances(): WalletBalance[] {
  return [];
}

/** Replace with your price feed / store. */
export function usePrices(): Readonly<Record<string, number>> {
  return {};
}
