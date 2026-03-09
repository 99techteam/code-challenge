# Problem 3: WalletPage — Computational Inefficiencies & Anti-Patterns

## 1. Issues and How to Improve

### 1.1 Bug: Wrong variable in filter (`lhsPriority`)

**Issue:** In the filter callback, the code checks `if (lhsPriority > -99)` but `lhsPriority` is never defined in that scope. The variable that was computed is `balancePriority`.

**Impact:** Either a ReferenceError at runtime or (if `lhsPriority` exists elsewhere) incorrect filtering.

**Fix:** Use `balancePriority` instead of `lhsPriority` in the condition.

---

### 1.2 Bug: Inverted / unclear filter logic

**Issue:** The filter returns `true` when `balance.amount <= 0`, so only zero or negative balances are kept. Typically we want to show balances that are meaningful (e.g. positive, or at least not negative). The condition is also nested incorrectly: we only consider amount when priority > -99, which keeps zero/negative balances for known blockchains.

**Impact:** Wrong set of balances is displayed (likely only empty/negative ones).

**Fix:** Clarify requirements. Usually we want to **exclude** zero/negative balances: return `false` when `balance.amount <= 0`, and keep balances with `balancePriority > -99` (or whatever product rule is). Example: `return balancePriority > -99 && balance.amount > 0;`

---

### 1.3 Missing `blockchain` on `WalletBalance`

**Issue:** The code uses `balance.blockchain` but the interface `WalletBalance` only has `currency` and `amount`. TypeScript would error and runtime could be undefined.

**Fix:** Add `blockchain` to the `WalletBalance` interface and use a union type instead of `any` for the `getPriority` argument (see type safety below).

---

### 1.4 Unnecessary dependency in `useMemo` (`prices`)

**Issue:** `sortedBalances` is memoized with dependency array `[balances, prices]`. The memoized value does not use `prices` at all. When `prices` changes, the filter/sort runs again for no reason.

**Impact:** Extra work on every price update, more re-renders, worse performance.

**Fix:** Remove `prices` from the dependency array: `[balances]`.

---

### 1.5 Incomplete sort comparator (missing `return 0`)

**Issue:** The sort callback returns `-1` or `1` but does not return `0` when `leftPriority === rightPriority`. In that case the function returns `undefined`, which can lead to unstable sort order and harder-to-reason-about behavior.

**Fix:** Add `return 0` when priorities are equal:
`if (leftPriority > rightPriority) return -1; if (rightPriority > leftPriority) return 1; return 0;`

---

### 1.6 Dead code and wrong data source for rows

**Issue:**  
- `formattedBalances` is computed (map that adds `formatted`) but never used.  
- `rows` are built from `sortedBalances`, which is `WalletBalance[]` and has no `formatted` property. The code then uses `balance.formatted` in `WalletRow`, which would be undefined.

**Impact:** Formatted amounts are wrong/undefined; unnecessary array allocation every render.

**Fix:** Use `formattedBalances` when rendering rows, and derive rows from it. Optionally combine formatting with the same `useMemo` that produces sorted data to avoid two passes (see refactor).

---

### 1.7 Using array index as `key`

**Issue:** `key={index}` is used for list items. When the list is sorted/filtered, indices change and React can reuse the wrong component instance, leading to bugs and unnecessary DOM updates.

**Fix:** Use a stable key, e.g. `key={balance.currency}` or `key={`${balance.currency}-${balance.blockchain}`}` if currency can repeat per chain.

---

### 1.8 `getPriority` recreated every render

**Issue:** `getPriority` is defined inside the component, so a new function is created on every render. It doesn’t depend on props/state.

**Impact:** Minor CPU and memory churn; if passed to children or used in deps, can break memoization.

**Fix:** Move `getPriority` outside the component (or to a utils file). It becomes a pure function and is not recreated.

---

### 1.9 Type safety: `any` for blockchain

**Issue:** `getPriority(blockchain: any)` violates the project rule “Avoid `any`” and loses type safety.

**Fix:** Define a union type, e.g.  
`type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';`  
and use it in `WalletBalance.blockchain` and in `getPriority(blockchain: Blockchain)`.

---

### 1.10 Empty/redundant `Props` interface

**Issue:** `interface Props extends BoxProps {}` adds no members. It’s redundant.

**Fix:** Use `BoxProps` directly as the component props type, or extend it only when you add specific props (e.g. `children`).

---

### 1.11 Heavy logic inside the component

**Issue:** Filtering, sorting, and formatting are done directly in the component. Rules say: “Business logic must not live in UI components” and “Shared logic goes to hooks”.

**Impact:** Harder to test, reuse, and keep the component readable.

**Fix:** Move “get filtered & sorted formatted balances” into a custom hook (e.g. `useSortedFormattedBalances(balances)`) or to a pure function in `utils`. The component only consumes the result and renders.

---

### 1.12 No error handling

**Issue:** `useWalletBalances()` and `usePrices()` are used with no loading/error handling. Rules: “Never ignore errors”, “Provide safe fallbacks”.

**Fix:** Use error/loading states from the hooks and render loading UI or error boundaries and fallbacks (e.g. empty list, error message).

---

### 1.13 Unused variable / missing definition

**Issue:** `children` is destructured from `props` but never used. `classes.row` is used but `classes` is not defined in the snippet (likely from `makeStyles` or similar).

**Fix:** Remove `children` if not needed, or use it in the JSX. Ensure `classes` is defined (e.g. from theme or CSS module) or replace with a string class name.

---

### 1.14 Memoization of derived list for rows

**Issue:** `formattedBalances` and `rows` are recomputed on every render. For larger lists this is unnecessary work when only `balances` or `prices` change.

**Fix:** Use `useMemo` for the data that feeds the rows (e.g. formatted balances) with correct dependencies (`balances`, and `prices` only where needed for USD value). Optionally memoize row list or use `React.memo` on `WalletRow` for list performance.

---

## 2. Summary Table

| # | Category        | Issue                                      | Fix |
|---|-----------------|--------------------------------------------|-----|
| 1 | Bug             | Wrong variable `lhsPriority` in filter     | Use `balancePriority` |
| 2 | Bug             | Filter keeps zero/negative balances        | Keep positive (or clarify rule) |
| 3 | Type / data     | `WalletBalance` missing `blockchain`       | Add `blockchain` to interface |
| 4 | Performance     | `prices` in useMemo deps unnecessarily     | Remove `prices` from deps |
| 5 | Correctness     | Sort comparator doesn’t return 0           | Return 0 when equal |
| 6 | Bug / dead code | `formattedBalances` unused; rows use wrong source | Use `formattedBalances` for rows |
| 7 | Anti-pattern    | `key={index}`                              | Stable key (e.g. `currency`) |
| 8 | Performance     | `getPriority` recreated every render       | Move outside component |
| 9 | Type safety     | `any` for blockchain                       | Use union type |
| 10| Code quality    | Empty Props interface                      | Use BoxProps or extend meaningfully |
| 11| Architecture    | Business logic in UI component             | Move to hook or utils |
| 12| Robustness      | No error/loading handling                  | Add error/loading states and fallbacks |
| 13| Clean code      | Unused `children`; undefined `classes`     | Remove or use; define classes |
| 14| Performance     | No memo for formatted/row data             | useMemo with correct deps |

---

## 3. Refactored Code

See the refactored implementation in:

- `src/types/wallet.ts` — types and blockchain priority
- `src/utils/walletBalance.ts` — pure helpers (priority, filter, sort, format)
- `src/hooks/useSortedFormattedBalances.ts` — hook that encapsulates logic
- `src/components/WalletPage.tsx` — UI-only component

This follows **rules.md**: separation of concerns, no `any`, reusable types, logic in hooks/utils, performance (memoization, stable keys), and room for error handling.
