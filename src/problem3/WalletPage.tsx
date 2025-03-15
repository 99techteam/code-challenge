import React, { useMemo } from 'react';
import { BoxProps } from './Box';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps { }

const WalletPage: React.FC<Props> = ({ ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Type-safe priority function
  const getPriority = (blockchain: string): number => {
    switch (blockchain) {
      case 'Osmosis':
        return 100;
      case 'Ethereum':
        return 50;
      case 'Arbitrum':
        return 30;
      case 'Zilliqa':
        return 20;
      case 'Neo':
        return 20;
      default:
        return -99;
    }
  };

  // Memoized sorted balances with corrected logic and stable sorting
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority !== rightPriority) {
          return rightPriority - leftPriority;
        }
        return lhs.currency.localeCompare(rhs.currency); // Stable sort by currency
      });
  }, [balances]); // Removed prices from dependencies

  // Memoized formatted balances
  const formattedBalances = useMemo(() => {
    return sortedBalances.map((balance: FormattedWalletBalance) => ({
      ...balance,
      formatted: balance.amount.toFixed(2),
    }));
  }, [sortedBalances]);

  const rows = useMemo(() => {
    return formattedBalances.map((balance) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={balance.currency}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  }, [formattedBalances, prices]);

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;