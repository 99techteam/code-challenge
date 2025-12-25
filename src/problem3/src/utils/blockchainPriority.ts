/**
 * Blockchain priority mapping
 * Moved outside component to prevent recreation on every render
 */

import type { Blockchain } from '../types';

const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
} as const;

const DEFAULT_PRIORITY = -99;

/**
 * Gets the priority value for a given blockchain
 * @param blockchain - The blockchain name
 * @returns Priority number (higher = more important)
 */
export const getPriority = (blockchain: Blockchain): number => {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? DEFAULT_PRIORITY;
};

