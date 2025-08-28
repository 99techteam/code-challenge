import React, { useMemo } from "react";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Added blockchain property
}
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

const PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: string): number => PRIORITY[blockchain] ?? -99;

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // Memoize sorted and filtered balances
  const sortedBalances = useMemo(() => {
    return balances
      .filter((b) => getPriority(b.blockchain) > -99 && b.amount > 0)
      .sort((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain));
  }, [balances]);

  return (
    <div {...rest}>
      {sortedBalances.map((balance) => {
        const usdValue = (prices?.[balance.currency] ?? 0) * balance.amount;
        return (
          <WalletRow
            className={classes.row}
            key={`${balance.blockchain}-${balance.currency}`}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          />
        );
      })}
    </div>
  );
};

export default WalletPage;