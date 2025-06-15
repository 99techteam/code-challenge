# Wallet Page Component Code Review

## Overview
This document outlines the issues and anti-patterns found in the Wallet Page component implementation, along with recommendations for improvement.

## Issues Identified

### 1. Type Safety Violations
- **Issue**: The `WalletBalance` interface lacks a `blockchain` field, yet it's used in `getPriority`
- **Impact**: TypeScript type checking is bypassed, leading to potential runtime errors
- **Recommendation**: 
  ```typescript
  interface WalletBalance {
    currency: string;
    amount: number;
    blockchain: Blockchain; // Add this field
  }
  type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';
  ```

### 2. Runtime Error Risk
- **Issue**: Undefined variable `lhsPriority` used in filter condition
- **Impact**: Runtime error when accessing undefined variable
- **Code Example**:
  ```typescript
  // Incorrect
  if (lhsPriority > -99) // lhsPriority is not defined
  
  // Correct
  if (balancePriority > -99)
  ```

### 3. Redundant Data Processing
- **Issue**: Double mapping of data:
  1. First in `formattedBalances`
  2. Then in `rows` using `sortedBalances`
- **Impact**: Unnecessary performance overhead and potential data inconsistency
- **Recommendation**: Combine operations into a single transformation

### 4. Incorrect Filter Logic
- **Issue**: Filter condition incorrectly keeps negative balances
- **Impact**: Wrong data displayed to users
- **Code Example**:
  ```typescript
  // Incorrect
  if (balance.amount <= 0) {
    return true;
  }
  
  // Correct
  return balance.amount > 0;
  ```

### 5. React Key Anti-pattern
- **Issue**: Using array index as React key
- **Impact**: Potential rendering issues with dynamic lists
- **Recommendation**: Use unique composite keys:
  ```typescript
  key={`${balance.blockchain}-${balance.currency}`}
  ```

### 6. Performance Optimization Issues
- **Issue**: `getPriority` function recreated on every render
- **Impact**: Unnecessary re-renders and performance overhead
- **Recommendation**: Memoize the function:
  ```typescript
  const getPriority = useCallback((blockchain: Blockchain): number => {
    // ... implementation
  }, []);
  ```

### 7. Incorrect useMemo Dependencies
- **Issue**: `prices` included in dependency array but not used in computation
- **Impact**: Unnecessary re-computations
- **Recommendation**: Remove unused dependencies:
  ```typescript
  useMemo(() => {
    // ... computation
  }, [balances]); // Remove prices if not used
  ```

### 8. Unused Props
- **Issue**: `children` prop extracted but never used
- **Impact**: Misleading code and unnecessary prop destructuring
- **Recommendation**: Remove unused prop destructuring

## Best Practices Recommendations

1. **Type Safety**
   - Use strict TypeScript types
   - Avoid `any` type
   - Define proper interfaces and types

2. **Performance**
   - Memoize expensive computations
   - Combine multiple transformations
   - Remove unnecessary dependencies

3. **React Patterns**
   - Use proper key strategies
   - Implement proper prop types
   - Follow React hooks best practices

4. **Code Organization**
   - Keep functions pure
   - Use proper error handling
   - Maintain consistent code style

## Conclusion
The component requires several improvements in type safety, performance optimization, and React best practices. Implementing the recommended changes will result in a more robust, maintainable, and performant component.

## Refactored
```typescript
import React, { useMemo, useCallback } from "react";
import { BoxProps } from "@chakra-ui/react"; // Assuming BoxProps comes from Chakra UI
import { useWalletBalances, usePrices } from "./hooks"; // Placeholder for custom hooks
import { WalletRow } from "./components"; // Placeholder for custom component
import classes from "./WalletPage.module.css"; // Placeholder for CSS modules

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

const getPriority = (blockchain: Blockchain): number => {
  const priorities: Record<Blockchain, number> = {
    Osmosis: 100,
    Ethereum: 50,
    Arbitrum: 30,
    Zilliqa: 20,
    Neo: 20,
  };
  return priorities[blockchain] ?? -99;
};

const WalletPage: React.FC<BoxProps> = (props) => {
  const { ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo(() => {
    return balances
      .filter((b) => b.amount > 0)
      .sort((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain))
      .map((b) => ({
        ...b,
        formatted: b.amount.toFixed(),
      }));
  }, [balances]);

  const rows = formattedBalances.map((balance) => {
    const usdValue = prices[balance.currency]?.usd ?? 0;
    return (
      <WalletRow
        className={classes.row}
        key={`${balance.currency}-${balance.blockchain}`}
        amount={balance.amount}
        usdValue={usdValue * balance.amount}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};
```



