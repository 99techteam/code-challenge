# Problem 1: Three ways to sum to n

## Description
Provide 3 unique implementations of a function that calculates the summation of numbers from 1 to `n`.

**Input**: `n` - any integer.
**Output**: Summation to `n`.

## Assumptions
1. The result will always be less than `Number.MAX_SAFE_INTEGER`.
2. Input `n` should be a non-negative integer.
   - If `n` is 0, a sum is 0.
   - If `n` < 0, the function throws an error (based on standard summation definition 1...n, though mathematical definition might return 0 or be invalid, here strict validation is applied).

## Implementations

### 1. `sum_to_n_a`: Arithmetic Series Formula
Uses the mathematical formula for the sum of the first n integers:
\[ S_n = \frac{n(n+1)}{2} \]

- **Time Complexity**: O(1)—Constant time calculation.
- **Space Complexity**: O(1)—Constant space.
- **Pros**: Fastest and most efficient.
- **Cons**: Theoretical risk of intermediate overflow `n*(n+1)` if `n` is extremely large (close to `MAX_SAFE_INTEGER`).

### 2. `sum_to_n_b`: Iterative Loop
Uses a `for` loop to accumulate the sum from 1 to `n`.

- **Time Complexity**: O(n)—Linear time.
- **Space Complexity**: O(1)—Constant space.
- **Pros**: Robust, easy to read, no recursion stack limits.
- **Cons**: Slower than the formula for very large `n`.

### 3. `sum_to_n_c`: Recursion
Uses the recursive definition: `sum(n) = n + sum(n-1)`.

- **Time Complexity**: O(n)—Linear time.
- **Space Complexity**: O(n)—Linear space due to the call stack.
- **Pros**: Demonstrates functional programming concepts.
- **Cons**: In JavaScript, this is limited by the maximum call stack size (typically ~10,000 calls). Will throw `RangeError: Maximum call stack size exceeded` for large `n`.

## Usage
```javascript
import { sum_to_n_a } from './index'

console.log(sum_to_n_a(5)); // 15
```

## Testing
Run the test suite:
```bash
node src/problem1/test.js
```
