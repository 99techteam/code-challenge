/**
 * Mock data for development and testing
 * In a real application, this data would come from API endpoints
 */

import type { WalletBalance, Prices } from '../types';

/**
 * Mock wallet balances data
 */
export const mockWalletBalances: WalletBalance[] = [
  { currency: 'OSMO', amount: 100.5, blockchain: 'Osmosis' },
  { currency: 'ETH', amount: 50.25, blockchain: 'Ethereum' },
  { currency: 'ARB', amount: 200.75, blockchain: 'Arbitrum' },
  { currency: 'ZIL', amount: 10.0, blockchain: 'Zilliqa' },
  { currency: 'NEO', amount: 5.5, blockchain: 'Neo' },
  { currency: 'USDT', amount: 0, blockchain: 'Ethereum' }, // Should be filtered out
  { currency: 'USDC', amount: -10, blockchain: 'Ethereum' }, // Should be filtered out
];

/**
 * Mock currency prices data
 */
export const mockPrices: Prices = {
  OSMO: 1.5,
  ETH: 2500.0,
  ARB: 1.2,
  ZIL: 0.05,
  NEO: 15.0,
  USDT: 1.0,
  USDC: 1.0,
};
