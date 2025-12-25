# Original Code Issues

This document outlines the original problematic code and all the issues that were identified and fixed.

## Original Code Structure

```typescript
interface WalletBalance {
  currency: string;
  amount: number;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // ISSUE 1: Function defined inside component - recreated on every render
  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case 'Osmosis':
        return 100;
      case 'Ethereum':
        return 50;
      case 'Arbitrum':
        return 30;
      case 'Zilliqa':
        return 20;
      case 'Neo':
        return 20;
      default:
        return -99;
    }
  };

  // ISSUE 2: Typo - lhsPriority is not defined (should be balancePriority)
  // ISSUE 3: Inverted filter logic - keeps balances with amount <= 0
  // ISSUE 6: prices in dependencies but not used in calculation
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        if (lhsPriority > -99) {
          // TYPO: lhsPriority doesn't exist!
          if (balance.amount <= 0) {
            return true; // LOGIC ERROR: Keeps invalid balances!
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        // ISSUE 5: getPriority called multiple times during sort
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
        return 0;
      });
  }, [balances, prices]); // ISSUE 6: prices not needed

  // ISSUE 7: formattedBalances calculated but never used
  const formattedBalances = sortedBalances.map((balance: WalletBalan) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });

  // ISSUE 7: Type mismatch - sortedBalances are WalletBalance, not FormattedWalletBalance
  // ISSUE 8: Using index as key (React anti-pattern)
  const rows = sortedBalances.map((balance: FormattedWalletBalance, index) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={index} // ISSUE 8: Index as key
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted} // ISSUE 7: formatted doesn't exist on WalletBalance!
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};
```

## Summary of All Issues

### 1. Function Recreation (Performance Issue)

**Location:** `getPriority` function inside component  
**Problem:** Function is recreated on every render  
**Impact:** Unnecessary function recreation, potential performance degradation  
**Fix:** Moved to utility module outside component

### 2. TypeScript Anti-pattern

**Location:** `blockchain: any` parameter  
**Problem:** Loses type safety benefits  
**Impact:** Potential runtime errors, no IntelliSense support  
**Fix:** Created proper `Blockchain` union type

### 3. Typo in Variable Name

**Location:** Filter condition `if (lhsPriority > -99)`  
**Problem:** Variable `lhsPriority` is undefined  
**Impact:** Filter condition always fails, logic breaks  
**Fix:** Changed to `balancePriority`

### 4. Inverted Filter Logic

**Location:** Filter return statement  
**Problem:** `if (balance.amount <= 0) return true` keeps invalid balances  
**Impact:** Wrong balances are shown, valid ones filtered out  
**Fix:** Corrected to `return priority > -99 && balance.amount > 0`

### 5. Repeated Function Calls

**Location:** Sort comparison function  
**Problem:** `getPriority` called for every comparison during sort  
**Impact:** Inefficient, but mitigated by moving function outside  
**Fix:** Function now has O(1) lookup using constant object

### 6. Unnecessary Dependency

**Location:** `useMemo` dependency array  
**Problem:** `prices` included but not used in calculation  
**Impact:** Unnecessary recalculations when prices change  
**Fix:** Removed from dependency array

### 7. Type Mismatch and Unused Code

**Location:** `formattedBalances` vs `sortedBalances`  
**Problem:** `formattedBalances` calculated but never used; wrong type used for rendering  
**Impact:** Type errors, wrong data structure used  
**Fix:** Use `formattedBalances` for rendering instead of `sortedBalances`

### 8. React Key Anti-pattern

**Location:** `map` function using `index` as key  
**Problem:** Array index as key causes React rendering issues  
**Impact:** Incorrect component updates when list changes  
**Fix:** Use composite key `${currency}-${blockchain}`

### 9. Unused Prop

**Location:** Component props destructuring  
**Problem:** `children` destructured but never used  
**Impact:** Code clutter, unnecessary destructuring  
**Fix:** Removed from explicit destructuring

### 10. Separation of Concerns

**Location:** All logic in one component  
**Problem:** Hard to test, maintain, and reuse  
**Impact:** Poor code organization  
**Fix:** Extracted to focused utility functions

## Code Quality Issues

- Missing proper TypeScript types
- No code documentation/comments
- No accessibility considerations (WCAG)
- Inline styling approach (not maintainable)
- No error handling
- Hard to test individual functions

All of these have been addressed in the refactored version.
