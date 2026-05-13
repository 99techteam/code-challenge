import React, { useMemo } from 'react';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = useUsePrices();

  const getPriority = (blockchain: string): number => {
    const priorities: Record<string, number> = {
      'Osmosis': 100,
      'Ethereum': 50,
      'Arbitrum': 30,
      'Zilliqa': 20,
      'Neo': 20,
    };
    return priorities[blockchain] ?? -99;
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      });
  }, [balances]);

  const rows = sortedBalances.map((balance: WalletBalance) => {
    const usdValue = prices[balance.currency] * balance.amount;
    const formattedAmount = balance.amount.toFixed(2);
    
    return (
      <WalletRow 
        className={classes.row}
        key={`${balance.blockchain}-${balance.currency}`}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={formattedAmount}
      />
    );
  });

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};

export default WalletPage;