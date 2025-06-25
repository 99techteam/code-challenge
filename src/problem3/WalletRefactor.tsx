interface WalletBalance {
  currency: string;
  amount: number;
  blockchainName: string;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface BoxProps {
  containerClassName?: string;
}

interface Props extends BoxProps {
rowClassName?: string;
wrapperClassName?: string;
children?: React.ReactNode;
}

interface IPrice {
    [currency: string]: number;
}

const PRIORITY = {
  "Osmosis": 100,
  "Ethereum": 50,
  "Arbitrum": 30,
  "Zilliqa": 20,
  "Neo": 20
};

export const WalletPage: React.FC<Props> = (props: Props) => {
  const { children,rowClassName,wrapperClassName } = props;
  const balances: WalletBalance[] = useWalletBalances();
  const prices: IPrice[] = usePrices();

  const getPriority = (blockchainName: string): number => {
    return PRIORITY[blockchainName] ?? -99; 
  
  };

  
  const formattedBalances: FormattedWalletBalance[] = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchainName);
          return balancePriority > -99 && balance.amount >= 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchainName);
      const rightPriority = getPriority(rhs.blockchainName);
      return rightPriority - leftPriority; 
    }).map((balance: WalletBalance) => ({
    ...balance,
    formatted: balance.amount.toFixed(2), // Added precision parameter
  }))
  }, [balances]);



  const rows = formattedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={rowClassName}
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  return <div className={wrapperClassName||''}>{rows}</div>;
};
