import { WalletBalance } from '../types';

export const useWalletBalances = (): WalletBalance[] => {
	return [
		{ currency: 'OSMO', amount: 100, blockchain: 'Osmosis' },
		{ currency: 'ETH', amount: 2, blockchain: 'Ethereum' },
		{ currency: 'ARB', amount: 0, blockchain: 'Arbitrum' },
		{ currency: 'ZIL', amount: 500, blockchain: 'Zilliqa' },
		{ currency: 'NEO', amount: -5, blockchain: 'Neo' },
	];
};
