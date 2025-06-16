enum BLOCKCHAIN {
  Osmosis = "Osmosis",
  Ethereum = "Ethereum",
  Arbitrum = "Arbitrum",
  Zilliqa = "Zilliqa",
  Neo = "Neo",
}

interface WalletBalance {
  currency: BLOCKCHAIN;
  amount: number;
  //   or blockhain: BLOCKCHAIN
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

const blockchainPriorities: Record<BLOCKCHAIN, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: BLOCKCHAIN): number => {
  return blockchainPriorities[blockchain] ?? -99;
};

const WalletPage: React.FC<BoxProps> = ({ children, ...rest }: BoxProps) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.currency);
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.currency);
        const rightPriority = getPriority(rhs.currency);
        return rightPriority - leftPriority; // Simplified sorting
      })
      .map(
        (balance: WalletBalance): FormattedWalletBalance => ({
          ...balance,
          formatted: balance.amount.toFixed(2), // Assuming 2 decimal places for formatting
        })
      );
  }, [balances]);

  const rows = formattedBalances.map((balance: FormattedWalletBalance) => {
    const usdValue = prices[balance.currency]
      ? prices[balance.currency] * balance.amount
      : 0;
    return (
      <WalletRow
        className={classes.row}
        key={balance.currency} // Unique key
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
