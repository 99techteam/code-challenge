# Problem3

```ts
interface WalletBalance {
  currency: string;
  amount: number;
}
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
    if (lhsPriority > -99) {
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
  }, [balances, prices]);

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className={classes.row}
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
```

# getPriority function

### Problem

1. The use of any type in typescript should be limited because it's related to the project's scalability and maintainability. One more reason, consider using specific types for getting code-completion from typed languages like typescript.
2. If the return values are the same, only one return statement for 2 cases to be more readable

### Code

```ts
const getPriority = (blockchain: string | null | undefined): number => {
   switch (blockchain) {
     case 'Osmosis':
       return 100
     case 'Ethereum':
       return 50
     case 'Arbitrum':
       return 30
     case 'Zilliqa':
     case 'Neo':
       return 20
     default:
       return -99
   }
 }

```

# interface FormattedWalletBalance

### Problem

Code redundancy, I will use the **extends** operation in typescript's type system to make it shorter

### Code

```ts
interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}
```

# sortedBalances, formatedBalances and rows

### Problem

1. **Limit nested conditions** if possible, directly return the chaining conditions without explicitly returning true or false values
2. Maybe it's a typo mistake because the **lhsPriority** variable is not available
3. **Missing 0 return** can lead to unstable or random order
4. We can pass **leftPriority - rightPriority** in the sort function because both of them are numbers
5. The **prices** dependency is not necessary because we don't use it within the useMemo callback
6. The problem of map function is it return a new array in the new memory area and this sets off the unnecessary re-render. The solution is wrapping the rows in useMemo and putting formated balances in the **sortedBalances useMemo**

### Code

```ts
const formatedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        return balancePriority > -99 && balance.amount <= 0
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
            return -1;
        } else if (rightPriority > leftPriority) {
            return 1;
        }
        return 0
  }).map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  });
}, [balances]);

 const rows = useMemo(() => formatedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className={classes.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  }), [formatedBalances, prices])
```
