import { WalletBalance } from "../types/wallet";

export const usePrices = (): Record<string, number> => {
  return {
    OSMO: 0.5,
    ETH: 3500.0,
    USDC: 1.0,
    ZIL: 0.025,
    BNB: 600.0,
    NEO: 15.0,
    BTC: 68000.0,
  };
};

export const useWalletBalances = (): WalletBalance[] => {
  return [
    { currency: "OSMO", amount: 15.5, blockchain: "Osmosis" },
    { currency: "ETH", amount: 0.12, blockchain: "Ethereum" },
    { currency: "USDC", amount: 500.0, blockchain: "Arbitrum" },
    { currency: "ZIL", amount: 10000, blockchain: "Zilliqa" },
    { currency: "BNB", amount: 1.0, blockchain: "Binance" },
    { currency: "ETH", amount: 0.0, blockchain: "Ethereum" }, // Filtered out (amount <= 0)
    { currency: "NEO", amount: 5.0, blockchain: "Neo" },
    { currency: "BTC", amount: 0.005, blockchain: "Bitcoin" }, // Filtered out (priority -99)
  ];
};
