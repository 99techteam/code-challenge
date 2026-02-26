# Problem 3 — WalletPage Code Review & Refactor

## Overview

This task requires identifying all **computational inefficiencies** and **anti-patterns** in the original code block, then providing a refactored version using React + TypeScript + shadcn/ui.

---

## Issues Found (8 Problems)

### Bug 1 — `lhsPriority` is an undeclared variable (ReferenceError)

```ts
// ❌ ORIGINAL — throws ReferenceError at runtime
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) { ... }  // lhsPriority was never declared!

// ✅ FIX
const priority = getPriority(balance.blockchain);
if (priority > -99) { ... }
```

**Impact:** The app crashes immediately when `sortedBalances` is computed.

---

### Bug 2 — Inverted filter logic

```ts
// ❌ ORIGINAL — keeps balances with amount <= 0 (zero or negative)
if (balance.amount <= 0) {
  return true;
}

// ✅ FIX — keep balances with a valid priority AND amount > 0
return priority > -99 && balance.amount > 0;
```

**Impact:** Empty or negative wallets are displayed; wallets with actual funds are hidden.

---

### Bug 3 — `formattedBalances` is computed but never used

```ts
// ❌ ORIGINAL — computes formattedBalances...
const formattedBalances = sortedBalances.map((balance) => ({
  ...balance,
  formatted: balance.amount.toFixed(),
}));

// ...but rows maps from sortedBalances (not formattedBalances)!
const rows = sortedBalances.map((balance: FormattedWalletBalance, index) => {
  // balance.formatted is always undefined here
  return <WalletRow formattedAmount={balance.formatted} />;
});
```

**Impact:** The `formattedAmount` prop is always `undefined`. This is both dead code and a silent data bug.

---

### Bug 4 — `getPriority` defined inside the component (performance)

```ts
// ❌ ORIGINAL — function is re-created on every render
const WalletPage = (props) => {
  const getPriority = (blockchain: any): number => { ... };
};

// ✅ FIX — moved to module scope, created only once
const BLOCKCHAIN_PRIORITY: Record<string, number> = { ... };
function getPriority(blockchain: string): number {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? -99;
}
```

**Impact:** Every render allocates a new closure unnecessarily. React also has to re-compare it as a `useMemo` dependency on each render.

---

### Bug 5 — Incorrect `useMemo` dependency array

```ts
// ❌ ORIGINAL — prices is listed as a dependency but never used inside the callback
const sortedBalances = useMemo(() => {
  return balances.filter(...).sort(...);
  // prices is not used here!
}, [balances, prices]);  // ← prices is a spurious dependency

// ✅ FIX — prices is now genuinely used to compute usdValue inside the memo
const sortedBalances = useMemo(() => {
  return balances
    .filter(...)
    .sort(...)
    .map((b) => ({ ...b, usdValue: (prices[b.currency] ?? 0) * b.amount }));
}, [balances, prices]);  // ← prices is now a valid dependency
```

**Impact:** Either unnecessary recomputation or stale data (prices don't update when they should).

---

### Bug 6 — Sort comparator missing `return` for equal case

```ts
// ❌ ORIGINAL — returns nothing when priorities are equal → non-deterministic order
.sort((lhs, rhs) => {
  if (leftPriority > rightPriority) return -1;
  else if (rightPriority > leftPriority) return 1;
  // missing: return 0 → undefined behavior!
});

// ✅ FIX — subtraction shorthand always returns a value
.sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain))
```

**Impact:** Sort order is unstable and may differ across browsers or JS engines.

---

### Bug 7 — Using `index` as `key` in a sorted list

```ts
// ❌ ORIGINAL — key is the array index
const rows = sortedBalances.map((balance, index) => (
  <WalletRow key={index} ... />
));

// ✅ FIX — key is a stable, unique identifier
sortedBalances.map((balance) => (
  <WalletRow key={`${balance.blockchain}-${balance.currency}`} ... />
))
```

**Impact:** When the list is re-sorted and order changes, React misidentifies which component is which, leading to wrong DOM updates, animation bugs, and focus loss.

---

### Bug 8 — `blockchain: any` loses type safety

```ts
// ❌ ORIGINAL
const getPriority = (blockchain: any): number => { ... }

// ✅ FIX
function getPriority(blockchain: string): number { ... }
```

**Impact:** `any` disables all TypeScript type-checking for that argument — the function could be called with an object or number and the compiler would not report an error.

---

## Summary Table

| # | Issue | Severity |
|---|-------|----------|
| 1 | ReferenceError (`lhsPriority` undefined) | 🔴 Critical — runtime crash |
| 2 | Inverted filter logic | 🔴 Critical — wrong data |
| 3 | `formattedBalances` computed but unused | 🟠 High — silent `undefined` prop |
| 4 | `getPriority` defined inside component | 🟡 Medium — performance |
| 5 | Incorrect `useMemo` dependencies | 🟡 Medium — stale / wasteful |
| 6 | Sort comparator missing `return 0` | 🟡 Medium — non-deterministic |
| 7 | `key={index}` in a sorted list | 🟡 Medium — React reconciliation bug |
| 8 | `blockchain: any` | 🟢 Low — type safety |

---

## Getting Started

### Prerequisites

```bash
npm install
npx shadcn@latest add table badge card
```

### Using the Component

```tsx
// App.tsx
import { WalletPage } from "./WalletPage";
import { MOCK_BALANCES, MOCK_PRICES } from "./mockData";

export default function App() {
  return <WalletPage balances={MOCK_BALANCES} prices={MOCK_PRICES} />;
}
```

### What the Mock Data Demonstrates

| Balance | Filter Result |
|---------|--------------|
| OSMO 1340.75 | ✅ Shown (priority=100, amount>0) |
| ETH 2.48 | ✅ Shown (priority=50, amount>0) |
| ARB 850 | ✅ Shown (priority=30, amount>0) |
| ZIL 12000 | ✅ Shown (priority=20, amount>0) |
| NEO 35.5 | ✅ Shown (priority=20, amount>0) |
| USDC 0 | ❌ Filtered out (amount = 0) |
| SOL 10 | ❌ Filtered out (priority = -99, unknown blockchain) |

---

## Architectural Changes in the Refactored Version

1. **Explicit props interface** — `WalletPageProps` accepts `balances` and `prices` directly instead of extending `BoxProps` with an unused `children` prop.
2. **Two `.map()` calls merged into one** — sort + format + usdValue are all computed in a single `useMemo` pipeline, avoiding multiple array traversals.
3. **shadcn/ui components** — `Table`, `Badge`, and `Card` replace custom markup, ensuring accessibility and visual consistency.
4. **`WalletRow` extracted as a sub-component** — receives the full `FormattedWalletBalance` object, making it easy to test and reuse independently.

---

## Files

| File | Description |
|------|-------------|
| `WalletPage.tsx` | Refactored component with all fixes applied and shadcn/ui |
| `mockData.ts` | Sample data: balances and prices |
| `README.md` | This file |