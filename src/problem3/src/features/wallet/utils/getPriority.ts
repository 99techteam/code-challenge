import type { Blockchain } from '../types.ts';

const PRIORITY_MAP: Record<Blockchain, number> = {
    Osmosis: 100,
    Ethereum: 50,
    Arbitrum: 30,
    Zilliqa: 20,
    Neo: 20,
};

const getPriority = (blockchain: Blockchain): number =>
    PRIORITY_MAP[blockchain] ?? -99;

export default getPriority;
