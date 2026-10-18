interface WalletBalance {
  currency: string;
  amount: number;
}
// Issue 1: Should extend from WalletBalance
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
    // Issue 2: children is not used anywhere
  const { children, ...rest } = props; 
  const balances = useWalletBalances();
  const prices = usePrices();

    // Issue 3: this function can be simply as an array, there are no logic inside
	const getPriority = (blockchain: any): number => {
	  switch (blockchain) {
	    case 'Osmosis':
	      return 100
	    case 'Ethereum':
	      return 50
	    case 'Arbitrum':
	      return 30
	    case 'Zilliqa':
	      return 20
	    case 'Neo':
	      return 20
	    default:
	      return -99
	  }
	}

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
		  const balancePriority = getPriority(balance.blockchain);

          // Issue 4: Use wrong variable name
		  if (lhsPriority > -99) {
              // Issue 5: I believe this is wrong logic. This line will remove all balances had amout > 0.
		     if (balance.amount <= 0) {
		       return true;
		     }
		  }
		  return false
		}).sort((lhs: WalletBalance, rhs: WalletBalance) => {
			const leftPriority = getPriority(lhs.blockchain);
		  const rightPriority = getPriority(rhs.blockchain);
		  if (leftPriority > rightPriority) {
		    return -1;
		  } else if (rightPriority > leftPriority) {
		    return 1;
		  }
    });
      // Issue 6: useMemo depend on prices. But inside useMemo, prices does not used.
  }, [balances, prices]);

    // Issue 7: Create another array for formatted values. And this not update if balances changes.
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
        // Issue 12: For currency, it should include decimal digits.
      formatted: balance.amount.toFixed()
    }
  })

    // Issue 8: Use wrong array variable
  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
      // Issue 9: This possible that prices[balance.currency] is not a number or null.
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
          // Issue 10: classes.row are not defined
        className={classes.row}
          // Issue 11: The key should be based on balance blockchain + currency as uniqueId
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}