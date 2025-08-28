interface WalletBalance {
  currency: string;
  amount: number;
}

// No need declare this interface because the formatted property can be converted directly by amount property
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // No need to create this function, we can use a mapping object instead
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
      //WalletBalance interface has no blockchain property, but getPriority expects it.
		  const balancePriority = getPriority(balance.blockchain);
      //lhsPriority is referenced inside filter, but it’s never defined.
		  if (lhsPriority > -99) { 
        // when we use mapping object, we don't need this value --99
        // because mapping object will return non undefined values or undefined
        // we just check undefined
		     if (balance.amount <= 0) { // confusing comparison <= 0, should be > 0 for positive amount
		       return true;
		     }
		  }
		  return false
		}).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      //WalletBalance interface has no blockchain property, but getPriority expects it.
			const leftPriority = getPriority(lhs.blockchain);
		  const rightPriority = getPriority(rhs.blockchain);

      //Sorting should just return leftPriority - rightPriority (or reversed) instead of nested if/else
		  if (leftPriority > rightPriority) {
		    return -1;
		  } else if (rightPriority > leftPriority) {
		    return 1;
		  }
    });
  }, [balances, prices]); // The prices variable is not used when recalculating 

  // formattedBalances is computed but not actually used when rendering rows
  // We can use it directly in loop for rows, shouldn't map twice time
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed() // No need this map, we can use it directly in loop for rows
    }
  })

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount; // prices[balance.currency] could be undefined
    //Using index as a key is not ideal; better to use a unique property (e.g., currency).
    return (
      <WalletRow 
      // classes is not coming from rest either, because we didn’t pull it out of props
      // So classes is currently undefined inside this component, and classes.row will throw an error.
      // Base on blockchain, we can define a className for each row
        className={classes.row} 
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted} // use amount.toFixed here
      />
    )
  })

  return (
    // The component to be flexible and accept arbitrary HTML attributes (like id, style, onClick, etc.)
    // Building a reusable or generic UI component
    <div {...rest}>
      {rows}
    </div>
  )
}