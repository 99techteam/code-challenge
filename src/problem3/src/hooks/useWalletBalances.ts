import type { WalletBalance } from "../App"

export const useWalletBalances = (): WalletBalance[] => {
    // fake mockup of WalletBalance data. in reality we fetch from an API
    return [
        {
            blockchain: "Ethereum",
            currency: "ETH",
            amount: 123
        },
        {
            blockchain: "Osmosis",
            currency: "BTC",
            amount: 472
        },
        {
            blockchain: "Arbitrum",
            currency: "Pi",
            amount: 92
        }
    ]
}