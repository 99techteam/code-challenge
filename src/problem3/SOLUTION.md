# Problem 3 – Code Review & Refactor

## Issues Found in the Original Code

### 1. Undefined variable `lhsPriority` (Runtime Bug)

Inside the `filter` callback, `balancePriority` is assigned from `getPriority(balance.blockchain)` but the condition checks `lhsPriority > -99`, which is never declared. This throws a `ReferenceError` at runtime, crashing the filter entirely.

**Fix:** Replace `lhsPriority` with `balancePriority`.

---

### 2. `blockchain` missing from `WalletBalance` interface (Type Error)

`WalletBalance` only declares `currency: string` and `amount: number`. The code accesses `balance.blockchain` in both the `filter` and `sort` callbacks, so TypeScript raises a type error and the value is always `undefined` at runtime — causing `getPriority` to always return `-99`.

**Fix:** Add `blockchain: string` to the `WalletBalance` interface.

---

### 3. `getPriority` typed with `any` (Anti-pattern)

The parameter `blockchain: any` disables TypeScript's type checking for that argument, allowing incorrect types to be passed silently.

**Fix:** Type the parameter as `blockchain: string`.

---

### 4. `getPriority` defined inside the component (Performance)

`getPriority` has no dependency on props or state, so it is re-created on every render. Defining it at module scope eliminates the repeated allocation.

**Fix:** Move `getPriority` outside the component function.

---

### 5. `prices` in `useMemo` dependencies but unused inside (Performance)

`prices` is listed in the `useMemo` dependency array but is never read inside the callback. This causes the sorted balances to be recomputed whenever prices update, which is wasteful.

**Fix:** Remove `prices` from the `useMemo` dependency array.

---

### 6. Inverted filter logic (Logic Bug)

The filter returns `true` when `balance.amount <= 0`, keeping zero and negative balances while discarding positive ones — the opposite of what a wallet display requires.

**Fix:** Change the condition to `balance.amount > 0`.

---

### 7. `formattedBalances` computed but never used (Dead Code)

`formattedBalances` is built from `sortedBalances` with a `.formatted` property, but `rows` iterates over `sortedBalances` directly, making `formattedBalances` dead code that wastes an allocation.

**Fix:** Produce `FormattedWalletBalance[]` directly inside the `useMemo` callback (combine sorting/filtering with formatting), then use that single array for `rows`.

---

### 8. `rows` treats `sortedBalances` as `FormattedWalletBalance` (Type + Runtime Bug)

The `rows.map` callback is typed as `(balance: FormattedWalletBalance, ...)` but the source array is `WalletBalance[]`. As a result `balance.formatted` is `undefined` at runtime, so every `WalletRow` receives `undefined` as its `formattedAmount`.

**Fix:** Map over the merged `FormattedWalletBalance[]` produced in `useMemo` so the type matches reality.

---

### 9. Sort comparator returns `undefined` for equal priorities (Correctness)

When `leftPriority === rightPriority` neither `if` branch executes and the comparator returns `undefined` implicitly. The ECMAScript specification requires a comparator to return a number; returning `undefined` produces implementation-defined (and often incorrect) sort order.

**Fix:** Add a final `return 0` for the equal case.

---

### 10. Array `index` used as React `key` (Anti-pattern)

Using the array index as `key` prevents React from correctly identifying list items when their order changes (e.g., after a re-sort). This can cause subtle rendering bugs and unnecessary DOM mutations.

**Fix:** Use `balance.currency` as the key, which is a stable, unique identifier per balance entry.

---

### 11. `children` destructured but never rendered (Unused Variable)

`children` is extracted from `props` but is never placed in the JSX output. Any child elements passed to `WalletPage` are silently discarded.

**Fix:** Render `{children}` inside the root element.
