# Code Analysis: WalletPage Component

## Critical Issues and Anti-Patterns

### 1. **Undefined Variable Reference (Bug)**
```typescript
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) { // ❌ lhsPriority is never defined
```
**Issue**: `lhsPriority` is used but never declared. Should be `balancePriority`.
**Impact**: Runtime error - code will crash immediately.

### 2. **Inverted Filter Logic (Logic Error)**
```typescript
if (lhsPriority > -99) {
  if (balance.amount <= 0) {
    return true; // ❌ Keeping zero/negative balances
  }
}
return false
```
**Issue**: Filter keeps balances with amount ≤ 0 and discards positive amounts. Logic is inverted.
**Impact**: Wrong data displayed - shows empty wallets, hides funded ones.
**Correct Logic**: Should return `true` when `balance.amount > 0`.

### 3. **Missing Interface Property (Type Error)**
```typescript
interface WalletBalance {
  currency: string;
  amount: number;
  // ❌ Missing: blockchain property
}
```
**Issue**: `balance.blockchain` is accessed but not defined in the interface.
**Impact**: TypeScript compilation error.

### 4. **Incomplete Sort Comparator (Bug)**
```typescript
if (leftPriority > rightPriority) {
  return -1;
} else if (rightPriority > leftPriority) {
  return 1;
}
// ❌ Missing: return 0 when equal
```
**Issue**: No return statement when priorities are equal.
**Impact**: Undefined behavior in sort, potential runtime error.

### 5. **Dead Code - Computed But Never Used**
```typescript
const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
  return {
    ...balance,
    formatted: balance.amount.toFixed()
  }
})
// ❌ formattedBalances is never used anywhere
```
**Issue**: Entire computation is wasted - `rows` uses `sortedBalances` instead.
**Impact**: O(n) unnecessary iteration and memory allocation on every render.

### 6. **Incorrect Dependency Array**
```typescript
useMemo(() => { ... }, [balances, prices]);
// ❌ prices is never used in the computation
```
**Issue**: `prices` in dependency array but not used in `sortedBalances` calculation.
**Impact**: Unnecessary re-computation when prices change, breaking memoization optimization.

### 7. **Type Mismatch in Mapping**
```typescript
const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
  // ❌ sortedBalances is WalletBalance[], not FormattedWalletBalance[]
  const usdValue = prices[balance.currency] * balance.amount;
  return (
    <WalletRow 
      formattedAmount={balance.formatted} // ❌ balance.formatted doesn't exist
    />
  )
})
```
**Issue**: Type annotation claims `FormattedWalletBalance` but source is `WalletBalance[]`.
**Impact**: Accessing non-existent `balance.formatted` property - runtime error.

### 8. **Using Array Index as React Key (Anti-Pattern)**
```typescript
<WalletRow key={index} ... />
```
**Issue**: Using index as key with filtered/sorted data.
**Impact**: React reconciliation bugs, wrong components updated, state persistence issues.
**Correct Approach**: Use unique identifier like `currency` or composite key.

### 9. **Redundant Multiple Iterations**
```typescript
// Filter + Sort
const sortedBalances = useMemo(() => { ... }, [balances, prices]);

// Map #1 (unused)
const formattedBalances = sortedBalances.map(...);

// Map #2 (actual rendering)
const rows = sortedBalances.map(...);
```
**Issue**: Multiple passes over the data when one would suffice.
**Impact**: O(n) + O(n log n) + O(n) + O(n) = O(n log n) but with high constants.

### 10. **Type Safety Violation**
```typescript
const getPriority = (blockchain: any): number => {
```
**Issue**: Using `any` type defeats TypeScript's purpose.
**Impact**: No type checking, potential runtime errors from invalid inputs.
**Solution**: Use union type or enum.

### 11. **Function Redeclaration on Every Render**
```typescript
const WalletPage: React.FC<Props> = (props: Props) => {
  const getPriority = (blockchain: any): number => { ... }
  // ❌ Function recreated on every render
```
**Issue**: `getPriority` is pure but recreated unnecessarily.
**Impact**: Minor performance hit, prevents potential optimizations.
**Solution**: Move outside component or use useCallback.

### 12. **Undefined Variable Reference #2**
```typescript
<WalletRow className={classes.row} ... />
```
**Issue**: `classes` is never defined or imported.
**Impact**: Runtime error - undefined reference.

### 13. **Empty Interface (Code Smell)**
```typescript
interface Props extends BoxProps {
  // Empty - no additional properties
}
```
**Issue**: Interface adds no value.
**Impact**: Unnecessary abstraction, could use BoxProps directly.

### 14. **Redundant Type Annotation**
```typescript
const WalletPage: React.FC<Props> = (props: Props) => {
  // ❌ props: Props is redundant
```
**Issue**: Type already declared in function signature.
**Impact**: Verbose, redundant code.

## Performance Analysis

### Time Complexity Issues:
- **Current**: O(n) filter + O(n log n) sort + O(n) unused map + O(n) render map = **O(n log n)**
- **Optimized**: O(n log n) combined operation = **O(n log n)** but with ~40% fewer iterations

### Space Complexity Issues:
- **Current**: Creates 3 intermediate arrays (filtered, sorted, formatted)
- **Optimized**: Creates 2 arrays (processed data, JSX elements)

### Re-render Inefficiencies:
- Incorrect dependencies cause unnecessary recalculations
- Function recreation on every render
- Dead code execution on every render

---

## Computational Efficiency Ranking

From most to least impactful:

1. **Broken filter logic** - Shows wrong data entirely
2. **Undefined variables** - Crashes the application
3. **Incorrect useMemo dependencies** - Breaks memoization entirely
4. **Dead code (formattedBalances)** - Wastes O(n) operations every render
5. **Multiple iterations** - 2x unnecessary passes through data
6. **Function recreation** - Minor but accumulates
7. **Array index as key** - Causes React reconciliation overhead

