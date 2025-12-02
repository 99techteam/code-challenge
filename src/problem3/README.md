# Problem 3 – WalletPage Code Review

## Inefficiencies & Anti-Patterns

1. **Broken filter logic** – `lhsPriority` is referenced but never declared, so the code crashes before rendering. Even if it existed, the filter keeps balances with `amount <= 0` and discards positive ones, which contradicts the goal of showing wallets with value.
2. **Missing data in types** – `WalletBalance` lacks a `blockchain` field although every helper reads `balance.blockchain`. TypeScript cannot catch issues if the interface is wrong, and additional properties are accessed unsafely later (`balance.formatted` before it exists).
3. **Dead computation** – `formattedBalances` is calculated then never used; rendering still maps `sortedBalances`. This wastes cycles and increases confusion about the intended data flow.
4. **Priority helper instability** – `getPriority` is defined inside the component with the parameter typed as `any`. A new function instance is created every render, so `useMemo` dependencies are unstable and the `any` typing hides mistakes.
5. **Misconfigured memoization** – The `useMemo` for `sortedBalances` depends on `prices` even though it never uses them, and because `getPriority` is recreated every render, the memo never actually caches results.
6. **Invalid sort comparator** – The comparator never returns `0` for equal priorities, leaving ordering to engine quirks. Combined with the incorrect filter this produces unpredictable output.
7. **Unstable list keys** – `<WalletRow key={index}>` causes unnecessary re-renders when balances reorder. Each wallet has a natural stable key (e.g., `currency`).
8. **Formatting ambiguity** – `toFixed()` is invoked without a precision argument, which defaults to zero decimal places—likely unacceptable for token balances.

## Improvements Implemented

- Added explicit `blockchain` typing and a `PRIORITY` lookup declared outside the component so helper references stay stable.
- Corrected the filter to keep only supported blockchains with positive amounts.
- Simplified sorting to a single subtraction expression that always returns a numeric result.
- Removed the unused `formattedBalances` array and integrated formatting logic directly in the render loop.
- Updated memo dependencies to match actual inputs (`balances` and `prices`).
- Used stable `balance.currency` as the React key and formatted USD values defensively.
- Provided an explicit decimal precision when formatting token amounts.

See `WalletPage.tsx` in this folder for the refactored implementation.
