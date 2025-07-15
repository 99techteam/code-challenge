# Performance Optimizations and Anti-Patterns

This document outlines the computational inefficiencies and anti-patterns identified in the sample code provided, along with suggested optimizations for improved performance and readability.

---

## 1. Redundant Filtering and Sorting Logic

**Issue:**  
The code filters balances based on priority and amount, then sorts them separately. This leads to unnecessary iterations over the data.

**Optimization:**  
Combine filtering and sorting for better performance:

```typescript
const sortedBalances = useMemo(
  () =>
    balances
      .filter(
        (balance) => getPriority(balance.blockchain) > -99 && balance.amount > 0
      )
      .sort(
        (lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain)
      ),
  [balances]
);
```

---

## 2. Unnecessary Re-computation Trigger in `useMemo`

**Issue:**  
`prices` is included in the dependency array of `useMemo`, even though it doesn't affect the sorting logic.

**Optimization:**  
Remove `prices` from dependencies to prevent unnecessary recalculations:

```typescript
}, [balances]);
```

---

## 3. Redundant Mapping for `formattedBalances`

**Issue:**  
The balances are sorted and then mapped again to add the `formatted` field, but `formattedBalances` is not used in rendering.

**Optimization:**  
Either use `formattedBalances` in the rendering or combine the formatting during the initial mapping.

```typescript
const formattedBalances = useMemo(
  () =>
    balances
      .filter(
        (balance) => getPriority(balance.blockchain) > -99 && balance.amount > 0
      )
      .sort(
        (lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain)
      )
      .map((balance) => ({
        ...balance,
        formatted: balance.amount.toFixed(),
      })),
  [balances]
);
```

Then use `formattedBalances` for rendering.

---

## 4. Inefficient Sorting Logic with Multiple `if-else`

**Issue:**  
The sorting function uses multiple `if-else` conditions, which can be simplified.

**Optimization:**  
Replace the `if-else` logic with a direct comparison:

```typescript
.sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain))
```

---

## 5. Using `index` as a Key in `map`

**Issue:**  
Using `index` as the `key` in list rendering can cause rendering issues when the list changes dynamically.

**Optimization:**  
Use a unique property from the balance, like `currency` or `blockchain`, if available:

```typescript
key={balance.currency}
```

---

## 6. Potential Redundant Computation in Row Rendering

**Issue:**  
In the row mapping, `prices[balance.currency] * balance.amount` is recalculated every render.

**Optimization:**  
Precompute the USD value during the `formattedBalances` mapping:

```typescript
.map(balance => ({
  ...balance,
  formatted: balance.amount.toFixed(),
  usdValue: (prices[balance.currency] || 0) * balance.amount
}));
```

Then simplify the row rendering:

```typescript
const rows = formattedBalances.map((balance) => (
  <WalletRow
    className={classes.row}
    key={balance.currency}
    amount={balance.amount}
    usdValue={balance.usdValue}
    formattedAmount={balance.formatted}
  />
));
```

---

## Refactored Code

```typescript
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: string): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  const formattedBalances = useMemo(
    () =>
      balances
        .filter(
          (balance) =>
            getPriority(balance.blockchain) > -99 && balance.amount > 0
        )
        .sort(
          (lhs, rhs) =>
            getPriority(rhs.blockchain) - getPriority(lhs.blockchain)
        )
        .map((balance) => ({
          ...balance,
          formatted: balance.amount.toFixed(),
          usdValue: (prices[balance.currency] || 0) * balance.amount,
        })),
    [balances, prices]
  );

  const rows = formattedBalances.map((balance) => (
    <WalletRow
      className={classes.row}
      key={balance.currency}
      amount={balance.amount}
      usdValue={balance.usdValue}
      formattedAmount={balance.formatted}
    />
  ));

  return <div {...rest}>{rows}</div>;
};
```

---

## Summary of Changes

1. **Combined Filtering, Sorting, and Mapping:**

   - Reduced redundant iterations by combining these steps in a single `useMemo` block.

2. **Simplified Sorting Logic:**

   - Replaced multiple `if-else` statements with direct priority comparison.

3. **Optimized Dependency Array:**

   - Included only necessary dependencies (`balances`, `prices`) in the `useMemo` hook.

4. **Precomputed USD Values:**

   - Calculated `usdValue` during mapping to avoid redundant calculations during rendering.

5. **Improved Key Usage:**
   - Used `balance.currency` as a unique key instead of the index to prevent unnecessary re-renders.

These changes enhance both the performance and readability of the code, making it easier to maintain and extend.
