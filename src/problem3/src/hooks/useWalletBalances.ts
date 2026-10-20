import { useState } from 'react';
import { WalletBalance } from '../types/wallet';

export const INITIAL_BALANCES: WalletBalance[] = [
  // Osmosis (Priority 100)
  { currency: 'OSMO', amount: 450.25, blockchain: 'Osmosis' },
  { currency: 'ATOM', amount: 35.8, blockchain: 'Osmosis' },

  // Ethereum (Priority 50)
  { currency: 'ETH', amount: 2.45, blockchain: 'Ethereum' },
  { currency: 'WBTC', amount: 0.15, blockchain: 'Ethereum' },

  // Arbitrum (Priority 30)
  { currency: 'USDC', amount: 3200.0, blockchain: 'Arbitrum' },
  { currency: 'ARB', amount: 850.0, blockchain: 'Arbitrum' },

  // Zilliqa (Priority 20)
  { currency: 'ZIL', amount: 15000.0, blockchain: 'Zilliqa' },

  // Neo (Priority 20)
  { currency: 'NEO', amount: 42.0, blockchain: 'Neo' },

  // --- Edge cases that should be filtered out automatically ---
  // 1. Zero balance (amount <= 0)
  { currency: 'LUNA', amount: 0, blockchain: 'Osmosis' },

  // 2. Negative balance (amount < 0)
  { currency: 'SHIB', amount: -1000000, blockchain: 'Ethereum' },

  // 3. Unknown / Unsupported blockchain (priority = -99)
  { currency: 'SOL', amount: 18.5, blockchain: 'Solana' }
];

export function useWalletBalances(): WalletBalance[] {
  const [balances] = useState<WalletBalance[]>(INITIAL_BALANCES);
  return balances;
}

