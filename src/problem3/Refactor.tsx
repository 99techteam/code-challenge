interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface BlockchainPriority {
  [key: string]: number;
}

const getPriority = (blockchain: string): number => {
  // TODO: Should have processed in the API response
  const blockchainPriority: BlockchainPriority = {
    Osmosis: 100,
    Ethereum: 50,
    Arbitrum: 30,
    Zilliqa: 20,
    Neo: 20
  }
  return blockchainPriority[blockchain as keyof BlockchainPriority] || -99;
};

const sortedBalances = useMemo(() => {
  // TODO: should have processed in the API response
  return balances
    .filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      if (balancePriority > -99 && balance.amount > 0) { // Fixed logic
        return true;
      }
      return false;
    })
    .sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      return rightPriority - leftPriority;
    });
}, [balances]);

const formattedBalances = useMemo(() => {
  return sortedBalances.map((balance: WalletBalance) => ({
    ...balance,
    formatted: balance.amount.toFixed(2)
  }));
}, [sortedBalances]);

const rows = formattedBalances.map((balance: FormattedWalletBalance) => {
  const usdValue = (prices[balance.currency] || 0) * balance.amount;
  return (
    <WalletRow
      className={classes.row}
      key={balance.currency} // Use unique identifier
      amount={balance.amount}
      usdValue={usdValue}
      formattedAmount={balance.formatted}
    />
  );
});