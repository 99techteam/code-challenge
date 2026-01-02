## Problem 1: Three Ways to Sum to N
**Solutions**:

1. **Iterative Loop (O(n))** - Traditional for-loop approach
   - Handles negative numbers and decimals (floors to integer)
   - Simple and straightforward implementation

2. **Mathematical Formula (O(1))** - Uses Gauss's formula: `n * (n + 1) / 2`
   - Most efficient solution with constant time complexity
   - Handles edge cases (negative numbers, decimals)
   - Can handle very large numbers efficiently (e.g., `Number.MAX_SAFE_INTEGER`)

3. **Recursion (O(n))** - Recursive approach
   - Functional programming style
   - Note: May cause stack overflow for very large numbers

**Assumptions**:
- Negative numbers return 0
- Decimals are floored to integers (e.g., 5.99 → 5)
- Zero returns 0

---

## Problem 2: Currency Swap Application

**Key Features**:

- **Bidirectional currency conversion** - Enter amount in either field, automatically calculates the other
- **Token selection with icons** - Dropdown selector with token images from Switcheo repository
- **Real-time price fetching** - Fetches live token prices from API
- **Form validation** - Input validation with error messages
- **Responsive design** - Works on all screen sizes (320px+)
- **Loading states** - Loading indicators during API calls and form submission
- **Token swap** - Quick swap between from/to tokens
- **Exchange rate display** - Shows current exchange rate between selected tokens

**Tech Stack**:

- **React 18** + Lucide React + **TypeScript** + **Vite**
- **Tailwind CSS** - Utility-first CSS framework
- **Custom React Hooks** - `useTokenPrices` for data fetching
- **Environment Variables** - Configurable token icon base URL

**Setup & Run**:

```bash
cd src/problem2
npm install
npm run dev
```

**[Deployment Demo URL https://99-code-challenge-eight.vercel.app/](https://99-code-challenge-eight.vercel.app/)**

**Preview**

<img width="550" height="589" alt="image" src="https://github.com/user-attachments/assets/e5e40399-804c-4c01-a069-99f94984b9e9" />


**Implementation**:

- **Type Safety**: Full TypeScript implementation with proper interfaces and types
- **Performance**: Uses `useMemo` and `useCallback` for optimization
- **Error Handling**: Comprehensive error handling for API failures
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Code Quality**: Modular component structure, clean separation of concerns

---

## Problem 3: Messy React Code Analysis & Refactoring

**Issues Identified & Fixed**:

1. **Type Safety Issues**:
   - Used `any` type for blockchain parameter
   -> Created `BlockchainName` type and `BlockchainEnum` for type safety

2. **Logic Errors**:
   - Incorrect filter logic (`lhsPriority > -99` used undefined variable)
   - Wrong filter condition (should filter `amount > 0`, not `<= 0`)
   -> Fixed filter to properly check priority and positive amounts

3. **Performance Issues**:
   - Unnecessary `prices` dependency in `useMemo` for sorting
   - Missing `useMemo` for `formattedBalances` and `rows`
   -> Removed redundant dependencies, added proper memoization

4. **Code Quality**:
   - Used index as React key (anti-pattern)
   - Inconsistent formatting (`toFixed()` vs `toFixed(2)`)
   - Missing `children` in return statement
   -> Used composite key (`currency-blockchain`), proper formatting, included children

5. **Best Practices**:
   - `getPriority` not memoized
   - Inefficient sort comparison
   -> Memoized `getPriority` with `useCallback`, simplified sort logic
