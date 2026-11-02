import React, { useMemo } from "react";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface Props extends BoxProps {}

const PRIORITY: Readonly<Record<string, number>> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const amountFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 });

const WalletPage = (props: Props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    const ranked: { balance: WalletBalance; priority: number }[] = [];
    for (const balance of balances) {
      if (!Object.hasOwn(PRIORITY, balance.blockchain) || balance.amount <= 0) continue;
      ranked.push({ balance, priority: PRIORITY[balance.blockchain] });
    }
    ranked.sort(
      (l, r) => r.priority - l.priority || l.balance.currency.localeCompare(r.balance.currency)
    );
    return ranked.map((r) => r.balance);
  }, [balances]);

  const rows = useMemo(
    () =>
      sortedBalances.map((balance) => (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}:${balance.currency}`}
          amount={balance.amount}
          usdValue={(prices[balance.currency] ?? 0) * balance.amount}
          formattedAmount={amountFormat.format(balance.amount)}
        />
      )),
    [sortedBalances, prices]
  );

  return <div {...props}>{rows}</div>;
};

export default WalletPage;
