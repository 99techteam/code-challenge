export default function useWalletBalances() {
    // Mock balances for demonstration purposes
    return [
        { currency: 'OSMO', amount: 100, blockchain: 'Osmosis' },
        { currency: 'ETH', amount: 0, blockchain: 'Ethereum' },
        { currency: 'BTC', amount: 0.5, blockchain: 'Bitcoin' },
    ];
}
