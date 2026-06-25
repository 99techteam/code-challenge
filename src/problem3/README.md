# Problem 3 — Messy React: Issues & Refactor

The code in `request.md` contains a mix of outright bugs and subtler design problems.
Below is a numbered list from most to least severe, followed by the refactored file
(`WalletPage.tsx`).

---

## Issues

### 1. `lhsPriority` is not defined — runtime crash

Inside the `.filter()` callback, the code declares `balancePriority` but then checks
`lhsPriority > -99`. `lhsPriority` is never defined in this scope, so JavaScript throws
a `ReferenceError` the first time the filter runs, crashing the component.

**Fix:** replace `lhsPriority` with `balancePriority`.

---

### 2. Filter logic is inverted — wrong balances are kept

Even after fixing issue 1, the filter keeps balances whose `amount <= 0` (zero or
negative). The clear intent — show balances that actually have holdings — is the
opposite: keep balances where `amount > 0`.

**Fix:** change `balance.amount <= 0` to `balance.amount > 0`.

---

### 3. `WalletBalance` interface is missing the `blockchain` field

`getPriority(balance.blockchain)` is called, but `blockchain` is not declared in
`WalletBalance`. TypeScript will surface a type error, and at runtime every balance
falls into the `default: return -99` branch, making the priority sort a no-op.

**Fix:** add `blockchain: string` (or a typed union) to `WalletBalance`.

---

### 4. `getPriority` is re-created on every render

The function is defined inside the component body without `useCallback`, so React
allocates a new closure on every render. Worse, because it's used inside the
`useMemo` callback that lists it as an implicit dependency (via the closure), any
change that triggers a re-render will also invalidate the memo.

**Fix:** move `getPriority` outside the component. It has no dependencies on props
or state, so it belongs at module scope.

---

### 5. `blockchain: any` discards type safety

Typing the parameter as `any` silences TypeScript and allows callers to pass
anything without a compile-time error.

**Fix:** define a `Blockchain` union type and use it as the parameter type.
This also makes the `switch` exhaustive and easier to extend.

---

### 6. `prices` in `useMemo` dependencies but never used in the computation

`prices` appears in the deps array of the `useMemo` that computes `sortedBalances`,
but the filter and sort do not reference `prices` at all. Every time the price map
updates (which could be frequent in a live app), the entire sort runs again for
no reason.

**Fix:** remove `prices` from the `useMemo` dependency array.

---

### 7. Sort comparator returns `undefined` for equal priorities

When `leftPriority === rightPriority` the comparator falls off the end and
implicitly returns `undefined`. The JS engine coerces this to `0`, so it
happens to work, but it is an implicit behaviour that violates the `Array.sort`
contract (comparator must return a number) and will be flagged by linters.

**Fix:** simplify the whole comparator to `return rightPriority - leftPriority`.

---

### 8. `rows` maps over `sortedBalances` but casts elements to `FormattedWalletBalance`

`formattedBalances` is computed (with the `.formatted` field), but `rows` maps over
`sortedBalances` — the unformatted list — while TypeScript is told each element is
a `FormattedWalletBalance`. At runtime `balance.formatted` is `undefined`, so the
`formattedAmount` prop passed to `WalletRow` is always `undefined`.

**Fix:** map `rows` over `formattedBalances`, not `sortedBalances`.

---

### 9. `formattedBalances` is recomputed on every render without memoisation

Unlike `sortedBalances`, `formattedBalances` is a plain `.map()` call that runs on
every render even when `sortedBalances` hasn't changed. For a large balance list this
is unnecessary work.

**Fix:** wrap `formattedBalances` in its own `useMemo([sortedBalances])`.

---

### 10. Array index used as React `key`

Using the array position as `key` means React can't track individual balance rows
across re-renders when the sort order changes. This can cause stale state inside
children, missed animations, and poor reconciliation performance.

**Fix:** use a stable, unique identifier — `balance.currency` works if currencies
are unique per wallet, or `${balance.blockchain}-${balance.currency}` if not.

---

### 11. `prices[balance.currency]` is unguarded

If `prices` doesn't have an entry for a given currency, the multiplication yields
`NaN`, which would display as "NaN" in the UI.

**Fix:** guard with `?? 0` (or skip the row) to produce a defined value.

---

### 12. `toFixed()` called without a precision argument

`Number.prototype.toFixed()` with no argument rounds to 0 decimal places
(`(1.75).toFixed()` → `"2"`). Financial amounts typically need 2–6 decimal places.

**Fix:** pass an explicit precision, e.g. `toFixed(2)`.

---

### 13. `children` is destructured but never rendered

`const { children, ...rest } = props;` pulls `children` out but it is never used.
This is dead code that misleads readers into thinking children matter here.

**Fix:** either render `{children}` if it is actually needed, or remove it from the
destructuring.

---

## Refactored code

See [`WalletPage.tsx`](./WalletPage.tsx).

Key changes from the original:
- All bugs above are fixed.
- `getPriority` is hoisted to module scope with a typed `Blockchain` union.
- A single `useMemo` produces `formattedBalances` directly (filter → sort → map),
  removing the separate un-memoised `formattedBalances` variable.
- `rows` maps over that memoised result and uses a stable key.
- `usdValue` is guarded against missing price entries.
