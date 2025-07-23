import React, { useMemo, useCallback } from 'react';
import { BoxProps } from './types'; // Adjust import path as needed

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = useCallback((blockchain: string): number => {
    const priorityMap: Record<string, number> = {
      'Osmosis': 100,
      'Ethereum': 50,
      'Arbitrum': 30,
      'Zilliqa': 20,
      'Neo': 20,
    };
    return priorityMap[blockchain] ?? -99;
  }, []);

  const processedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        
        if (leftPriority > rightPriority) return -1;
        if (rightPriority > leftPriority) return 1;
        return 0;
      })
      .map((balance: WalletBalance): FormattedWalletBalance => {
        const price = prices[balance.currency] ?? 0;
        return {
          ...balance,
          formatted: balance.amount.toFixed(2),
          usdValue: price * balance.amount,
        };
      });
  }, [balances, prices, getPriority]);

  const rows = useMemo(() => {
    return processedBalances.map((balance: FormattedWalletBalance) => (
      <WalletRow
        className={classes.row}
        key={`${balance.currency}-${balance.blockchain}`}
        amount={balance.amount}
        usdValue={balance.usdValue}
        formattedAmount={balance.formatted}
      />
    ));
  }, [processedBalances]);

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};