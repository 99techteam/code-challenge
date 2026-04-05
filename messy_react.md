<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Code Review: Computational Inefficiencies and Anti-patterns

## Critical Issues Identified

### 1. **Undefined Variable Reference**

The most critical bug in the code is the use of `lhsPriority` in the filter function, which is never defined:

```typescript
if (lhsPriority > -99) {
```

This should reference `balancePriority` which was computed on the previous line. This will cause a runtime error.

### 2. **Flawed Filtering Logic**

The filter logic is inverted and nonsensical:

```typescript
if (lhsPriority > -99) {
   if (balance.amount <= 0) {
     return true;  // Keeping balances with zero or negative amounts
   }
}
return false  // Filtering out all positive balances
```

This logic keeps only balances with zero or negative amounts while filtering out positive balances, which is the opposite of what you'd typically want.

### 3. **Missing Interface Properties**

The `WalletBalance` interface lacks a `blockchain` property, but the code attempts to access `balance.blockchain` in the `getPriority` function. This will cause TypeScript compilation errors.

### 4. **Inefficient Multiple Array Iterations**

The code performs multiple separate iterations over the same data:

- `sortedBalances` filters and sorts
- `formattedBalances` maps to add formatting
- `rows` maps again to create JSX elements

This creates unnecessary computational overhead and multiple array traversals.

### 5. **Incorrect useMemo Dependencies**

The `useMemo` hook includes `prices` in its dependency array, but `prices` is not used within the memoized computation. This causes unnecessary re-computations when prices change.

### 6. **Incomplete Sorting Logic**

The sort function is missing a return statement for the equality case:

```typescript
if (leftPriority > rightPriority) {
  return -1;
} else if (rightPriority > leftPriority) {
  return 1;
}
// Missing: return 0;
```


### 7. **Type Safety Issues**

- `getPriority` accepts `any` type instead of a specific string union type
- `FormattedWalletBalance` type is used incorrectly in the `rows` mapping


### 8. **Anti-pattern: Using Array Index as React Key**

Using `index` as the key prop in React lists is an anti-pattern that can cause rendering issues and performance problems when the list order changes.

### 9. **Missing Error Handling**

The code assumes `prices[balance.currency]` will always exist, which could result in `undefined` multiplication.

## Refactored Solution

```typescript
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Added missing property
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {}

type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // Memoized priority function with proper typing
  const getPriority = useCallback((blockchain: string): number => {
    const blockchainMap: Record<Blockchain, number> = {
      'Osmosis': 100,
      'Ethereum': 50,
      'Arbitrum': 30,
      'Zilliqa': 20,
      'Neo': 20
    };
    return blockchainMap[blockchain as Blockchain] ?? -99;
  }, []);

  // Single optimized computation with proper filtering and sorting
  const processedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        // Keep balances with positive amounts and valid priority
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        return rightPriority - leftPriority; // Descending order
      })
      .map((balance: WalletBalance): FormattedWalletBalance => ({
        ...balance,
        formatted: balance.amount.toFixed(2),
        usdValue: (prices[balance.currency] ?? 0) * balance.amount
      }));
  }, [balances, prices, getPriority]);

  // Generate rows
  const rows = processedBalances.map((balance: FormattedWalletBalance) => (
    <WalletRow 
      className={classes.row}
      key={`${balance.currency}-${balance.blockchain}`} // Unique composite key
      amount={balance.amount}
      usdValue={balance.usdValue}
      formattedAmount={balance.formatted}
    />
  ));

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};
```

