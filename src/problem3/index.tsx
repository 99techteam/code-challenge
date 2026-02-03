import React, { useMemo } from "react";

type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo" | string;

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface DisplayWalletBalance extends WalletBalance {
  priority: number;
  formatted: string;
  usdValue: number;
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

const PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: Blockchain): number => PRIORITY[blockchain] ?? -99;

// ✅ Replace these with your real imports
const useWalletBalances = (): WalletBalance[] => [];
const usePrices = (): Record<string, number> => ({});

// ✅ Replace with your real component
const WalletRow: React.FC<{
  amount: number;
  usdValue: number;
  formattedAmount: string;
  className?: string;
}> = () => null;

export const WalletPage: React.FC<Props> = (props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const displayBalances = useMemo<DisplayWalletBalance[]>(() => {
    return balances
      .map((b) => {
        const priority = getPriority(b.blockchain);
        const price = prices[b.currency] ?? 0;

        return {
          ...b,
          priority,
          usdValue: price * b.amount,
          formatted: b.amount.toFixed(),
        };
      })
      .filter((b) => b.priority > -99 && b.amount > 0)
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.currency.localeCompare(b.currency);
      });
  }, [balances, prices]);

  return (
    <div {...props}>
      {displayBalances.map((b) => (
        <WalletRow
          key={`${b.blockchain}:${b.currency}`}
          amount={b.amount}
          usdValue={b.usdValue}
          formattedAmount={b.formatted}
        />
      ))}
    </div>
  );
};
