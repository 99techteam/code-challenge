# Code Challenge Solutions

This repository contains solutions to 3 coding challenges demonstrating proficiency in JavaScript, TypeScript, React, and software engineering best practices.

---

## 📋 Table of Contents

- [Problem 1: Sum to N - Three Ways](#problem-1-sum-to-n---three-ways)
- [Problem 2: Fancy Form - Currency Swap Application](#problem-2-fancy-form---currency-swap-application)
- [Problem 3: Messy React - Code Analysis & Refactoring](#problem-3-messy-react---code-analysis--refactoring)

---

## Problem 1: Sum to N - Three Ways

**Location:** [`src/problem1/index.js`](./src/problem1/index.js)

### 📝 Challenge
Provide 3 unique implementations to compute the sum of numbers from 1 to n.

### ✅ Solutions

| Method | Approach | Time Complexity | Space Complexity |
|--------|----------|-----------------|------------------|
| **sum_to_n_a** | Mathematical formula: `n × (n + 1) / 2` | O(1) | O(1) |
| **sum_to_n_b** | Iterative loop accumulation | O(n) | O(1) |
| **sum_to_n_c** | Recursive calculation | O(n) | O(n) |

### 🎯 Key Features
- ✅ Edge case handling (n ≤ 0)
- ✅ JSDoc documentation
- ✅ Three distinct algorithmic approaches
- ✅ Optimal solution using arithmetic series formula

### 💡 Best Practice
**sum_to_n_a** is the most efficient solution with constant time and space complexity.

---

## Problem 2: Fancy Form - Currency Swap Application

**Location:** [`src/problem2/`](./src/problem2/)

### 📝 Challenge
Build a responsive, user-friendly currency swap interface with real-time exchange rates.

### 🚀 Live Demo
https://code-challenge-steel.vercel.app/

### ✨ Features

#### Core Functionality
-  **Real-time Exchange Rates** - Live price data from CoinGecko API
-  **Token Swapping** - Swap between USD, ETH, BLUR, bNEO, BUSD, ATOM, LUNA
-  **Balance Validation** - Prevents swaps exceeding available balance (mocked data for USD and ATOM)
-  **Auto-calculation** - Instant conversion as you type
-  **Exchange Rate Display** - Clear rate information

#### User Experience
-  **Modern Dark UI** - Sleek slate-themed design
-  **Smooth Animations** - Fade-ins, loading states, transitions
-  **Fully Responsive** - Mobile, tablet, desktop optimized
-  **Accessible** - Semantic HTML, ARIA labels, keyboard navigation
-  **Auto-focus** - Smart input focusing for better UX

#### Technical Features
-  **Form Validation** - React Hook Form with custom rules
-  **Type Safety** - Full TypeScript implementation
-  **Component Architecture** - Modular, reusable components
-  **Loading States** - Skeleton loaders, spinners
-  **Error Handling** - Graceful error messages
-  **Confirmation Modal** - Preview before swap


---

## Problem 3: Messy React - Code Analysis & Refactoring

**Location:** [`src/problem3/`](./src/problem3/)

### 📝 Challenge
Identify computational inefficiencies and anti-patterns in a React TypeScript component, then provide a refactored version following strict best practices.

### 📁 Files

- **[README.md](./src/problem3/README.md)** - Detailed analysis with tables, code comparisons, and explanations
- **[RefactoredComponent.tsx](./src/problem3/RefactoredComponent.tsx)** - Production-ready implementation

### 🎓 Key Learnings

#### Anti-Patterns Identified
1. ❌ Using array index as React key
2. ❌ Memoizing JSX creation with `useMemo`
3. ❌ Incorrect dependency arrays
4. ❌ Double iteration over same data
5. ❌ Functions defined inside component body

#### Correct Patterns
1. ✅ Use unique, stable identifiers for keys
2. ✅ Render JSX directly (React optimizes via reconciliation)
3. ✅ Only memoize expensive calculations
4. ✅ Single-pass data transformations
5. ✅ Pure functions outside component or in constants

---

## 🎯 Overall Highlights

### Technical Skills Demonstrated
- ✅ **Algorithm Design** - Multiple approaches with complexity analysis
- ✅ **React Expertise** - Hooks, forms, state management, performance optimization
- ✅ **TypeScript Proficiency** - Strict typing, interfaces, type safety
- ✅ **Code Quality** - Clean code, documentation, best practices
- ✅ **Performance** - Optimization, memoization, efficient algorithms
- ✅ **UX/UI** - Responsive design, accessibility, smooth interactions
- ✅ **Architecture** - Component design, separation of concerns
- ✅ **Problem Solving** - Debugging, refactoring, analysis

### Best Practices
- 📝 Comprehensive documentation
- 🧪 Type safety throughout
- ♿ Accessibility compliance
- 🎨 Modern, responsive UI
- ⚡ Performance optimization
- 🔧 Maintainable code structure

---
