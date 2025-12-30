# Refactoring Report: Messy React

This document outlines the issues identified in the original code snippet and explains the architectural decisions made during the refactoring process to ensure type safety, performance, and maintainability.

## 1. Critical Issues & Logic Bugs

These issues caused runtime errors or incorrect business logic behavior.

- **ReferenceError (`lhsPriority`):** The variable `lhsPriority` was used inside the `filter` function but was never defined. This would cause the application to crash immediately.
  - _Fix:_ Corrected to use the calculated `balancePriority`.
- **Incorrect Filtering Logic:** The original code filtered for `balance.amount <= 0`, effectively hiding all wallets with positive balances.
  - _Fix:_ Inverted the logic to `balance.amount > 0` (assuming the goal is to show wallets with funds).
- **Type Mismatch:** The `WalletBalance` interface was missing the `blockchain` property, causing TypeScript errors when accessing `balance.blockchain`.
  - _Fix:_ Updated the interface to include `blockchain` typed as a Union Type.

## 2. Performance Optimizations

Improvements made to reduce unnecessary re-renders and computational load.

- **Unnecessary Dependencies in `useMemo`:** The `prices` object was included in the dependency array for `sortedBalances`. This caused the heavy sorting logic to re-run every time prices updated, even if the wallet list hadn't changed.
  - _Fix:_ Removed `prices` from the dependency array. Sorting now only depends on `balances`.
- **Inefficient Priority Lookup:** The `getPriority` function was defined inside the component (re-created on every render) and used a `switch-case` statement.
  - _Fix:_ Extracted priority logic into a static configuration object (`BLOCKCHAIN_PRIORITIES`) outside the component. This allows for O(1) lookup complexity and prevents garbage collection overhead.
- **Unused Computations:** The `formattedBalances` array was mapped but never used in the render, wasting CPU cycles.
  - _Fix:_ Removed the intermediate `formattedBalances` array. Formatting is now done lazily during the row rendering phase.

## 3. Code Quality & Best Practices

Refactoring steps taken to adhere to React patterns and Clean Code principles.

- **React Keys Anti-pattern:** The original code used the array `index` as the `key` for list items. This hurts performance during reconciliation and can cause bugs if the list order changes.
  - _Fix:_ Used `balance.currency` as a stable, unique key.
- **Unstable Sort Implementation:** The sort comparator did not return `0` when values were equal, which can lead to unpredictable sorting behavior in some browsers.
  - _Fix:_ Added proper handling for equal priorities to ensure a stable sort.
- **Magic Strings:** Blockchain names were hardcoded strings, prone to typos.
  - _Fix:_ Defined a `BlockchainType` union type to enforce strict typing for blockchain names.

## 4. Architecture & Structure

Instead of a single monolithic file, the code has been modularized to follow "Separation of Concerns":

```text
src/
├── components/
│   ├── WalletPage.tsx       # Main Container Component
│   └── WalletRow.tsx        # Presentational Component (Pure)
├── hooks/
│   ├── useWalletBalances.ts # Data fetching hook
│   └── usePrices.ts         # Price subscription hook
├── types/
│   └── index.ts             # Shared TypeScript definitions
└── utils/
    └── blockchain.ts        # Business logic & Helper functions
```
