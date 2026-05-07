# Problem 3: Messy React — Code Review & Refactoring

## Identified Issues

---

### 1. **`undefined` variable `lhsPriority` (Bug / Runtime Error)**

Inside the `filter` callback, the code references `lhsPriority` which is **never declared**. The variable computed just above is `balancePriority`. This throws a `ReferenceError` at runtime.

```ts
// ❌ Bug: lhsPriority is undefined, should be balancePriority
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) { ... }

// ✅
if (balancePriority > -99) { ... }
```

---

### 2. **Incorrect Filter Logic (Logic Error)**

The filter is intended to keep balances with a valid priority **and** a positive amount. However, `balance.amount <= 0` returning `true` means it **keeps zero/negative balances** — the opposite of the intended behavior.

```ts
// ❌ Wrong: keeps balances with amount <= 0
if (balance.amount <= 0) {
  return true;
}

// ✅ Correct: keep valid, positive balances
return priority > -99 && balance.amount > 0;
```

---

### 3. **`getPriority` Defined Inside the Component (Performance Anti-pattern)**

`getPriority` is a pure utility function with no dependency on component state or props. Re-creating it on every render is wasteful. It should be moved **outside** the component to module scope. Better yet, replace it with a lookup object for O(1) access.

```ts
// ❌ Re-created on every render
const WalletPage = (props) => {
  const getPriority = (blockchain: any): number => { ... }
}

// ✅ Module-level constant, created once
const PRIORITY_MAP: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};
```

---

### 4. **`blockchain` Typed as `any` (TypeScript Anti-pattern)**

The parameter `blockchain: any` defeats TypeScript's type safety. A proper union type should be declared so the compiler can enforce valid values.

```ts
// ❌ No type safety
const getPriority = (blockchain: any): number => { ... }

// ✅ Use a union type
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';
```

---

### 5. **`prices` in `useMemo` Dependencies but Unused — and Misplaced Computation**

`prices` is listed as a `useMemo` dependency but the memo body never uses it. However, simply removing it is also wrong — `usdValue` (which does depend on `prices`) should be computed **inside** the memo. Moving it inside makes `prices` a correct and necessary dependency, and avoids stale closures.

```ts
// ❌ prices in deps but unused inside memo → spurious re-computation
const sortedBalances = useMemo(() => {
  return balances.filter(...).sort(...);
}, [balances, prices]);

// ❌ Also wrong: usdValue computed outside memo with prices — stale closure risk
const rows = sortedBalances.map(b => {
  const usdValue = prices[b.currency] * b.amount;
  ...
});

// ✅ Move usdValue inside memo — prices dep is now genuinely correct
const walletRows = useMemo(() => {
  return balances.filter(...).sort(...).map(b => {
    const usdValue = (prices[b.currency] ?? 0) * b.amount;
    return <WalletRow ... />;
  });
}, [balances, prices]);
```

---

### 6. **`formattedBalances` Computed but Never Used (Dead Code / Bug)**

`formattedBalances` is created with `.map()` but `rows` still iterates `sortedBalances`. This means the formatting work is wasted *and* `balance.formatted` passed to `WalletRow` is always `undefined`.

```ts
// ❌ formattedBalances is never consumed
const formattedBalances = sortedBalances.map((balance: WalletBalance) => ({
  ...balance,
  formatted: balance.amount.toFixed()
}));

// ❌ rows maps sortedBalances, not formattedBalances
const rows = sortedBalances.map((balance: FormattedWalletBalance) => {
  formattedAmount={balance.formatted} // undefined!
})

// ✅ Merge formatting into the single pipeline inside useMemo
```

---

### 7. **Using Array Index as `key` (React Anti-pattern)**

Using `index` as the `key` prop causes React to misidentify list items when they are added, removed, or reordered, leading to incorrect DOM updates or state bleeding. A stable, unique composite key should be used.

```tsx
// ❌ Index is unstable
<WalletRow key={index} />

// ✅ Stable composite key
<WalletRow key={`${b.blockchain}-${b.currency}`} />
```

---

### 8. **`blockchain` Field Missing from `WalletBalance` Interface (TypeScript Gap)**

The `WalletBalance` interface only declares `currency` and `amount`, but `balance.blockchain` is accessed throughout the component. TypeScript cannot type-check these accesses without the field declared.

```ts
// ❌ blockchain missing
interface WalletBalance {
  currency: string;
  amount: number;
}

// ✅ Add blockchain with the proper type
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}
```

---

### 9. **`sort` Comparator Missing Return for Equal Priorities (Edge Case / Bug)**

When `leftPriority === rightPriority` the comparator falls through with no `return`. Per the ECMAScript spec the comparator must return a number; returning `undefined` gives implementation-defined (unpredictable) ordering.

```ts
// ❌ No return for equal case — undefined behavior
if (leftPriority > rightPriority) return -1;
else if (rightPriority > leftPriority) return 1;
// missing return 0

// ✅ Subtraction always returns a number and handles all cases
.sort((a, b) => (PRIORITY_MAP[b.blockchain] ?? -99) - (PRIORITY_MAP[a.blockchain] ?? -99))
```

---

### 10. **`children` Destructured but Never Rendered (Silent Data Loss)**

`children` is extracted from props but never placed in the JSX. Any child content passed to `WalletPage` is silently discarded.

```tsx
// ❌ children extracted but dropped
const { children, ...rest } = props;
return <div {...rest}>{rows}</div>;

// ✅ Render children
return <div {...rest}>{walletRows}{children}</div>;
```

---

### 11. **`.sort()` Mutates the Source Array (Immutability Violation)**

`Array.prototype.sort()` sorts **in place**. Calling it directly on the result of `.filter()` (which returns a new array) is fine here, but if `balances` were sorted directly it would corrupt the hook's data. Using `.slice()` before `.sort()` is the safe, idiomatic pattern.

```ts
// ❌ Risk: sort mutates — unsafe if applied directly to balances
balances.sort(...)

// ✅ Clone first, then sort
balances.filter(...).slice().sort(...)
```

---

### 12. **`prices[currency]` May Be `undefined` → Silent `NaN` (Safety)**

If a balance's currency is absent from the `prices` map, the multiplication produces `NaN`, which propagates silently into the UI without any error.

```ts
// ❌ NaN if currency not in prices
const usdValue = prices[balance.currency] * balance.amount;

// ✅ Safe fallback with nullish coalescing
const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
```

---

### 13. **`amount.toFixed()` — Inconsistent Decimal Display (Code Quality)**

`toFixed()` with no argument defaults to 0 decimal places, which produces inconsistent output (e.g., `"100"` for `100.50`). An explicit precision should always be specified.

```ts
// ❌ toFixed() → 0 decimal places, inconsistent
balance.amount.toFixed()

// ✅ Explicit and consistent
balance.amount.toFixed(2)
```

---

## Summary of Issues

| # | Issue | Category |
|---|-------|----------|
| 1 | `lhsPriority` undefined — ReferenceError at runtime | 🔴 Bug |
| 2 | Filter logic inverted (`<= 0` keeps bad balances) | 🔴 Logic Error |
| 3 | `getPriority` re-created every render | 🟡 Performance |
| 4 | `blockchain: any` — no TypeScript type safety | 🟡 TypeScript |
| 5 | `prices` dep mismatch + `usdValue` outside memo | 🟡 Performance / Logic |
| 6 | `formattedBalances` dead code; `formatted` always `undefined` | 🔴 Bug / Dead Code |
| 7 | Array index used as React `key` | 🟡 React Anti-pattern |
| 8 | `blockchain` missing from `WalletBalance` interface | 🟡 TypeScript Gap |
| 9 | `sort` returns `undefined` for equal priorities | 🔴 Edge Case |
| 10 | `children` destructured but not rendered | 🟡 Silent Data Loss |
| 11 | `.sort()` mutates source array | 🟠 Immutability |
| 12 | `prices[currency]` may be `undefined` → `NaN` | 🟠 Safety |
| 13 | `toFixed()` — inconsistent decimal places | 🟢 Code Quality |

---

## Refactored Version

```tsx
import React, { useMemo } from 'react';

// ✅ Fix #4 & #8: Strict union type, declared on the interface
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface Props extends BoxProps {}

// ✅ Fix #3: Module-level lookup — O(1), never re-created
const PRIORITY_MAP: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const walletRows = useMemo(() => {
    return (
      balances
        // ✅ Fix #1 & #2: Correct variable, correct filter logic
        .filter(
          (b: WalletBalance) =>
            b.amount > 0 && (PRIORITY_MAP[b.blockchain] ?? -99) > -99
        )
        // ✅ Fix #11: .slice() prevents mutation of the source array
        .slice()
        // ✅ Fix #9: Subtraction always returns a number (handles equal case)
        .sort(
          (a: WalletBalance, b: WalletBalance) =>
            (PRIORITY_MAP[b.blockchain] ?? -99) -
            (PRIORITY_MAP[a.blockchain] ?? -99)
        )
        // ✅ Fix #5 & #6: usdValue + formatting merged here; prices dep is correct
        .map((b: WalletBalance) => {
          const formattedAmount = b.amount.toFixed(2); // ✅ Fix #13
          const usdValue = (prices[b.currency] ?? 0) * b.amount; // ✅ Fix #12
          const key = `${b.blockchain}-${b.currency}`; // ✅ Fix #7

          return (
            <WalletRow
              key={key}
              amount={b.amount}
              usdValue={usdValue}
              formattedAmount={formattedAmount}
            />
          );
        })
    );
    // ✅ Fix #5: Both are genuine dependencies now
  }, [balances, prices]);

  return (
    <div {...rest}>
      {/* ✅ Empty state guard */}
      {walletRows.length > 0 ? walletRows : <p>No balances to display.</p>}
      {/* ✅ Fix #10: children is rendered, not silently dropped */}
      {children}
    </div>
  );
};
```
