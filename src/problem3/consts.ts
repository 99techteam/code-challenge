import type { Blockchain } from './models';

export const PRIORITY_BY_CHAIN: Readonly<Partial<Record<Blockchain, number>>> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

export const UNKNOWN_PRIORITY = -99;
