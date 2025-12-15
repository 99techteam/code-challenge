# Problem 1: Sum to N

This module provides three different implementations to calculate the sum of all positive integers from 1 to n, with **BigInt support** for handling large numbers safely.

## Functions

### `sum_to_n_a(n)`

**Mathematical formula approach** - Uses the arithmetic series formula.

- Time Complexity: O(1) - Constant time
- Space Complexity: O(1)
- Most efficient implementation
- Returns BigInt for safe handling of large numbers

```javascript
sum_to_n_a(5); // Returns: 15n
sum_to_n_a(100); // Returns: 5050n
sum_to_n_a(10000000000n); // Returns: 50000000005000000000n
```

### `sum_to_n_b(n)`

**Iterative approach** - Uses a loop to sum values.

- Time Complexity: O(n) - Linear time
- Space Complexity: O(1)
- Returns BigInt for safe handling of large numbers

```javascript
sum_to_n_b(5); // Returns: 15n
sum_to_n_b(100); // Returns: 5050n
sum_to_n_b(1000n); // Returns: 500500n
```

### `sum_to_n_c(n)`

**Recursive approach** - Uses recursion to sum values.

- Time Complexity: O(n) - Linear time
- Space Complexity: O(n) - Due to call stack
- Returns BigInt for safe handling of large numbers

```javascript
sum_to_n_c(5); // Returns: 15n
sum_to_n_c(100); // Returns: 5050n
sum_to_n_c(50n); // Returns: 1275n
```

## Input Validation

All functions validate that the input parameter is:

- A **number** (finite, integer, positive) OR
- A **BigInt** (positive, >= 1n)
- For numbers exceeding `Number.MAX_SAFE_INTEGER`, a warning is logged

Invalid inputs will:

- Log an error message to the console
- Return `0n` (BigInt zero)

## Examples

```javascript
// Valid inputs - regular numbers
sum_to_n_a(10); // Returns: 55n
sum_to_n_b(3); // Returns: 6n
sum_to_n_c(1); // Returns: 1n

// Valid inputs - BigInt
sum_to_n_a(100n); // Returns: 5050n
sum_to_n_b(1000n); // Returns: 500500n

// Large numbers - automatic BigInt conversion with warning
sum_to_n_a(9007199254740992); // Logs warning, returns BigInt result

// Invalid inputs
sum_to_n_a(-5); // Logs error, returns: 0n
sum_to_n_b(3.14); // Logs error, returns: 0n
sum_to_n_c("10"); // Logs error, returns: 0n
sum_to_n_a(NaN); // Logs error, returns: 0n
sum_to_n_a(Infinity); // Logs error, returns: 0n
```

## Performance Comparison

For calculating sum from 1 to n:

| Implementation | Time Complexity | Space Complexity | Best Use Case                   |
| -------------- | --------------- | ---------------- | ------------------------------- |
| sum_to_n_a     | O(1)            | O(1)             | Production use - fastest        |
| sum_to_n_b     | O(n)            | O(1)             | Educational - iterative pattern |
| sum_to_n_c     | O(n)            | O(n)             | Educational - recursion pattern |

## Key Features

- **BigInt Support**: All functions automatically handle BigInt inputs and return BigInt values, preventing integer overflow issues
- **Safety Warnings**: Numbers exceeding `Number.MAX_SAFE_INTEGER` trigger warnings
- **Input Validation**: Comprehensive validation using `isValidSumInput()` function that checks for:
  - Valid number types (finite, integer, positive)
  - Valid BigInt types (positive, >= 1n)
  - Rejects strings, NaN, Infinity, floats, and negative values

## Recommendation

For production use, **`sum_to_n_a`** is recommended as it provides constant time complexity regardless of the input size.
