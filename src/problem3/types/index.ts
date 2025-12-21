export type BlockchainType =
	| 'Osmosis'
	| 'Ethereum'
	| 'Arbitrum'
	| 'Zilliqa'
	| 'Neo';

export interface WalletBalance {
	currency: string;
	amount: number;
	blockchain: BlockchainType;
}

// Mock BoxProps (giả sử component này extend từ UI Library như MUI)
export interface BoxProps {
	className?: string;
	children?: React.ReactNode;
	style?: React.CSSProperties;
}
