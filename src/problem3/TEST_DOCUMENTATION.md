# Test Documentation

Comprehensive test suite for the Wallet Page application covering components, hooks, and utility functions.

## Test Coverage

### 1. Utility Functions (`src/utils/`)

#### `blockchainPriority.test.ts`

Tests for the blockchain priority mapping system.

**Coverage:**

- ✅ Priority values for all supported blockchains (Osmosis, Ethereum, Arbitrum, Zilliqa, Neo)
- ✅ Default priority (-99) for unsupported blockchains
- ✅ Edge cases (undefined, invalid values)
- ✅ Priority ordering consistency

**Test Count:** 8 tests

#### `balanceHelpers.test.ts`

Tests for balance filtering, sorting, and formatting utilities.

**Coverage:**

- ✅ `filterValidBalances()` - Filters out invalid balances (amount <= 0, unsupported blockchains)
- ✅ `sortBalancesByPriority()` - Sorts by blockchain priority (descending)
- ✅ `formatBalance()` - Formats numbers to 2 decimal places
- ✅ `formatBalances()` - Adds formatted property to balance objects
- ✅ Integration test combining all three functions
- ✅ Edge cases (empty arrays, large/small numbers, immutability)

**Test Count:** 24 tests

### 2. Custom Hooks (`src/hooks/`)

#### `useFetch.test.ts`

Tests for the generic data fetching hook with abort signal support.

**Coverage:**

- ✅ Successful fetch with immediate and deferred loading
- ✅ Initial data handling
- ✅ Error handling (Error objects and non-Error values)
- ✅ Refetch functionality
- ✅ Delay functionality with timers
- ✅ Abort signal passing and cancellation
- ✅ Request abortion on unmount
- ✅ Request abortion on refetch
- ✅ State management (loading, error, data)
- ✅ TypeScript type safety
- ✅ Edge cases (null, undefined, rapid refetches)

**Test Count:** 22 tests

### 3. Components (`src/components/`)

#### `WalletRow.test.tsx`

Tests for the individual wallet balance row component.

**Coverage:**

- ✅ Rendering all data fields (currency, amount, blockchain, USD value)
- ✅ USD value formatting (currency format, commas, decimals)
- ✅ Accessibility (ARIA labels, roles, semantic HTML)
- ✅ CSS classes
- ✅ All supported blockchains
- ✅ Various currencies
- ✅ Edge cases (long names, large/small amounts, special characters)
- ✅ Component isolation and independence

**Test Count:** 30 tests

#### `WalletPage.test.tsx`

Tests for the main wallet page component with integration tests.

**Coverage:**

- ✅ Basic rendering (title, empty state)
- ✅ Filtering logic (invalid amounts, unsupported blockchains)
- ✅ Sorting by blockchain priority
- ✅ Amount formatting (2 decimal places)
- ✅ USD value calculation
- ✅ Missing price handling
- ✅ Stable row keys (currency + blockchain)
- ✅ Props handling (className, forwarded props)
- ✅ Accessibility compliance (ARIA attributes, semantic HTML)
- ✅ Memoization behavior
- ✅ Edge cases (empty data, large datasets, extreme values)
- ✅ Complete integration workflow

**Test Count:** 25 tests

## Running Tests

### Run All Tests

```bash
pnpm test
```

### Run Tests with UI

```bash
pnpm test:ui
```

### Run Tests with Coverage

```bash
pnpm test:coverage
```

### Run Specific Test File

```bash
pnpm test src/utils/balanceHelpers.test.ts
```

### Run Tests in Watch Mode

```bash
pnpm test --watch
```

## Test Statistics

| Category   | Files | Tests   | Coverage Area                        |
| ---------- | ----- | ------- | ------------------------------------ |
| Utilities  | 2     | 32      | Balance operations, priority mapping |
| Hooks      | 1     | 22      | Data fetching, abort signals         |
| Components | 2     | 55      | UI rendering, user interaction       |
| **Total**  | **5** | **109** | **Full application**                 |

## Testing Technologies

- **Vitest** - Fast unit test framework with Vite integration
- **React Testing Library** - Component testing with user-centric queries
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **happy-dom** - Lightweight DOM implementation for testing

## Test Patterns Used

### 1. Arrange-Act-Assert (AAA)

All tests follow the AAA pattern for clarity:

```typescript
it('should filter out balances with amount <= 0', () => {
  // Arrange
  const balances = [
    /* test data */
  ];

  // Act
  const result = filterValidBalances(balances);

  // Assert
  expect(result).toHaveLength(1);
});
```

### 2. Mock Data Factories

Reusable mock data creators for consistency:

```typescript
const createMockBalance = (overrides?: Partial<FormattedWalletBalance>) => ({
  currency: 'ETH',
  amount: 1.5,
  blockchain: 'Ethereum',
  formatted: '1.50',
  ...overrides,
});
```

### 3. Accessibility Testing

Every component test includes accessibility checks:

```typescript
expect(screen.getByRole('row')).toHaveAttribute(
  'aria-label',
  'Balance for ETH'
);
```

### 4. Edge Case Coverage

Comprehensive edge case testing:

- Empty inputs
- Null/undefined values
- Very large/small numbers
- Invalid data types
- Boundary conditions

### 5. Integration Tests

Tests that verify multiple units working together:

```typescript
it('should filter, sort, format, and render correctly', () => {
  // Tests complete workflow from data fetch to rendering
});
```

## Coverage Goals

All critical paths and edge cases are thoroughly tested across:

- **Utility Functions:** Complete coverage of all exported functions
- **Custom Hooks:** All hook behaviors and edge cases
- **Components:** All rendering paths and user interactions
- **Integration:** End-to-end workflows from data to display

## Continuous Integration

Tests are designed to run in CI/CD pipelines:

- No external dependencies
- Fast execution (~2 seconds)
- Deterministic results
- Clear failure messages

## Best Practices

1. ✅ **Test behavior, not implementation** - Focus on what the code does, not how
2. ✅ **Use descriptive test names** - Clear indication of what's being tested
3. ✅ **One assertion per concept** - Tests focused on single behaviors
4. ✅ **Arrange-Act-Assert pattern** - Consistent test structure
5. ✅ **Mock external dependencies** - Isolated unit tests
6. ✅ **Test edge cases** - Comprehensive coverage of boundary conditions
7. ✅ **Accessibility testing** - Ensure WCAG compliance
8. ✅ **Clean up after tests** - Prevent test pollution

## Future Enhancements

- [ ] Visual regression testing with Playwright
- [ ] Performance benchmarking tests
- [ ] E2E tests for critical user flows
- [ ] Mutation testing for test quality verification
- [ ] Snapshot testing for component structure
- [ ] API integration tests with MSW (Mock Service Worker)

## Troubleshooting

### Tests Failing in CI

- Ensure `happy-dom` is installed
- Check Node.js version compatibility
- Verify all dependencies are installed

### Slow Test Execution

- Use `vi.useFakeTimers()` for time-dependent tests
- Mock heavy dependencies
- Run tests in parallel (default in Vitest)

### Coverage Not Generating

- Run `pnpm test:coverage` instead of `pnpm test`
- Check `vitest.config.ts` for coverage configuration
- Ensure `@vitest/coverage-v8` is installed
