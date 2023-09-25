const NON_PRIORITY = -99;
enum BlockchainPriority {
    Osmosis = 100,
    Ethereum = 50,
    Arbitrum = 30,
    Zilliqa = 20,
    Neo = 20
  };

interface IWalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
  getFormattedAmmount: () => string;
  getPriority: () => number;
}

class WalletBalance implements IWalletBalance {
    currency: string;
    amount: number;
    blockchain: string;

    getFormattedAmmount(): string {
        return this.amount.toFixed();
    }
    getPriority(): number {
        return BlockchainPriority[this.blockchain] || NON_PRIORITY;
    };
};

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    
    const balances = useWalletBalances();
    const prices = usePrices();

    const sortedBalances = useMemo(() => {
        return balances
            .filter((balance: IWalletBalance) => balance.getPriority() > NON_PRIORITY && balance.amount <= 0)
            .sort((lhs: IWalletBalance, rhs: IWalletBalance) => {
                const leftPriority = lhs.getPriority();
                const rightPriority = rhs.getPriority();
    
              if (leftPriority > rightPriority) {
                return -1;
              } else if (rightPriority > leftPriority) {
                return 1;
              }
        });
      }, [balances, prices]);

  const rows = sortedBalances.map((balance: IWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className={classes.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.getFormattedAmmount()}
      />
    )
  });

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}