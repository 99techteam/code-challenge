# Problem 3: Messy React - Code Analysis and Refactoring

## Issues Found in Original Code

### 1. Type Safety Issues

**Issue:** Missing `blockchain` property in `WalletBalance` interface
```typescript
interface WalletBalance {
  currency: string;
  amount: number;
  // Missing: blockchain property
}
```

**Issue:** `getPriority` accepts `any` type instead of proper typing
```typescript
const getPriority = (blockchain: any): number => {
  // Should use string or union type
}
```

**Issue:** Undefined variable `lhsPriority` used in filter
```typescript
if (lhsPriority > -99) { // lhsPriority is never defined!
```

### 2. Logic Errors

**Issue:** Inverted filter logic - keeps balances with amount <= 0
```typescript
if (balance.amount <= 0) {
  return true; // This keeps zero/negative balances!
}
return false; // This filters out positive balances!
```
**Fix:** Should return `true` for positive amounts and valid priorities.

**Issue:** Filter condition doesn't make sense
- The code checks if priority > -99, but then checks if amount <= 0
- This means it only keeps balances with invalid amounts

### 3. Performance Issues

**Issue:** `prices` in dependency array but not used in computation
```typescript
useMemo(() => {
  return balances.filter(...).sort(...);
}, [balances, prices]); // prices not used, causes unnecessary re-computation
```

**Issue:** `formattedBalances` computed but never used
```typescript
const formattedBalances = sortedBalances.map(...) // Created but never used
const rows = sortedBalances.map(...) // Uses sortedBalances instead
```

**Issue:** Iterating over data twice unnecessarily
- First map to create `formattedBalances`
- Second map to create `rows`
- Could be combined into single operation

### 4. Anti-patterns

**Issue:** Using array index as React key
```typescript
<WalletRow key={index} /> // Index is unstable and can cause rendering issues
```
**Fix:** Should use unique identifier like `balance.currency` or combination of properties.

**Issue:** Function defined inside component
```typescript
const WalletPage: React.FC<Props> = (props: Props) => {
  const getPriority = (blockchain: any): number => { // Recreated on every render
```
**Fix:** Move outside component or memoize with useCallback.

**Issue:** Incomplete sort logic
```typescript
if (leftPriority > rightPriority) {
  return -1;
} else if (rightPriority > leftPriority) {
  return 1;
}
// Missing return statement for when priorities are equal!
```

### 5. Code Quality Issues

**Issue:** Inconsistent formatting and spacing
**Issue:** Missing return value in sort when priorities are equal
**Issue:** Unnecessary Props type extension when BoxProps would suffice
**Issue:** Redundant props type annotation `(props: Props)` when already declared in FC generic

---

## Refactored Code

```typescript
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {}

// Move outside component to avoid recreation on every render
const getPriority = (blockchain: string): number => {
  switch (blockchain) {
    case 'Osmosis':
      return 100;
    case 'Ethereum':
      return 50;
    case 'Arbitrum':
      return 30;
    case 'Zilliqa':
    case 'Neo':
      return 20;
    default:
      return -99;
  }
};

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // Keep only positive balances with valid priority
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        // Sort descending by priority
        return rightPriority - leftPriority;
      });
  }, [balances]); // Removed prices from dependencies as it's not used here

  const rows = useMemo(
    () =>
      sortedBalances.map((balance: WalletBalance) => {
        const usdValue = prices[balance.currency] * balance.amount;
        const formattedAmount = balance.amount.toFixed(2);

        return (
          <WalletRow
            className={classes.row}
            key={balance.currency} // Use unique identifier instead of index
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={formattedAmount}
          />
        );
      }),
    [sortedBalances, prices] // Now prices is correctly included
  );

  return <div {...rest}>{rows}</div>;
};
```

---

## Key Improvements

### 1. **Fixed Type Safety**
- Added `blockchain` property to `WalletBalance`
- Changed `getPriority` parameter from `any` to `string`
- Extended `FormattedWalletBalance` from `WalletBalance` for better type inheritance

### 2. **Corrected Logic**
- Fixed filter to keep balances with `amount > 0` and `priority > -99`
- Removed undefined `lhsPriority` variable
- Fixed sort to return proper value when priorities are equal (using subtraction)

### 3. **Performance Optimizations**
- Removed `prices` from first `useMemo` dependencies (not used)
- Eliminated unused `formattedBalances` variable
- Combined formatting and row creation into single memoized operation
- Moved `getPriority` outside component to avoid recreation
- Added `useMemo` for rows computation with correct dependencies

### 4. **Best Practices**
- Use unique `balance.currency` as key instead of array index
- Destructure props directly in function parameters
- Simplified sort comparator using subtraction
- Combined duplicate priority values (Zilliqa and Neo)
- Consistent code formatting

### 5. **Memory & Efficiency**
- Single iteration instead of two (removed redundant map)
- Proper memoization with correct dependencies
- No function recreation on every render

---

## Summary of Changes

| Issue | Original | Refactored |
|-------|----------|------------|
| Filter logic | Keeps amount <= 0 | Keeps amount > 0 |
| Undefined variable | lhsPriority | Removed |
| useMemo deps | [balances, prices] | [balances] for filter/sort |
| Iterations | 2 maps (formattedBalances + rows) | 1 map (rows only) |
| Key prop | index | balance.currency |
| getPriority location | Inside component | Outside component |
| Sort return | Incomplete | Complete with subtraction |
| Type safety | any, missing props | Proper types |

**Performance Impact:** 
- Reduced unnecessary re-renders by fixing dependencies
- Eliminated one full iteration over the array
- Prevented function recreation on every render
