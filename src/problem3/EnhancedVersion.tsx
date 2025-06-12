interface WalletBalance {
    currency: string;
    amount: number;
    blockchain: string;
  }
  interface FormattedWalletBalance extends WalletBalance {
    formatted: string;
  }
  interface BoxProps {
    className?: string;
    [key: string]: any;
  }
  interface WalletRowProps {
    className: string;
    amount: number;
    usdValue: number;
    formattedAmount: string;
  }
  interface Props extends BoxProps {}
  
  const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    const balances = useWalletBalances();
    const prices = usePrices();
  
    // Kiểm tra đầu vào
    if (!Array.isArray(balances) || typeof prices !== 'object' || prices === null) {
      return <div>Loading...</div>;
    }
  
    const getPriority = useCallback((blockchain: string): number => {
      switch (blockchain) {
        case 'Osmosis': return 100;
        case 'Ethereum': return 50;
        case 'Arbitrum': return 30;
        case 'Zilliqa': return 20;
        case 'Neo': return 20;
        default: return -99;
      }
    }, []);
  
    const sortedBalances = useMemo(() => {
      return balances
        .map((balance: WalletBalance) => ({
          ...balance,
          priority: getPriority(balance.blockchain),
        }))
        .filter((balance) => balance.priority > -99 && balance.amount > 0)
        .sort((lhs, rhs) => rhs.priority - lhs.priority);
    }, [balances, getPriority]);
  
    const rows = sortedBalances.map((balance: WalletBalance & { priority: number }, index: number) => {
      const usdValue = prices[balance.currency] ? prices[balance.currency] * balance.amount : 0;
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(balance.amount);
      return (
        <WalletRow
          className={classes.row}
          key={`${balance.currency}-${balance.blockchain}`}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={formatted}
        />
      );
    });
  
    if (rows.length === 0) {
      return <div>No balances available</div>;
    }
  
    return <div {...rest}>{rows}</div>;
  };