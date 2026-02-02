import React, { useMemo } from "react";
import { BoxProps } from "@mui/material";

// Fixed: Added missing blockchain property
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: string): number => {
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
      default:
        return -99;
    }
  };

  // Fixed: Removed 'prices' from dependencies since it's not used here
  // Fixed: Corrected filter logic to keep positive balances with valid priority
  // Fixed: Added proper return value (0) when priorities are equal
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // Fixed: Use balancePriority instead of undefined lhsPriority
        // Fixed: Inverted logic - now keeps positive amounts
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        // Fixed: Added return 0 when priorities are equal
        return rightPriority - leftPriority;
      });
  }, [balances]);

  // Fixed: Combined formatting and row creation into single iteration
  // Fixed: Properly memoized with correct dependencies
  // Fixed: Use unique currency as key instead of index
  // Fixed: Correct typing - balance is WalletBalance, not FormattedWalletBalance
  const rows = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance) => {
      const formattedAmount = balance.amount.toFixed(2);
      const usdValue = prices[balance.currency] * balance.amount;

      return (
        <WalletRow
          className={classes.row}
          key={balance.currency}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={formattedAmount}
        />
      );
    });
  }, [sortedBalances, prices]);

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
