import { BlockchainType } from '../types';

const BLOCKCHAIN_PRIORITIES: Record<BlockchainType, number> = {
	Osmosis: 100,
	Ethereum: 50,
	Arbitrum: 30,
	Zilliqa: 20,
	Neo: 20,
};

export const getPriority = (blockchain: BlockchainType): number => {
	return BLOCKCHAIN_PRIORITIES[blockchain] ?? -99;
};
