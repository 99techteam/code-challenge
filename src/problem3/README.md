# Problem 3: Refactoring Explanation

1. ** Code Organization & Readability
- Move helper functions outside the component `getPriority`, prevent re-created on every render, or use useCallback hook for memorization.
- Separate concerns: Filtering, sorting, and formatting should be clearly separated.
- Consistent naming: Use clear, descriptive names for variables and functions.
- Remove unused variables: formattedBalances is created but not used in rendering.
- The naming should be more meaningful as `Props` to `WalletPageProps`

2. ** Logic Issues
- Filtering logic is confusing and buggy:
- `lhsPriority` is not defined in the filter callback.
- `[balances, prices]`, unused `prices` dependency.
- The filter always returns false unless `balance.amount <= 0`, which is likely not intended.
- Sorting logic: The sort function is improved more simpler.
- Key for rows: Use a unique key (like balance.currency) instead of `index`.

3. ** Type Safety
- Avoid using `any` for blockchain in `getPriority`.

4. ** Formatting
- Use `amount.toFixed(2)` or similar for consistent formatting.