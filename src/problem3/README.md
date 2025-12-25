# Wallet Page - Problem 3

A refactored React + TypeScript + Vite application that displays cryptocurrency wallet balances sorted by blockchain priority. This project demonstrates best practices in React development, TypeScript typing, and performance optimization.

## Overview

This application displays a list of wallet balances across multiple blockchains, sorted by priority and filtered to show only valid balances. It showcases proper React patterns, memoization strategies, and separation of concerns.

## Tech Stack

- **React 19.2** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7.2** - Build tool with HMR
- **Tailwind CSS 4.1** - Styling
- **React Compiler** - Automatic optimization

## Code Structure

```
src/
├── components/           # React components
│   ├── WalletPage.tsx   # Main page component with wallet list
│   └── WalletRow.tsx    # Individual wallet balance row
├── hooks/               # Custom React hooks
│   ├── useFetch.ts      # Generic fetch hook with error handling
│   ├── usePrices.ts     # Hook for fetching cryptocurrency prices
│   └── useWalletBalances.ts # Hook for fetching wallet balances
├── mocks/               # Mock data for development
│   └── mockData.ts      # Sample wallet balances and prices
├── styles/              # CSS stylesheets
│   └── index.css        # Main styles with Tailwind
├── types/               # TypeScript type definitions
│   └── index.ts         # Shared interfaces and types
├── utils/               # Utility functions
│   ├── balanceHelpers.ts    # Balance filtering, sorting, formatting
│   └── blockchainPriority.ts # Blockchain priority mapping
├── App.tsx              # Root application component
└── main.tsx             # Application entry point
```

### Components

#### `WalletPage.tsx`

Main component that orchestrates the wallet display:

- Fetches wallet balances and cryptocurrency prices
- Filters out invalid balances (amount <= 0 or unsupported blockchains)
- Sorts balances by blockchain priority
- Calculates USD values
- Renders list of wallet rows

#### `WalletRow.tsx`

Displays individual wallet balance information:

- Shows blockchain, currency, and amount
- Displays USD value
- Accessible ARIA labels

### Hooks

#### `useWalletBalances()`

Custom hook that fetches wallet balance data.

- Returns array of `WalletBalance` objects
- Uses mock data in development

#### `usePrices()`

Custom hook that fetches cryptocurrency price data.

- Returns price mapping: `{ [currency: string]: number }`
- Uses mock data in development

#### `useFetch()`

Generic data fetching hook with error handling and loading states.

- Type-safe with TypeScript generics
- Handles loading, error, and success states
- Configurable fetch options

### Utilities

#### `balanceHelpers.ts`

Pure functions for balance operations:

- `filterValidBalances()` - Filters balances with valid amounts and supported blockchains
- `sortBalancesByPriority()` - Sorts by blockchain priority (highest first)
- `formatBalances()` - Adds formatted amount strings

#### `blockchainPriority.ts`

Blockchain priority configuration:

- Maps blockchain names to priority values
- Higher values appear first in the list
- Unsupported blockchains return -99

### Types

#### Main Interfaces

```typescript
// Wallet balance from API
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

// Formatted balance for display
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// Supported blockchains
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';
```

## Key Improvements from Original Code

This refactored version addresses 10+ critical issues from the original implementation:

1. ✅ **Performance** - Functions moved outside components, proper memoization
2. ✅ **Type Safety** - Replaced `any` with proper TypeScript types
3. ✅ **Bug Fixes** - Fixed typos and inverted filter logic
4. ✅ **React Best Practices** - Proper keys, correct dependencies
5. ✅ **Separation of Concerns** - Logic extracted to utility functions
6. ✅ **Testability** - Pure functions that can be easily tested
7. ✅ **Accessibility** - ARIA labels and semantic HTML
8. ✅ **Documentation** - Comprehensive code comments

See `ORIGINAL_CODE_ISSUES.md` for detailed breakdown of all issues and fixes.

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

See [TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md) for detailed testing information.

## Project Features

- 🚀 Fast development with Vite HMR
- 📦 React Compiler for automatic optimization
- 🎨 Tailwind CSS for styling
- ✨ TypeScript for type safety
- ♿ Accessible components with ARIA labels
- 📱 Responsive design
- 🧪 Comprehensive test suite (109 tests)
- 📊 Complete test coverage across all modules
- 🔍 Clean architecture for easy testing

## Testing

This project includes a comprehensive test suite with **109 tests** covering:

- ✅ **Utility Functions** - Balance filtering, sorting, formatting, priority mapping
- ✅ **Custom Hooks** - Data fetching with abort signals and error handling
- ✅ **Components** - WalletRow and WalletPage with accessibility tests
- ✅ **Integration Tests** - Complete workflow from data to rendering

### Test Technologies

- **Vitest** - Fast unit test framework
- **React Testing Library** - Component testing
- **@testing-library/jest-dom** - DOM matchers
- **happy-dom** - Lightweight DOM implementation

### Running Tests

```bash
pnpm test              # Run all tests
pnpm test:ui           # Run with interactive UI
pnpm test:coverage     # Generate coverage report
```

For detailed testing documentation, see [TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md).
