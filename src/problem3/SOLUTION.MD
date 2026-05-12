# Code Review Findings

### 1. Missing `blockchain` field

`balance.blockchain` is used but does not exist in `WalletBalance`.

**Fix:** Add `blockchain` to the interface.

---

### 2. Using `any`

```ts
blockchain: any;
```

**Problem:** Removes TypeScript safety.

**Fix:** Use proper types or union types.

---

### 3. Undefined variable

```ts
lhsPriority;
```

does not exist.

**Fix:** Replace with `balancePriority`.

---

### 4. Wrong filter condition

```ts
balance.amount <= 0;
```

**Problem:** Keeps invalid balances.

**Fix:** Use `balance.amount > 0`.

---

### 5. Wrong `useMemo` dependency

`prices` is included but not used.

**Problem:** Causes unnecessary recalculation.

**Fix:** Remove `prices` from dependency array.

---

### 6. Missing return in `sort`

The sort callback does not return `0` when priorities are equal.

**Fix:** Always return a number.

---

### 7. Unused `formattedBalances`

`formattedBalances` is created but never used.

**Fix:** Use it for rendering or remove it.

---

### 8. Wrong render source

Rows are rendered from `sortedBalances` instead of `formattedBalances`.

**Problem:** `formatted` becomes `undefined`.

**Fix:** Render using `formattedBalances`.

---

### 9. Using index as key

```tsx
key = { index };
```

**Problem:** Can cause incorrect React rendering.

**Fix:** Use stable unique keys.

---

### 10. Possible `NaN` value

```ts
prices[balance.currency];
```

may be undefined.

**Fix:** Add fallback value like `0`.

---

### 11. Unused `children`

`children` is destructured but never used.

**Fix:** Remove it if unnecessary or render it.

---

### 12. `toFixed()` without precision

```ts
toFixed();
```

**Problem:** Rounds values too aggressively.

**Fix:** Use `toFixed(2)` or `toFixed(6)`.

---

### 13. Repeated priority logic

`getPriority()` is called many times and uses a long `switch` statement.

**Problem:** Harder to maintain and creates repeated computation.

**Fix:** Replace with a constant object map.

Example:

```ts
const PRIORITY_MAP = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};
```

---

### 14. Wrong type casting

`sortedBalances` is typed as `FormattedWalletBalance`.

**Problem:** Data does not contain `formatted`.

**Fix:** Use correct types and correct data source.

# Refactored Code

```tsx
type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: number;
}

type Props = BoxProps;

const PRIORITY_MAP: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: string): number => {
  return PRIORITY_MAP[blockchain] ?? -99;
};

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances() ?? [];
  const prices = usePrices() ?? {};

  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return balances
      .filter((balance) => {
        const priority = getPriority(balance.blockchain);

        return priority > -99 && balance.amount > 0;
      })
      .sort((a, b) => {
        return getPriority(b.blockchain) - getPriority(a.blockchain);
      })
      .map((balance) => ({
        ...balance,
        formatted: balance.amount.toFixed(2),
      }));
  }, [balances]);

  return (
    <div {...rest}>
      {formattedBalances.map((balance) => {
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount;

        return (
          <WalletRow
            key={`${balance.blockchain}-${balance.currency}`}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
          />
        );
      })}
      {children}
    </div>
  );
};
```

## Summary

Fixed type safety issues, invalid filter logic, undefined variables, incorrect render source, unstable React keys, unnecessary `useMemo` dependencies, repeated priority calculations, and possible `NaN` values.

Refactored priority handling using `PRIORITY_MAP` for cleaner and easier maintenance.

Improved rendering flow by using `formattedBalances` correctly and adding proper formatting precision with `toFixed(2)`.