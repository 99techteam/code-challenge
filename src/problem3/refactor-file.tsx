import React, { useMemo } from "react";
import { BoxProps, ClassesType } from "@types"; // assumption types folder
import {
  WalletRow,
  LoadingState,
  ErrorState,
  Box,
  EmptyState,
} from "@components";
import { useWalletBalances, usePrices } from "@apis";

const INVALID_PRIORITY = -99;

enum BlockchainEnum {
  OSMOSIS = "Osmosis",
  ETHEREUM = "Ethereum",
  ARBITRUM = "Arbitrum",
  ZILLIQA = "Zilliqa",
  NEO = "Neo",
}

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: BlockchainEnum; // define blockchain type
}

interface WalletWithPriority extends WalletBalance {
  priority: number;
}

const blockchainPriorityMap: Record<BlockchainEnum, number> = {
  [BlockchainEnum.OSMOSIS]: 100,
  [BlockchainEnum.ETHEREUM]: 50,
  [BlockchainEnum.ARBITRUM]: 30,
  [BlockchainEnum.ZILLIQA]: 20,
  [BlockchainEnum.NEO]: 20,
};

const getPriority = (blockchain: BlockchainEnum): number => {
  //write outside component to avoid re create
  return blockchainPriorityMap[blockchain] ?? INVALID_PRIORITY;
};

// Custom hook to filter and sort wallet balances
const useSortedWalletBalances = (
  balances: WalletBalance[]
): WalletWithPriority[] => {
  // Map priority once, then filter/sort on the mapped value to avoid repeated lookup
  return useMemo(() => {
    return balances
      .map((balance) => ({
        ...balance,
        priority: getPriority(balance.blockchain),
      }))
      .filter(
        (balance) => balance.priority > INVALID_PRIORITY && balance.amount > 0
      )
      .sort((lhs, rhs) => rhs.priority - lhs.priority);
  }, [balances]);
};

interface Props extends BoxProps {
  classes?: ClassesType;
}
export const WalletPage: React.FC<Props> = (props: Props) => {
  const { classes, children: _children, ...rest } = props;
  const { data: balances, loading, error } = useWalletBalances();
  const {
    data: prices,
    loading: pricesLoading,
    error: pricesError,
  } = usePrices();

  // Handle loading state
  if (loading || pricesLoading) return <LoadingState />;

  // Handle error state
  if (error || pricesError || !prices || !balances) {
    const errorMessage =
      error?.message || pricesError?.message || "Data unavailable";
    return <ErrorState error={errorMessage} />;
  }

  if (balances.length === 0) {
    return <EmptyState {...rest} />;
  }

  const sortedBalances = useSortedWalletBalances(balances);
  const rows = useMemo(
    () =>
      sortedBalances.map((balance) => {
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
        const formatted = balance.amount.toFixed(2);
        return (
          <WalletRow
            className={classes?.row ?? ""}
            key={"wallet-" + balance.currency + balance.blockchain} // key should be unique enough and valid for memoization, best if we have wallet id
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={formatted}
          />
        );
      }),
    [sortedBalances, prices, classes?.row]
  );

  return <Box {...rest}>{rows}</Box>;
};

