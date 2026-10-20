# Problem 3: Code Refactoring & Anti-Pattern Analysis

This document provides an in-depth analysis of the computational inefficiencies, logical errors, TypeScript type safety issues, and React anti-patterns identified in the original `WalletPage` implementation, followed by a fully refactored, production-ready solution.

---

## 🚀 Quick Start — Run Live Demo

This submission includes a complete, runnable **Vite + React 18 + TypeScript + Tailwind CSS** application demonstrating the refactored `WalletPage` live with interactive diagnostic inspection:

```bash
# Navigate to problem3 directory
cd src/problem3

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

Open `http://localhost:3001` in your browser to interact with the live portfolio demo.

To build and verify TypeScript:
```bash
npm run build
npm run preview
```

---

## 1. Summary of Identified Issues

| Category | Issue | Impact |
| :--- | :--- | :--- |
| **Critical Bug** | Undeclared variable `lhsPriority` in filter | Causes a fatal runtime crash: `ReferenceError: lhsPriority is not defined`. |
| **Logic Error** | Inverted balance filter (`balance.amount <= 0`) | Discards valid positive balances and retains zero/negative amounts. |
| **TypeScript Bug** | Missing `blockchain` property in `WalletBalance` | Strict TypeScript compilation failure: `Property 'blockchain' does not exist on type 'WalletBalance'`. |
| **Logic Error / Dead Code** | `formattedBalances` computed but never used; unsafe type casting | `formattedBalances` is created as dead memory; `rows` maps over `sortedBalances` with invalid type assertion, causing `formatted` to be `undefined`. |
| **Logic Error** | Incomplete sort comparator (missing return 0) | Returns `undefined` when priorities are equal, leading to non-deterministic / unstable sorting across browsers. |
| **Inefficiency** | `prices` in `useMemo` dependency array | Re-filters and re-sorts balances every time prices change, even though price is not used in the sorting logic. |
| **Inefficiency** | `getPriority` declared inside component body | Re-instantiates function on every single render. |
| **Inefficiency** | Switch-case evaluated repeatedly in $O(N \log N)$ sort | Repeated linear branch evaluations during sort comparisons instead of $O(1)$ dictionary lookups. |
| **Inefficiency** | 4 separate iterations over the balance array | Traverses the array in `filter`, `sort`, `formattedBalances.map`, and `rows.map`. |
| **React Anti-Pattern** | Array `index` used as component `key` | Breaks React reconciliation; causes rendering bugs, DOM thrashing, and state desync when items are reordered or filtered. |
| **React Anti-Pattern** | Unused / swallowed `children` prop | `{ children, ...rest }` destructures `children`, but never renders it in JSX. |
| **Type Anti-Pattern** | `any` type for `blockchain` | Disables TypeScript's type-checker for blockchain identifiers. |
| **Type Anti-Pattern** | Empty interface `interface Props extends BoxProps {}` | Triggers linter rule `@typescript-eslint/no-empty-interface`. |
| **Data Safety** | Missing fallback for `prices[balance.currency]` | If a price is unavailable, multiplying by `undefined` produces `NaN`. |
| **UX / Number Formatting** | `toFixed()` with no arguments | Rounds token amounts to 0 decimal places (e.g., `0.005 ETH` becomes `0 ETH`). |

---

## 2. Detailed Technical Breakdown

### 2.1 Critical Bugs & Logical Flaws

#### 1. Runtime Crash: Undeclared `lhsPriority`
```typescript
// ORIGINAL CODE:
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) { // ❌ ReferenceError: lhsPriority is not defined
  if (balance.amount <= 0) {
    return true;
  }
}
```
- **Explanation:** In the filter callback, the developer declared `balancePriority`, but checked `lhsPriority`. Because `lhsPriority` does not exist in this scope, JavaScript immediately throws a runtime `ReferenceError`.
- **Fix:** Check `balancePriority > -99`.

#### 2. Inverted Filter Business Logic
```typescript
// ORIGINAL CODE:
if (balance.amount <= 0) {
  return true; // ❌ Retains 0 or negative balances!
}
```
- **Explanation:** A wallet balance dashboard should display assets the user currently holds (`amount > 0`). Filtering for `<= 0` excludes all actual holdings and only displays zero/debt balances.
- **Fix:** Keep tokens where `balance.amount > 0`.

#### 3. Missing `blockchain` on `WalletBalance`
```typescript
// ORIGINAL CODE:
interface WalletBalance {
  currency: string;
  amount: number;
  // ❌ Missing 'blockchain' property
}
// Later:
const balancePriority = getPriority(balance.blockchain);
```
- **Explanation:** `balance.blockchain` is accessed in both `filter` and `sort`, but `WalletBalance` only defines `currency` and `amount`. Under TypeScript strict mode, this fails compilation.
- **Fix:** Add `blockchain: string` (or a union type) to `WalletBalance`.

#### 4. `formattedBalances` Was Dead Code & Type Mismatch
```typescript
// ORIGINAL CODE:
const formattedBalances = sortedBalances.map((balance: WalletBalance) => ({
  ...balance,
  formatted: balance.amount.toFixed()
}));

// Later:
const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
  ...
  formattedAmount={balance.formatted} // ❌ undefined at runtime!
});
```
- **Explanation:** `formattedBalances` is mapped into memory and immediately discarded. Instead, `rows` maps over `sortedBalances` while falsely casting each item to `FormattedWalletBalance`. At runtime, `balance.formatted` does not exist on `sortedBalances`, passing `undefined` to `WalletRow`.
- **Fix:** Chain the formatting directly or map over `formattedBalances`.

#### 5. Incomplete Sort Comparator
```typescript
// ORIGINAL CODE:
.sort((lhs: WalletBalance, rhs: WalletBalance) => {
  const leftPriority = getPriority(lhs.blockchain);
  const rightPriority = getPriority(rhs.blockchain);
  if (leftPriority > rightPriority) {
    return -1;
  } else if (rightPriority > leftPriority) {
    return 1;
  }
  // ❌ Missing return 0! Returns undefined when equal.
});
```
- **Explanation:** If two balances have the same priority, the function returns `undefined`. Under the ECMAScript specification, comparators must return a number (`< 0`, `0`, or `> 0`). Returning `undefined` leads to inconsistent and browser-dependent sorting behavior.
- **Fix:** Simplify to `rightPriority - leftPriority`.

---

### 2.2 Computational Inefficiencies & Performance Issues

#### 1. Overly Broad `useMemo` Dependency
```typescript
// ORIGINAL CODE:
const sortedBalances = useMemo(() => {
  ...
}, [balances, prices]); // ❌ 'prices' is never used inside!
```
- **Explanation:** `sortedBalances` only depends on `balance.blockchain` and `balance.amount`. Including `prices` forces the entire array to re-filter and re-sort whenever price ticker data updates (which in Web3 apps can happen multiple times a second), causing severe main-thread lag.
- **Fix:** Either omit `prices` if memoizing `sortedBalances`, or combine the computation of `usdValue` and formatting in a single memoized transformation that legitimately consumes both `balances` and `prices`.

#### 2. Recreation of `getPriority` on Every Render
```typescript
// ORIGINAL CODE:
const WalletPage: React.FC<Props> = (props: Props) => {
  const getPriority = (blockchain: any): number => { ... } // ❌ Re-created on every render
```
- **Explanation:** `getPriority` does not capture any component scope or closure state. Defining it inside the component forces the JS engine to re-allocate the function on every render cycle.
- **Fix:** Hoist `getPriority` outside the component. Use an object map (`Record<string, number>`) for $O(1)$ constant-time lookups rather than a multi-branch `switch` statement.

#### 3. Redundant Iteration Passes (4 Loops)
The original code iterates through the list 4 times:
1. `balances.filter(...)`
2. `.sort(...)`
3. `sortedBalances.map(...)` for `formattedBalances`
4. `sortedBalances.map(...)` for `rows`
- **Fix:** Consolidate filtering and sorting, and perform formatting and USD computation during a single mapping pass.

---

### 2.3 React & TypeScript Anti-Patterns

#### 1. Using Array Index as React `key`
```typescript
// ORIGINAL CODE:
<WalletRow key={index} ... />
```
- **Explanation:** In dynamic lists where items can be re-ordered, filtered, or deleted, using the array index as a `key` causes React to associate DOM nodes with the wrong list items. This results in visual glitches, broken animations, and unneeded DOM re-renders.
- **Fix:** Use a stable unique identifier, such as `${balance.blockchain}-${balance.currency}`.

#### 2. Discarding `children`
```typescript
// ORIGINAL CODE:
const { children, ...rest } = props;
return <div {...rest}>{rows}</div>; // ❌ children was stripped and never rendered
```
- **Explanation:** If any consumer passes children to `<WalletPage>`, they are silently swallowed.
- **Fix:** Render `{children}` inside the wrapper div.

#### 3. Unsafe Token Price Lookup
```typescript
// ORIGINAL CODE:
const usdValue = prices[balance.currency] * balance.amount;
```
- **Explanation:** If a token is not present in `prices`, `prices[balance.currency]` evaluates to `undefined`, resulting in `NaN`.
- **Fix:** Use nullish coalescing: `(prices[balance.currency] ?? 0) * balance.amount`.

#### 4. Ambiguous Decimal Formatting
```typescript
// ORIGINAL CODE:
formatted: balance.amount.toFixed() // ❌ Defaults to 0 decimal places
```
- **Explanation:** Without specifying fraction digits, `toFixed()` rounds to the nearest whole integer. In crypto, holding `0.45 ETH` would be displayed as `0 ETH`.
- **Fix:** Use `toLocaleString()` or specify minimum/maximum fraction digits (e.g. 2 to 6).

---

## 3. Refactored Solution

```tsx
import React, { useMemo } from 'react';

// ==========================================
// 1. Types & Interfaces
// ==========================================
export type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo' | string;

export interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

export interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

// Subcomponent & Hook type contracts
interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}

declare const WalletRow: React.FC<WalletRowProps>;
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number | undefined>;

// ==========================================
// 2. Constants & Pure Helpers (Outside Component)
// ==========================================
const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const DEFAULT_PRIORITY = -99;

const getPriority = (blockchain: Blockchain): number => {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? DEFAULT_PRIORITY;
};

// ==========================================
// 3. Component Implementation
// ==========================================
export interface Props extends BoxProps {}

export const WalletPage: React.FC<Props> = ({ children, className, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Unified single-pass memoization:
  // - Filters: only valid priority (> -99) and positive balance (> 0)
  // - Sorts: descending priority using stable numeric difference
  // - Maps: computes 'formatted' and 'usdValue' once, handling missing price fallbacks
  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return priority > DEFAULT_PRIORITY && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      })
      .map((balance: WalletBalance) => {
        const price = prices[balance.currency] ?? 0;
        return {
          ...balance,
          formatted: balance.amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          }),
          usdValue: price * balance.amount,
        };
      });
  }, [balances, prices]);

  return (
    <div className={className} {...rest}>
      {formattedBalances.map((balance: FormattedWalletBalance) => (
        <WalletRow
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
      {children}
    </div>
  );
};

export default WalletPage;
```

