# Problem 3: Refactoring Explanation

## Issues in the Code

### 1 Type & Data Mismatch

- `WalletBalance` interface doesn’t have a `blockchain` field, but the code uses `balance.blockchain` → type safety lost

```ts
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // added to match usage
}
```

- `rows` maps `sortedBalances` but types the items as `FormattedWalletBalance` but `sortedBalances` hasn’t been formatted yet, should use `formattedBalances`

- Using `any` in `getPriority(blockchain: any)` forfeits TypeScript safety.  

### 2 Error in Sorting Logic

Old version:

```ts
const sortedBalances = useMemo(() => {
  return balances.filter((balance: WalletBalance) => {
    const balancePriority = getPriority(balance.blockchain);
    if (lhsPriority > -99) {  // lhsPriority is not defined
       if (balance.amount <= 0) { // inverted condition
         return true; 
       }
    }
    return false;
  }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
    const leftPriority = getPriority(lhs.blockchain);
    const rightPriority = getPriority(rhs.blockchain);
    if (leftPriority > rightPriority) {
      return -1;
    } else if (rightPriority > leftPriority) {
      return 1;
    }
    // no return 0 for equal priority
  });
}, [balances, prices]); // unnecessary dependency
```

- You can see that `lhsPriority` is not defined. The variable inside the filter should be `balancePriority`

- The filter logic is inverted, it returns true for balance.amount <= 0 instead of positive amounts

- `prices` is included in the dependency array but is not used in the calculation

Fixed version:

```ts
const sortedBalances = useMemo(() => {
        return balances
            .filter((balance) => {
                const priority = getPriority(balance.blockchain);
                return priority > -99 && balance.amount > 0; // fixed condition
            })
            .sort((lhs, rhs) => {
                const leftPriority = getPriority(lhs.blockchain);
                const rightPriority = getPriority(rhs.blockchain);
                return rightPriority - leftPriority;
            });
    }, [balances]); // removed prices from dependency array
```

### 3 Rerender issue

- `formattedBalances` is recalculated on every render because it’s not memoized

Old version:

```ts
const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })
```

Fixed version:

```ts
const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
        return sortedBalances.map((balance) => ({
            ...balance,
            formatted: balance.amount.toFixed(2),
        }));
    }, [sortedBalances]);

```

- `rows` recalculates on every render, even if `sortedBalances` hasn’t changed

Old version:

```ts
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
```

Fixed version:

```ts
 const rows = useMemo(() => {
        return formattedBalances.map((balance) => {
            const usdValue = prices[balance.currency] * balance.amount;
            return (
                <WalletRow
                    className={classes.row}
                    key={`${balance.blockchain}-${balance.currency}`}
                    amount={balance.amount}
                    usdValue={usdValue}
                    formattedAmount={balance.formatted}
                />
            );
        });
    }, [formattedBalances, prices]);
```

### 4 Issue in using array index as React key

- React can’t track items properly when the list changes, causes re-mounting and loss of state

Fixed version:

```ts
<WalletRow
    className={classes.row}
    key={`${balance.blockchain}-${balance.currency}`}
    amount={balance.amount}
    usdValue={usdValue}
    formattedAmount={balance.formatted}
    />
```

