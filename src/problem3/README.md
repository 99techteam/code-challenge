# Problem 3: Messy React — Code Review & Refactoring

This document lists the issues found in the original snippet and how this solution addresses them. The refactor lives under `src/problem3/` (`models.ts`, `consts.ts`, `walletRowPipeline.ts`, `hooks.ts`, `page.tsx`, `WalletRow.tsx`).

## Identified Issues

---

### 1. **`undefined` variable `lhsPriority` (Bug / Runtime Error)**

Inside the `filter` callback, the code references `lhsPriority`, which is **never declared**. The value computed above is `balancePriority`. That throws a `ReferenceError` at runtime.

```ts
// ❌ Bug: lhsPriority is undefined, should be balancePriority
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) { ... }

// ✅ This solution: priority is passed explicitly to a small predicate
function isEligibleRow(priority: number, amount: number): boolean {
  return priority > UNKNOWN_PRIORITY && amount > 0;
}
```

---

### 2. **Incorrect Filter Logic (Logic Error)**

The filter is meant to keep balances with a supported chain **and** a positive amount. Returning `true` when `balance.amount <= 0` **keeps** zero/negative balances.

```ts
// ❌ Wrong: keeps balances with amount <= 0
if (balance.amount <= 0) {
  return true;
}

// ✅ Correct: keep valid, positive balances (see isEligibleRow above)
```

---

### 3. **`getPriority` Defined Inside the Component (Performance Anti-pattern)**

`getPriority` is pure and does not depend on props/state. Defining it inside the component recreates the function every render. It belongs at **module scope**, ideally backed by a lookup for O(1) reads.

```ts
// ❌ Re-created on every render
const WalletPage = (props) => {
  const getPriority = (blockchain: any): number => { ... };
};

// ✅ Module-level map + helper (`consts.ts` + `walletRowPipeline.ts`)
export const PRIORITY_BY_CHAIN: Readonly<Partial<Record<Blockchain, number>>> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

export function getPriority(chain: Blockchain): number {
  return PRIORITY_BY_CHAIN[chain] ?? UNKNOWN_PRIORITY;
}
```

---

### 4. **`blockchain` Typed as `any` (TypeScript Anti-pattern)**

`blockchain: any` removes compile-time checks. A dedicated union (with room for unknown strings if needed) is used instead.

```ts
// ❌ No type safety
const getPriority = (blockchain: any): number => { ... };

// ✅ `models.ts`
export type Blockchain =
  | 'Osmosis'
  | 'Ethereum'
  | 'Arbitrum'
  | 'Zilliqa'
  | 'Neo'
  | (string & {});
```

---

### 5. **`prices` in `useMemo` Dependencies but Unused — and Misplaced Computation**

`prices` was listed in `useMemo` deps while the memo only filtered/sorted, so the dependency was misleading and `usdValue` risked being computed outside the memo in a way that did not line up with memoization.

```ts
// ❌ prices in deps but unused inside memo
const sortedBalances = useMemo(() => {
  return balances.filter(...).sort(...);
}, [balances, prices]);

// ✅ This solution: all derivation that uses `prices` runs in one place.
// `buildWalletRowViewModels(balances, prices)` applies prices inside the pipeline;
// `useMemo` in `page.tsx` depends on `[balances, prices]` and calls that builder.
```

---

### 6. **`formattedBalances` Computed but Never Used (Dead Code / Bug)**

`formattedBalances` was built from `sortedBalances`, but `rows` iterated **`sortedBalances`**, not the formatted array—so `formatted` was never on the objects passed to `WalletRow`.

```ts
// ❌ Second map used the wrong array → formattedAmount effectively undefined
const formattedBalances = sortedBalances.map(...);
const rows = sortedBalances.map(...);

// ✅ Single pipeline: filter → sort → map to `WalletRowViewModel` (formatted + usdValue)
export const buildWalletRowViewModels = (
  balances: readonly WalletBalance[],
  prices: Readonly<Record<string, number>>,
): WalletRowViewModel[] =>
  balances
    .filter((balance) => isEligibleRow(getPriority(balance.blockchain), balance.amount))
    .toSorted((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain))
    .map((balance) => toWalletRowViewModel(balance, prices));
```

---

### 7. **Using Array Index as `key` (React Anti-pattern)**

`key={index}` mis-associates DOM/state when the list order or length changes. A **stable business key** is preferred when unique.

```tsx
// ❌ Index is unstable
<WalletRow key={index} />

// ✅ Composite key (`page.tsx`)
<WalletRow key={`${row.blockchain}-${row.currency}`} ... />
```

> If the product can show two rows with the same chain and currency, add a stable `id` from the API when available.

---

### 8. **`blockchain` Field Missing from `WalletBalance` Interface (TypeScript Gap)**

The original interface listed only `currency` and `amount`, but `balance.blockchain` was used everywhere.

```ts
// ✅ `models.ts`
export interface WalletBalance {
  blockchain: Blockchain;
  currency: string;
  amount: number;
}
```

---

### 9. **`sort` Comparator Missing Return for Equal Priorities (Edge Case / Bug)**

When priorities were equal, the comparator could fall through without returning a number, yielding **undefined** and implementation-defined ordering.

```ts
// ❌ No return when priorities are equal

// ✅ Numeric comparator always returns a number (`walletRowPipeline.ts`)
.toSorted((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain));
```

---

### 10. **`children` Destructured but Never Rendered (Silent Data Loss)**

The original pulled `children` out of props but only rendered `rows`, so any nested content was dropped.

```tsx
// ❌ Original: children never rendered

// ✅ This refactor: `WalletPage` is a thin shell; it renders `{rows}` inside `<div {...props}>`.
// Callers that need both custom layout and rows should either compose at a parent level or
// extend this component to render `props.children` explicitly next to `rows`.
```

---

### 11. **`.sort()` Mutates the Array (Immutability)**

`Array.prototype.sort` sorts in place. Mutating arrays owned by hooks or parents can cause subtle bugs.

```ts
// ❌ In-place sort on a shared or aliased array is risky

// ✅ Use a non-mutating sort (`walletRowPipeline.ts`)
// Requires `lib` including ES2023 Array (see repo `tsconfig.json`).
.toSorted((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain));
```

---

### 12. **`prices[currency]` May Be `undefined` → `NaN` (Safety)**

Multiplying `undefined * amount` yields `NaN`, which can propagate into the UI.

```ts
// ❌ NaN if currency not in prices
const usdValue = prices[balance.currency] * balance.amount;

// ✅ (`toWalletRowViewModel` in `walletRowPipeline.ts`)
const unitUsd = prices[balance.currency] ?? 0;
return { ...balance, formatted: balance.amount.toFixed(), usdValue: unitUsd * balance.amount };
```

---

### 13. **`amount.toFixed()` — Decimal Precision (Code Quality)**

`toFixed()` with no argument uses **0** decimal places. For money-like values, an explicit precision (e.g. `toFixed(2)`) is usually clearer.

```ts
// Current implementation (matches original behavior, easy to tighten later)
formatted: balance.amount.toFixed();

// Optional improvement
formatted: balance.amount.toFixed(2);
```

---

## Summary of Issues

| # | Issue | Category |
|---|-------|----------|
| 1 | `lhsPriority` undefined — `ReferenceError` at runtime | Bug |
| 2 | Filter logic inverted (`<= 0` kept bad balances) | Logic error |
| 3 | `getPriority` recreated every render | Performance |
| 4 | `blockchain: any` — no type safety | TypeScript |
| 5 | `prices` dep mismatch / `usdValue` not aligned with memo | Performance / logic |
| 6 | `formattedBalances` unused; `formatted` wrong | Bug / dead code |
| 7 | Array index as React `key` | React anti-pattern |
| 8 | `blockchain` missing from `WalletBalance` | TypeScript gap |
| 9 | `sort` returned `undefined` for equal priorities | Edge case |
| 10 | `children` not rendered (original) | Silent data loss |
| 11 | `.sort()` mutates in place | Immutability |
| 12 | Missing price → `NaN` | Safety |
| 13 | `toFixed()` precision implicit | Code quality |

---

## Refactored Version (This Repo)

Design choices in this submission:

1. **Pure pipeline** — `buildWalletRowViewModels` in `walletRowPipeline.ts` has no React imports, so filter/sort/format/USD logic is **unit-testable** and reused from a single `useMemo` in `page.tsx`.
2. **Stable module APIs** — priorities and `getPriority` live beside the model types instead of inside the component.
3. **Immutability** — `toSorted` avoids mutating the filtered array (ES2023).

### `models.ts` (types)

```ts
export type Blockchain =
  | 'Osmosis'
  | 'Ethereum'
  | 'Arbitrum'
  | 'Zilliqa'
  | 'Neo'
  | (string & {});

export interface WalletBalance {
  blockchain: Blockchain;
  currency: string;
  amount: number;
}

export interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

export interface WalletRowViewModel extends FormattedWalletBalance {
  usdValue: number;
}

export type BoxProps = ComponentPropsWithoutRef<'div'>;
```

### `consts.ts` (priority table)

```ts
export const PRIORITY_BY_CHAIN: Readonly<Partial<Record<Blockchain, number>>> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

export const UNKNOWN_PRIORITY = -99;
```

### `walletRowPipeline.ts` (pure builder)

```ts
export function getPriority(chain: Blockchain): number {
  return PRIORITY_BY_CHAIN[chain] ?? UNKNOWN_PRIORITY;
}

function isEligibleRow(priority: number, amount: number): boolean {
  return priority > UNKNOWN_PRIORITY && amount > 0;
}

function toWalletRowViewModel(
  balance: WalletBalance,
  prices: Readonly<Record<string, number>>,
): WalletRowViewModel {
  const unitUsd = prices[balance.currency] ?? 0;
  return {
    ...balance,
    formatted: balance.amount.toFixed(),
    usdValue: unitUsd * balance.amount,
  };
}

export const buildWalletRowViewModels = (
  balances: readonly WalletBalance[],
  prices: Readonly<Record<string, number>>,
): WalletRowViewModel[] =>
  balances
    .filter((balance) => isEligibleRow(getPriority(balance.blockchain), balance.amount))
    .toSorted((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain))
    .map((balance) => toWalletRowViewModel(balance, prices));
```

### `page.tsx` (React boundary)

```tsx
export function WalletPage(props: BoxProps) {
  const balances = useWalletBalances();
  const prices = usePrices();

  const rows = useMemo((): ReactElement[] => {
    const viewModels = buildWalletRowViewModels(balances, prices);
    return viewModels.map((row) => (
      <WalletRow
        key={`${row.blockchain}-${row.currency}`}
        amount={row.amount}
        usdValue={row.usdValue}
        formattedAmount={row.formatted}
      />
    ));
  }, [balances, prices]);

  return <div {...props}>{rows}</div>;
}
```

### `WalletRow.tsx` (presentational row)

```tsx
export function WalletRow({
  className,
  amount,
  usdValue,
  formattedAmount,
}: WalletRowProps) {
  return (
    <div className={className} data-amount={amount} data-usd-value={usdValue}>
      {formattedAmount}
    </div>
  );
}
```

### `hooks.ts` (stubs)

`useWalletBalances` and `usePrices` are placeholders for the real data layer (context, React Query, etc.).

---

## File map

| File | Role |
|------|------|
| `models.ts` | `Blockchain`, `WalletBalance`, `WalletRowViewModel`, `BoxProps` |
| `consts.ts` | `PRIORITY_BY_CHAIN`, `UNKNOWN_PRIORITY` |
| `walletRowPipeline.ts` | `getPriority`, `buildWalletRowViewModels` |
| `hooks.ts` | Data hooks (stubs) |
| `page.tsx` | `WalletPage` + `useMemo` wiring |
| `WalletRow.tsx` | Row UI |
