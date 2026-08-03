import { useMemo, type ReactNode } from "react";
import { Box, type BoxProps } from "@mui/material";

interface WalletBalance {
  currency: string;
  blockchain: Blockchain;
  amount: number;
}

type Blockchain =
  | "Osmosis"
  | "Ethereum"
  | "Arbitrum"
  | "Zilliqa"
  | "Neo";

interface Props extends BoxProps {
  children?: ReactNode;
}

interface DisplayWalletBalance extends WalletBalance {
  formattedAmount: string;
  usdValue: number;
  priority: number;
}

const BLOCKCHAIN_PRIORITY: Readonly<Record<Blockchain, number>> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 6,
});

function getPriority(blockchain: Blockchain): number {
  return BLOCKCHAIN_PRIORITY[blockchain];
}

export function WalletPage({ children, ...boxProps }: Props) {
  const balances = useWalletBalances();
  const prices = usePrices();

  const displayBalances = useMemo<DisplayWalletBalance[]>(() => {
    return balances
      // Decorate once so priority is not recalculated during every sort comparison.
      .map((balance) => ({
        ...balance,
        priority: getPriority(balance.blockchain),
      }))
      .filter(
        (balance) =>
          balance.priority >= 0 &&
          Number.isFinite(balance.amount) &&
          balance.amount > 0,
      )
      .sort(
        (left, right) =>
          right.priority - left.priority ||
          left.currency.localeCompare(right.currency),
      )
      .map((balance) => {
        const price = prices[balance.currency] ?? 0;

        return {
          ...balance,
          formattedAmount: amountFormatter.format(balance.amount),
          usdValue: price * balance.amount,
        };
      });
  }, [balances, prices]);

  return (
    <Box {...boxProps}>
      {displayBalances.map((balance) => (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}:${balance.currency}`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formattedAmount}
        />
      ))}

      {children}
    </Box>
  );
}
