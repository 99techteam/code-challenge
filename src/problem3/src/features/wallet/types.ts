export type Blockchain =
    | 'Osmosis'
    | 'Ethereum'
    | 'Arbitrum'
    | 'Zilliqa'
    | 'Neo'
    | string;

export interface WalletBalance {
    currency: string;
    amount: number;
    blockchain: Blockchain;
}
