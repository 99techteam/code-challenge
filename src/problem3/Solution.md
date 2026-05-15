# Problem 3: Messy React

List out the computational inefficiencies and anti-patterns found in the code block below.

## Issues found in the code

### Issue 1: Using `any` type for `blockchain`

- Should have enum for blockchain. An any variable make confuse.
- Function getPriority should be separated. This will make the code cleaner and easier to reuse and maintain.

**Fix**:

- Add blockchain type for WalletBalance and create a `PRIORITY_BLOCKCHAIN` record map.
- Create a helper function `getPriority` to get the priority of the blockchain.

**Replacement:**

```typescript
enum Blockchain {
  Osmosis = "Osmosis",
  Ethereum = "Ethereum",
  Arbitrum = "Arbitrum",
  Zilliqa = "Zilliqa",
  Neo = "Neo",
}

const PRIORITY_BLOCKCHAIN: Record<Blockchain, number> = {
  [Blockchain.Osmosis]: 100,
  [Blockchain.Ethereum]: 50,
  [Blockchain.Arbitrum]: 30,
  [Blockchain.Zilliqa]: 20,
  [Blockchain.Neo]: 20,
};

const getPriority = (blockchain: Blockchain): number => {
  return PRIORITY_BLOCKCHAIN[blockchain] || -99;
};
```

### Issue 2: Missing blockchain type for WalletBalance

WalletBalance is missing the blockchain type, which should be an enum of Blockchain.

**Fix:**

Add blockchain type for WalletBalance and create a helper function to get the priority of the blockchain.

**Replacement:**

```typescript
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // <-- Add this
}
```

### Issue 3: Bug on `sortedBalances` filtering code

- Wrong `lshPriority` variable. It should be `balancePriority`.
- Logical error when checking the balance. The available `balance.amount` should be greater than or equal to 0.
- The `if` clause can be simplified

**Fix:**

- Change `lhsPriority` to `balancePriority` in the filter function.
- Simplify the `if` clause to the right logic and return `balancePriority > -99 && balance.amount > 0`.

**Replacement:**

```typescript
.filter((balance: WalletBalance) => {
		  const balancePriority = getPriority(balance.blockchain);
		  return balancePriority > -99 && balance.amount >= 0;
})
```

### Issue 4: Could be optimization on `sortedBalances` sorting code

The sorting code can be simplified by returning `leftPriority - rightPriority` instead of using `if` statements.

**Fix:**

Change `if` statements to return `leftPriority - rightPriority`.

**Replacement:**

```typescript
.sort((lhs: WalletBalance, rhs: WalletBalance) => {
    const leftPriority = getPriority(lhs.blockchain);
    const rightPriority = getPriority(rhs.blockchain);
    return leftPriority - rightPriority;
})
```

### Issue 5: Redundant dependency on `useMemo` function for `sortedBalances`

The prices in the dependency array is not needed since it's not used in the `sortedBalances` variable.

**Fix:**

Remove `prices` from the dependency array.

**Replacement:**

```typescript
const sortedBalances = useMemo(() => {
  return balances
   ...
}, [balances]); // <-- Remove prices from dependency array
```

### Issue 6: Missing `useMemo` hook for `formattedBalances`

- The `formattedBalances` is not memoized and will be created in every render. This will cause performance issue.
- `toFixed()` function without arguments will use the default value which is 0.

**Fix:**

- We can notice that, the `formattedBalances` is just a simple mapping of `sortedBalances`. So we can just change the `filter` function into `reduce` function then implement the logic of formatting the balance inside the `reduce` function.
- The default value of `toFixed()` should be `2`.

**Replacement:**

```typescript
const formattedBalances: FormattedWalletBalance[] = useMemo<
  FormattedWalletBalance[]
>(() => {
  const formattedBalances = balances
    .reduce((acc: FormattedWalletBalance[], balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);

      if (balancePriority > -99 && balance.amount >= 0) {
        acc.push({
          ...balance,
          formatted: balance.amount.toFixed(2),
        });
      }

      return acc;
    }, [])
    .sort((lhs: FormattedWalletBalance, rhs: FormattedWalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);

      return leftPriority - rightPriority;
    });

  return formattedBalances;
}, [balances]);
```

### Issue 7: `rows` variable is not needed

The rows is not memoize and will be created in every render. This will cause performance issue.

**Fix:**

Directly render the `formattedBalances` array instead of creating `rows` variable and memoizing it.

**Replacement:**

```typescript
return (
    <div {...rest}>
      {formattedBalances.map((balance, index) => {
        const usdValue = (prices[balance.currency] || 0) * balance.amount;
        return (
          <WalletRow
            className={classes.row}
            key={index}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
          />
        );
      })}
    </div>
  );
```

### Issue 8: `usdValue` calculation may lead to NaN

Because the `balance.currency` is a unknown string, it may lead to `NaN` when calculating `usdValue`.

**Fix:**

Use nullish coalescing operator `??` to avoid `NaN`.

**Replacement:**

```typescript
const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
```

### Issue 9: `key` is not stable

The `key` in the `map` function when rendering `WalletRow` is using the index, which is not stable. This can cause performance issue when the array is re-ordered.

**Fix:**

Use a stable key, such as the `balance.blockchain`.

**Replacement:**

```typescript
 <WalletRow
    className={classes.row}
    key={`${balance.blockchain}-${index}`} // <-- add balance.blockchain into key
    amount={balance.amount}
    usdValue={usdValue}
    formattedAmount={balance.formatted}
/>
```

## Refactored code

```typescript
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
  blockchain: Blockchain;
}

interface Props extends BoxProps {}

enum Blockchain {
  Osmosis = "Osmosis",
  Ethereum = "Ethereum",
  Arbitrum = "Arbitrum",
  Zilliqa = "Zilliqa",
  Neo = "Neo",
}

const PRIORITY_BLOCKCHAIN: Record<Blockchain, number> = {
  [Blockchain.Osmosis]: 100,
  [Blockchain.Ethereum]: 50,
  [Blockchain.Arbitrum]: 30,
  [Blockchain.Zilliqa]: 20,
  [Blockchain.Neo]: 20,
};

const getPriority = (blockchain: Blockchain): number => {
  return PRIORITY_BLOCKCHAIN[blockchain] || -99;
};

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances: FormattedWalletBalance[] = useMemo<
    FormattedWalletBalance[]
  >(() => {
    const formattedBalances = balances
      .reduce((acc: FormattedWalletBalance[], balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);

        if (balancePriority > -99 && balance.amount >= 0) {
          acc.push({
            ...balance,
            formatted: balance.amount.toFixed(2),
          });
        }

        return acc;
      }, [])
      .sort((lhs: FormattedWalletBalance, rhs: FormattedWalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);

        return leftPriority - rightPriority;
      });

    return formattedBalances;
  }, [balances]);

  return (
    <div {...rest}>
      {formattedBalances.map((balance, index) => {
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
        return (
           <WalletRow
                className={classes.row}
                key={`${balance.blockchain}-${index}`}
                amount={balance.amount}
                usdValue={usdValue}
                formattedAmount={balance.formatted}
            />
        );
      })}
    </div>
  );
};

```

## Summary

- Optimization for WalletPage component. Reduces unnecessary re-renders and improves performance.
- Refactoring for better code structure and maintainability.
- Bug fixes for logical errors and type safety.
