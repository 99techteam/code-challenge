# Problem 3 — `WalletPage` Code Review & Refactor

The original component mixes correctness bugs, broken types, and unnecessary re-computation. The list below walks through each issue, grouped by severity.

---

## Bugs (correctness, runtime)

### 1. `lhsPriority` is undefined inside `filter`

**What's wrong**

```ts
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) {     // <- lhsPriority is never declared
```

**Why it's a problem** — `lhsPriority` is not a variable in scope. In strict mode / TypeScript this is a compile error; at runtime in plain JS it would throw `ReferenceError`. The author clearly meant the variable they just assigned on the previous line.

**Fix** — Reference `balancePriority` (or, in the refactor, inline the call: `getPriority(balance.blockchain) > DEFAULT_PRIORITY`).

---

### 2. Filter keeps the wrong balances (`amount <= 0`)

**What's wrong**

```ts
if (lhsPriority > -99) {
  if (balance.amount <= 0) {
    return true;
  }
}
return false;
```

**Why it's a problem** — As written, only balances with **non-positive** amounts are kept. A wallet UI almost certainly wants to show holdings the user actually has — i.e. positive amounts. This is the opposite of the intended behaviour.

**Fix** — Use `balance.amount > 0`. (Judgement call documented here: the refactor assumes the goal is "show wallets that contain something" because the list feeds into `usdValue` rows; if the product spec really wanted zero/negative balances surfaced, this becomes a one-liner change.)

---

### 3. Sort comparator has no return value for the equal case

**What's wrong**

```ts
.sort((lhs, rhs) => {
  if (leftPriority > rightPriority) return -1;
  else if (rightPriority > leftPriority) return 1;
  // implicit `return undefined` when equal
});
```

**Why it's a problem** — `Array.prototype.sort` requires the comparator to return a number. Returning `undefined` produces engine-defined behaviour and a TypeScript error (`Type 'undefined' is not assignable to type 'number'`). Equal-priority pairs may swap unpredictably.

**Fix** — Single subtraction: `getPriority(rhs.blockchain) - getPriority(lhs.blockchain)` returns `0` for the equal case, negative when `rhs` is higher (sorts `rhs` first → descending), positive otherwise.

---

### 4. `formattedBalances` is dead code — rows use `sortedBalances`

**What's wrong**

```ts
const formattedBalances = sortedBalances.map((balance) => ({
  ...balance,
  formatted: balance.amount.toFixed(),
}));

const rows = sortedBalances.map((balance: FormattedWalletBalance, index) => {
  // ...
  formattedAmount={balance.formatted}   // <- doesn't exist on WalletBalance
});
```

**Why it's a problem** — `formattedBalances` is computed and then thrown away. The JSX map iterates over `sortedBalances` (which has no `formatted` field) but reads `balance.formatted`, which will be `undefined` at runtime. The type assertion to `FormattedWalletBalance` hides the bug from the compiler.

**Fix** — Build one `processedBalances` array that carries `formatted` and `usdValue` together, and map over that.

---

### 5. `WalletBalance` is missing `blockchain`

**What's wrong** — `WalletBalance` declares only `currency` and `amount`, but the component reads `balance.blockchain` to compute priority.

**Why it's a problem** — Silent type hole. Either the runtime data actually carries `blockchain` (and the interface lies) or it doesn't (and `getPriority` always returns `-99`). Either way, the type system can't help.

**Fix** — Add `blockchain: Blockchain` to the interface.

---

## Performance (unnecessary work / re-renders)

### 6. `prices` in `useMemo` deps but not used in the memo body

**What's wrong**

```ts
const sortedBalances = useMemo(() => {
  // ... uses balances + getPriority only ...
}, [balances, prices]);
```

**Why it's a problem** — Every time `prices` changes (which, for a live price feed, is often), the filter + sort runs again even though its output cannot have changed. Wasted CPU and a new array reference that forces downstream consumers to re-render.

**Fix** — `[balances]` only. Move the price-dependent work (USD value, formatting) into a separate `useMemo` keyed on `[sortedBalances, prices]`.

---

### 7. `getPriority` is redefined on every render

**What's wrong** — `getPriority` is declared inside the component body.

**Why it's a problem** — A new function object is allocated on every render. More importantly, if `getPriority` ever gets passed to a memoised child or used as a `useCallback`/`useMemo` dependency, its identity changes invalidate caches. The function has no closure dependencies, so there's no reason it has to live in the component.

**Fix** — Hoist to module scope. The refactor goes a step further and replaces the `switch` with a `Record<Blockchain, number>` lookup, which is both faster (O(1) hash, no branching) and more declarative.

---

### 8. Filter + sort + format + map could share one pass

Minor: the refactor splits work into two memos by *dependency*, not by iteration cost. For small lists this doesn't matter; flagging it so reviewers know it was a deliberate clarity-over-microopt choice.

---

## Type safety

### 9. `getPriority(blockchain: any)`

**What's wrong** — `any` accepts anything.

**Why it's a problem** — Calling `getPriority('Bitcoin')` or `getPriority(undefined)` silently returns `-99` instead of being a compile error. The set of supported chains is finite and known.

**Fix** — Define a `Blockchain` union and type the parameter as `Blockchain`. The lookup map then enforces exhaustiveness.

---

### 10. `rows` casts `WalletBalance` to `FormattedWalletBalance`

**What's wrong**

```ts
const rows = sortedBalances.map((balance: FormattedWalletBalance, index) => ...)
```

**Why it's a problem** — The annotation on the callback parameter is a *type assertion in disguise*: `sortedBalances` items are `WalletBalance`, not `FormattedWalletBalance`. TypeScript trusts you and the bug from issue #4 goes unnoticed.

**Fix** — Don't annotate; let inference do its job. After consolidating into `processedBalances: FormattedWalletBalance[]`, the type is correct without an assertion.

---

### 11. Array `index` as React `key`

**What's wrong**

```tsx
<WalletRow key={index} ... />
```

**Why it's a problem** — The list is sorted (and could be re-sorted whenever priorities or balances change). When the order changes, React reuses the wrong DOM nodes, causing animation jank, lost focus, and stale internal state in child components.

**Fix** — Use `balance.currency` (assumed unique per wallet row). If multiple rows could share a currency across chains, use `${blockchain}:${currency}`.

---

## Style / maintainability

### 12. `React.FC<Props>` + redundant `props: Props` annotation

**What's wrong** — `const WalletPage: React.FC<Props> = (props: Props) => { ... }` annotates the parameter twice. Also, `React.FC` is generally discouraged in modern React because it implicitly adds `children` even when the component doesn't render them, and its generic ergonomics are awkward.

**Fix** — Either drop `React.FC` and use a plain function signature, or keep `React.FC` and remove the redundant `props: Props`. The refactor keeps `React.FC` for familiarity but destructures in the parameter list to avoid the double annotation.

---

### 13. Empty `interface Props extends BoxProps {}`

**What's wrong**

```ts
interface Props extends BoxProps {}
```

**Why it's a problem** — Empty interface extending a single base is a common ESLint warning (`@typescript-eslint/no-empty-interface`). It conveys no information beyond the alias.

**Fix** — `type Props = BoxProps`.

---

### 14. `children` destructured but never rendered

Minor: `const { children, ...rest } = props` pulls `children` out and then drops it. The refactor renders `{children}` inside the `Box` so the prop isn't silently swallowed.

---

## Refactor summary

Key changes in [`WalletPage.tsx`](./WalletPage.tsx):

- Replaced `switch` + `getPriority` redeclaration with a module-scope `Record<Blockchain, number>` lookup.
- Added `blockchain: Blockchain` to `WalletBalance`; introduced a typed `Blockchain` union — removed all `any`.
- Fixed the filter: keeps balances with `amount > 0` and a known blockchain.
- Fixed the sort: single-subtraction comparator that handles the equal case.
- Split memoisation by dependency: `sortedBalances` depends on `balances` only; `processedBalances` (with `formatted` and `usdValue`) depends on `sortedBalances` and `prices`.
- Removed the orphaned `formattedBalances` array and the lying `FormattedWalletBalance` cast.
- Used `balance.currency` as a stable `key`.
- Cleaned up `Props` to a type alias, removed the duplicate `props: Props` annotation, and rendered `children`.

---

## How to read this folder

There's no runnable app here — this problem is a code review exercise. The deliverables are:

- `README.md` (this file) — the analysis. **Main deliverable; most points live here.**
- `WalletPage.tsx` — a reference refactor that fixes every issue above. It is intentionally not wired into a build; the external symbols (`BoxProps`, `useWalletBalances`, `usePrices`, `WalletRow`, `classes`) are assumed to come from the host application and would resolve in the real codebase.
