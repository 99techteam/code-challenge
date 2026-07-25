# Problem 3 — Messy React

Analysis of the computational inefficiencies and anti-patterns in the original
`WalletPage` component, grouped by category. Each item states **what** is wrong,
**why** it matters, and **how** to fix it. The corrected implementation lives in
[`refactored.tsx`](./refactored.tsx).

---

## A. Bugs / Correctness

### A1. `lhsPriority` is undefined — `ReferenceError`
```ts
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) { ... }   // lhsPriority was never declared
```
The filter computes `balancePriority` but then tests a variable named
`lhsPriority` that does not exist in scope. In a real build this is a
`ReferenceError` at runtime (or a compile error under `noUnusedLocals` /
`strict`), so the component never renders.

**Fix:** reference the variable that was actually computed
(`balancePriority`), or inline the call.

### A2. Inverted filter logic — keeps empty balances, drops real ones
```ts
if (balancePriority > -99) {
  if (balance.amount <= 0) {
    return true;   // keeps zero / negative balances
  }
}
return false;      // drops every positive balance
```
The predicate keeps balances whose `amount <= 0` and discards every balance with
a positive amount — the opposite of what a wallet view wants. It also nests two
`if`s where one boolean expression is clearer.

**Fix:**
```ts
return getPriority(balance.blockchain) > -99 && balance.amount > 0;
```

### A3. `.sort()` comparator can return `undefined`
```ts
.sort((lhs, rhs) => {
  const leftPriority = getPriority(lhs.blockchain);
  const rightPriority = getPriority(rhs.blockchain);
  if (leftPriority > rightPriority) return -1;
  else if (rightPriority > leftPriority) return 1;
  // equal case: falls through and returns undefined
});
```
When two items have equal priority the function returns `undefined`, which is
not a valid comparator result. `Array.prototype.sort` expects a number; a
non-number is coerced/treated inconsistently and produces implementation-defined,
potentially unstable ordering.

**Fix:** return `0` for the equal case — or simply
`return rightPriority - leftPriority;`.

### A4. `formattedBalances` is computed but never used; `rows` reads a field that doesn't exist
```ts
const formattedBalances = sortedBalances.map(...);   // never referenced

const rows = sortedBalances.map((balance: FormattedWalletBalance) => {
  ...
  formattedAmount={balance.formatted}   // 'formatted' does not exist on WalletBalance
});
```
`formattedBalances` (the array that actually has the `formatted` field) is thrown
away. `rows` instead maps over `sortedBalances`, whose items are plain
`WalletBalance` and have **no** `formatted` property, so `balance.formatted` is
`undefined` at runtime. The parameter is also mis-typed as
`FormattedWalletBalance`, which hides the error from the compiler (a lie to the
type system).

**Fix:** map over the formatted array (or format inside the single map that
builds the rows) so the value passed to `formattedAmount` actually exists.

### A5. `prices[balance.currency]` can be `undefined` → `NaN`
```ts
const usdValue = prices[balance.currency] * balance.amount;
```
If a currency is missing from `prices`, the multiplication yields `NaN`, which
then renders into the UI.

**Fix:** guard the lookup, e.g. `const price = prices[balance.currency] ?? 0;`.

### A6. `.toFixed()` with no argument
```ts
formatted: balance.amount.toFixed()
```
With no digits argument, `toFixed` rounds to **zero** decimal places
(`1.987.toFixed()` → `"2"`), which is almost certainly not intended for a token
amount and gives inconsistent precision.

**Fix:** pass an explicit precision, e.g. `.toFixed(2)` (or a per-currency
precision).

---

## B. Performance / Computational inefficiency

### B1. Wrong `useMemo` dependency array
```ts
const sortedBalances = useMemo(() => { ... }, [balances, prices]);
```
The memoized computation uses only `balances` (and `getPriority`); it never reads
`prices`. Listing `prices` forces the filter+sort to recompute every time prices
tick — which, for a live price feed, can be many times per second — for no
benefit.

**Fix:** depend on `[balances]` only (plus `getPriority` if it isn't hoisted).

### B2. `getPriority` re-created every render and called O(n log n) times
`getPriority` is redefined on every render (new function identity each time), and
it is invoked *inside the sort comparator*, so for `n` items it runs roughly
`O(n log n)` times per sort — recomputing the same constant priority for the same
item repeatedly.

**Fix:** hoist `getPriority` out of the component (it depends on nothing from
props/state) so it is defined once, and back it with a `Record` lookup instead of
a `switch`. Better still, compute each item's priority **once** by mapping to
`{ balance, priority }` before sorting, so the comparator just reads a number.

### B3. `formattedBalances` is redundant work
As noted in A4, `formattedBalances` is fully computed and discarded — pure wasted
work on every render. Removing it (and doing the formatting once, where it's
actually consumed) eliminates an entire pass over the array.

### B4. Row list not memoized
`rows` is rebuilt on every render even when neither `balances` nor `prices`
changed. Deriving it from a `useMemo` (keyed on the sorted/priced data) avoids
rebuilding the JSX array unnecessarily.

---

## C. Type-safety

### C1. `getPriority(blockchain: any)`
Using `any` disables all type checking on the argument, so typos or wrong shapes
pass silently.

**Fix:** introduce a `Blockchain` union (or enum) type and type the parameter as
`Blockchain`.

### C2. `WalletBalance` has no `blockchain` field
The code reads `balance.blockchain` throughout, but the `WalletBalance` interface
only declares `currency` and `amount`. The interface is incomplete; the reads
only "work" because `any`/loose typing hides it.

**Fix:** add `blockchain: Blockchain` to `WalletBalance`.

### C3. Mis-typed map callback (see A4)
`sortedBalances.map((balance: FormattedWalletBalance, ...))` annotates the item
as a type it does not actually have, defeating the purpose of TypeScript. Let
inference do its job or annotate accurately.

---

## D. React anti-patterns / code smell

### D1. `key={index}`
```tsx
<WalletRow key={index} ... />
```
Using the array index as a `key` breaks React's reconciliation when the list is
reordered, inserted into, or filtered (exactly what this component does — it
sorts and filters). It can cause wrong rows to update, lost input state, and
subtle rendering bugs.

**Fix:** use a stable, unique key such as `balance.currency` (or a blockchain +
currency composite if currencies can repeat).

### D2. Empty `interface Props extends BoxProps {}`
An empty interface that only extends another type adds nothing and triggers the
`@typescript-eslint/no-empty-interface` lint.

**Fix:** use `type Props = BoxProps;` (or add the real extra props).

### D3. `children` destructured but never used
```ts
const { children, ...rest } = props;
```
`children` is pulled out and discarded. Either render it or don't destructure it
(so it stays in `...rest` and passes through the spread naturally).

### D4. Building JSX in the component body / other minor smells
- `classes` (used as `className={classes.row}`) is referenced but never
  imported/shown — a dangling dependency.
- Deriving the JSX array inline (`rows`) mixes data transformation with markup;
  extracting the data pipeline into memoized derivations keeps render clean.

---

## Summary of fixes applied in `refactored.tsx`
1. `Blockchain` union type + `blockchain` field added to `WalletBalance`.
2. `getPriority` hoisted out of the component, backed by a `Record` lookup.
3. Single `useMemo` with correct deps `[balances]`, computing priority **once**
   per item, filtering `amount > 0`, and a complete comparator (`return 0`).
4. One formatting pass, whose result is what `rows` actually consumes.
5. Guarded `usdValue` (missing price → `0`, no `NaN`).
6. Explicit `toFixed(2)`.
7. Stable `key={balance.currency}`.
8. `type Props = BoxProps`, `children` handled cleanly.
