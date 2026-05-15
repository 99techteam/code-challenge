type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis:  100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa:  20,
  Neo:      20,
};

const getPriority = (blockchain: Blockchain): number =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? -99;

const WalletPage: React.FC<BoxProps> = (props: BoxProps) => {
  const { ...rest } = props; 
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedAndFormattedBalances = useMemo((): FormattedWalletBalance[] => {
    // Single reduce pass: filter + format combined → O(n), then sort → O(n log n)
    const formatted = balances.reduce<FormattedWalletBalance[]>((acc: FormattedWalletBalance[], balance: WalletBalance) => {
      if (getPriority(balance.blockchain) > -99 && balance.amount > 0) {
        acc.push({ ...balance, formatted: balance.amount.toFixed() });
      }
      return acc;
    }, []);

    return formatted.sort((lhs: WalletBalance, rhs: WalletBalance) =>
      getPriority(rhs.blockchain) - getPriority(lhs.blockchain)
    );
  }, [balances]);

  const rows = sortedAndFormattedBalances.map((balance: FormattedWalletBalance) => {
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

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;