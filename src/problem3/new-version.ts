interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}
// interface FormattedWalletBalance extends WalletBalance{
//   formatted: string;
// }

interface Props extends BoxProps {
  children: React.ReactNode;
  rest: React.HTMLAttributes<HTMLDivElement>;
}

enum BlockchainPriority {
  Osmosis = 100,
  Ethereum = 50,
  Arbitrum = 30,
  Zilliqa = 20,
  Neo = 20,
  Default = -99,
}

type Blockchain =
  | 'Osmosis'
  | 'Ethereum'
  | 'Arbitrum'
  | 'Zilliqa'
  | 'Neo'

const getPriority = (blockchain: Blockchain): number => {
  return BlockchainPriority[blockchain] ?? BlockchainPriority.Default
}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances: WalletBalance[] = useWalletBalances();
  const prices: Record<string, number> = usePrices();

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
		  const balancePriority = getPriority(balance.blockchain);
		  return balancePriority > -99 && balance.amount > 0
		}).sort((lhs: WalletBalance, rhs: WalletBalance) => {
		  return getPriority(lhs.blockchain)- getPriority(rhs.blockchain);
    });
  }, [balances]);

  // const formattedBalances: FormattedWalletBalance[] = sortedBalances.map((balance: WalletBalance) => {
  //   return {
  //     ...balance,
  //     formatted: balance.amount.toFixed()
  //   }
  // })

  const rows = sortedBalances.map((balance: WalletBalance, index: number) => {
    const { currency, amount } = balance;
    const formatted = balance.amount.toFixed();
    const usdValue = prices[currency] * amount;

    return (
      <WalletRow 
        className={classes.row}
        key={currency}
        amount={amount}
        usdValue={usdValue}
        formattedAmount={formatted}
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}