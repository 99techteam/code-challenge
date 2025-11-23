# Problem 3: Messy React

## Computational Inefficiencies and Anti‑Patterns

### 1. **Improper Dependency Usage in `useMemo`**

`sortedBalances` uses `prices` as a dependency even though `prices` is not used inside the memoized function. This causes unnecessary recalculation.

### 2. **Incorrect Variable Reference (`lhsPriority`)**

Inside the filter:

```ts
if (lhsPriority > -99)
```

`lhsPriority` is not defined. Probably meant:

```ts
if (balancePriority > -99)
```

This is a **runtime error**.

### 3. **Filtering Logic Is Broken**

Current logic keeps only `amount <= 0`. This likely should be: keep **positive balances of supported blockchains**, not empty wallets.

### 4. **Redundant Filtering + Sorting Conditions**

Repeated calls to `getPriority()` inside filter and sort. Priorities can be cached **once** per balance.

### 5. **The `.sort()` Callback Doesn't Return Zero**

Missing `return 0` for equal priorities:

```ts
if (leftPriority > rightPriority) return -1
else if (rightPriority > leftPriority) return 1
// Missing return 0
```

This violates the expected comparator contract.

### 6. **Formatted Wallets Are Computed but Never Used**

`formattedBalances` exists but `rows` still maps over `sortedBalances` and incorrectly expects `formatted` to exist.

### 7. **Index Used as React Key**

Using `key={index}` causes unnecessary rerendering and bugs when list order changes.

### 8. **Repeated Computation of USD Value**

USD value computed inside map, recalculating on every render. Should be memoized.

### 9. **Unnecessary `.map()` Twice**

You map once for formatting, and again for generating rows. These should be combined.

### 10. **Inline Arrow Functions Causing Re-renders**

Mapping inside render with heavy computation can degrade performance.

### 11. **Too Many Responsibilities in One Component**

WalletPage:

- Fetches data
- Sorts
- Filters
- Formats values
- Generates UI rows
  Should be split into smaller hooks/utilities.

---

# ✔️ Refactored WalletPage Component

**Fixes all anti‑patterns**, improves performance, and adds strong typing.

```tsx
interface WalletBalance {
  currency: string
  amount: number
  blockchain: string
}

interface Props extends BoxProps {}

const PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
}

const getPriority = (blockchain: string): number => PRIORITY[blockchain] ?? -99

export const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances()
  const prices = usePrices()

  // Precompute enriched data once
  const processedBalances = useMemo(() => {
    return balances
      .map((balance) => ({
        ...balance,
        priority: getPriority(balance.blockchain),
        usdValue: prices[balance.currency] * balance.amount,
        formatted: balance.amount.toFixed(),
      }))
      .filter((b) => b.priority > -99 && b.amount > 0)
      .sort((a, b) => b.priority - a.priority)
  }, [balances, prices])

  return (
    <div {...rest}>
      {processedBalances.map((balance) => (
        <WalletRow
          key={`${balance.currency}-${balance.blockchain}`}
          className={classes.row}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  )
}
```

---

# ✔️ Improvements in the Refactored Version

### ✓ Removes runtime errors (`lhsPriority`)

### ✓ Removes duplicated work (filtering + sorting + formatting → single pass)

### ✓ Memoizes heavy computation

### ✓ Uses stable React keys

### ✓ Cleaner and easier to read

### ✓ Sorting is correct and cheaper (one priority lookup)

### ✓ USD values are computed once
