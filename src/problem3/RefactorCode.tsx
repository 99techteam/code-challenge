import React, { useMemo } from "react";
import { BoxProps } from "@mui/material/Box";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

/* Define blockchain priorities as a constant Map for better maintainability and performance */
const blockchainPriorities: ReadonlyMap<string, number> = new Map([
  ["Osmosis", 100],
  ["Ethereum", 50],
  ["Arbitrum", 30],
  ["Zilliqa", 20],
  ["Neo", 20],
]);

const getPriority = (blockchain: string): number => {
  return blockchainPriorities.get(blockchain) ?? -99;
};

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedAndFilteredBalances = useMemo(() => {
    // map balances with their priority, avoiding repeated getPriority calls
    const balancesWithPriority = balances
      ?.map((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return { ...balance, priority };
      })
      .filter((balanceWithPriority) => {
        return (
          balanceWithPriority.priority > -99 && balanceWithPriority.amount > 0
        );
      });
    return balancesWithPriority?.sort((lhs, rhs) => lhs - rhs);
  }, [balances]);

  const formattedBalances = useMemo(() => {
    return sortedAndFilteredBalances.map((balance: WalletBalance) => {
      return {
        ...balance,
        formatted: balance?.amount?.toFixed(),
      };
    });
  }, [sortedAndFilteredBalances]); // Only re-run if sortedAndFilteredBalances change

  const rows = formattedBalances?.map((balance: FormattedWalletBalance) => {
    const usdValue = (prices[balance?.currency] || 0) * balance?.amount;

    return (
      <WalletRow
        className={""}
        key={balance?.currency}
        amount={balance?.amount}
        usdValue={usdValue}
        formattedAmount={balance?.formatted}
      />
    );
  });

  return (
    <div {...rest}>
      {children}
      {rows}
    </div>
  );
};

export default WalletPage;
