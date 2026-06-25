/**
 * Refactored WalletPage — see README.md for the full issue list.
 *
 * External hooks and components are declared as stubs so this file
 * can be type-checked in isolation.
 */

import React, { useMemo } from "react";

type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

// `blockchain` was missing from the original interface.
interface WalletBalance {
  blockchain: Blockchain;
  currency: string;
  amount: number;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// stubs — replace with real imports in the actual project
interface BoxProps {
  className?: string;
  [key: string]: unknown;
}
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number>;
declare const classes: Record<string, string>;
declare const WalletRow: React.FC<{
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}>;

// Hoisted to module scope so it isn't re-created on every render.
function getPriority(blockchain: Blockchain): number {
  switch (blockchain) {
    case "Osmosis":
      return 100;
    case "Ethereum":
      return 50;
    case "Arbitrum":
      return 30;
    case "Zilliqa":
      return 20;
    case "Neo":
      return 20;
    default: {
      // If a new Blockchain variant is added without updating this switch,
      // TypeScript will catch it at compile time.
      const _exhaustive: never = blockchain;
      throw new Error(`Unhandled blockchain: ${_exhaustive}`);
    }
  }
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return balances
      .filter((balance) => {
        const priority = getPriority(balance.blockchain);
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain))
      .map((balance) => ({
        ...balance,
        formatted: balance.amount.toFixed(2),
      }));
  }, [balances]);

  const rows = formattedBalances.map((balance) => {
    const usdValue = (prices[balance.currency] ?? 0) * balance.amount;

    return (
      <WalletRow
        className={classes.row}
        key={`${balance.blockchain}-${balance.currency}`}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
