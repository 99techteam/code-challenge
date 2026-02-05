# Problem 3: React TypeScript Code Analysis

## Computational Inefficiencies and Anti-patterns Found

### 1. **Critical Logic Error**
- **Line 22**: `lhsPriority` is undefined but should be `balancePriority`
- **Line 23**: Filter logic is inverted - returns balances with amount ≤ 0, which are typically unwanted

### 2. **Missing Dependencies in useMemo**
- `getPriority` function is not memoized but used inside `useMemo`
- This causes the dependency array to be incomplete, potentially causing stale closures

### 3. **Inefficient Data Processing**
- `formattedBalances` is computed but never used
- `rows` processes `sortedBalances` instead of `formattedBalances`, missing the formatted data
- Type mismatch: `sortedBalances` contains `WalletBalance` but `rows` expects `FormattedWalletBalance`

### 4. **Performance Issues**
- `getPriority` function recreated on every render
- Missing `prices` dependency usage in the filter/sort logic
- Inefficient array operations (filter + sort + map could be optimized)

### 5. **Type Safety Issues**
- `blockchain` parameter typed as `any` instead of proper string union
- Missing `blockchain` property in `WalletBalance` interface
- Empty `Props` interface extending `BoxProps`

### 6. **Anti-patterns**
- Using array index as React key instead of unique identifier
- Unused `children` destructuring
- Missing error handling for undefined prices

## Key Improvements Made

1. **Fixed logic errors** and undefined variable references
2. **Memoized `getPriority`** with `useCallback` to prevent unnecessary re-renders
3. **Proper dependency arrays** in `useMemo` hooks
4. **Combined operations** into single efficient chain
5. **Added type safety** with proper interfaces and null checks
6. **Used meaningful keys** instead of array indices
7. **Eliminated unused computations** and variables
8. **Added error handling** for missing price data

These changes significantly improve performance, maintainability, and correctness of the component.