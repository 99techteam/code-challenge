import React, { useMemo } from "react";

// Fix: add Blockchain defination type
type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // Fix: add missing blockchain property
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface WalletPageProps {
  children?: React.ReactNode;
  className?: string;
}

// Fix: use Map instead of switch statement
const PRIORITY_MAP: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const WalletRow: React.FC<{
  amount: number;
  usdValue: number;
  formattedAmount: string;
}> = ({ formattedAmount, usdValue }) => (
  <div>
    <span>{formattedAmount}</span>
    <span>${usdValue.toFixed(2)}</span>
  </div>
);

const WalletPage: React.FC<WalletPageProps> = ({
  children,
  className,
  ...rest
}) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return (
      balances
        // Fix: keep positive amounts with valid priority
        .filter(
          (balance: WalletBalance) =>
            balance.amount > 0 && PRIORITY_MAP[balance.blockchain] !== undefined
        )

        // Fix: correct condition sort
        .sort((lhs: WalletBalance, rhs: WalletBalance) => {
          const leftPriority = PRIORITY_MAP[lhs.blockchain] ?? -99;
          const rightPriority = PRIORITY_MAP[rhs.blockchain] ?? -99;

          if (leftPriority !== rightPriority) {
            return rightPriority - leftPriority;
          }

          return rhs.amount - lhs.amount;
        })
        // Fix: redundant iteration, combine map with formatted
        .map((balance: FormattedWalletBalance) => ({
          ...balance,
          formatted: balance.amount.toFixed(2),
        }))
    );
  }, [balances]); // Fix: dependency prices is not used

  // Fix: Memoize rows and use unique keys, not use index
  const rows = useMemo(() => {
    return formattedBalances.map((balance: FormattedWalletBalance) => {
      // Fix: prices[balance.currency] may be undefined
      const price = prices[balance.currency] ?? 0;
      const usdValue = price * balance.amount;

      return (
        <WalletRow
          key={`${balance.blockchain}-${balance.currency}`} // Fix: use unique key
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
          className="wallet-row"
        />
      );
    });
  }, [formattedBalances, prices]);

  return (
    <div className={className} {...rest}>
      {children}
      {rows}
    </div>
  );
};
