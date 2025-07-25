/**
 * Problem 4: Three ways to sum to n
 *
 * Input: n - any integer (lesser than Number.MAX_SAFE_INTEGER)
 * Output: summation to n, i.e. sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15
 */

/**
 * Approach A: Mathematical Formula
 * Uses the arithmetic series formula: n * (n + 1) / 2
 *
 * Time Complexity: O(1) - constant time
 * Space Complexity: O(1) - constant space
 *
 * This is the most efficient approach as it calculates the result in a single operation
 * regardless of the input size. It directly applies the mathematical formula for the
 * sum of first n natural numbers.
 */
function sum_to_n_a(n: number): number {
  // Handle edge cases
  if (n <= 0) return 0;

  // Apply arithmetic series formula: n * (n + 1) / 2
  return (n * (n + 1)) / 2;
}

/**
 * Approach B: Iterative Loop
 * Uses a for loop to accumulate the sum from 1 to n
 *
 * Time Complexity: O(n) - linear time, proportional to input size
 * Space Complexity: O(1) - constant space
 *
 * This approach is straightforward and easy to understand. It's less efficient than
 * the mathematical formula but still uses constant space. Good for educational purposes
 * and when you need to perform additional operations during iteration.
 */
function sum_to_n_b(n: number): number {
  // Handle edge cases
  if (n <= 0) return 0;

  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
 * Approach C: Recursive
 * Uses recursion to calculate the sum
 *
 * Time Complexity: O(n) - linear time due to n recursive calls
 * Space Complexity: O(n) - linear space due to call stack
 *
 * This approach demonstrates recursion but is the least efficient due to function
 * call overhead and stack space usage. For large values of n, it may cause stack
 * overflow. However, it's elegant and demonstrates the recursive nature of the problem.
 */
function sum_to_n_c(n: number): number {
  // Base cases
  if (n <= 0) return 0;
  if (n === 1) return 1;

  // Recursive case: n + sum of (n-1)
  return n + sum_to_n_c(n - 1);
}

// Export functions for testing
export { sum_to_n_a, sum_to_n_b, sum_to_n_c };

// Example usage and verification
function runTests(): void {
  const testValue = 5;
  const expected = 15; // 1 + 2 + 3 + 4 + 5 = 15

  console.log(`Testing with n = ${testValue} (expected: ${expected})`);
  console.log(`sum_to_n_a(${testValue}) = ${sum_to_n_a(testValue)}`);
  console.log(`sum_to_n_b(${testValue}) = ${sum_to_n_b(testValue)}`);
  console.log(`sum_to_n_c(${testValue}) = ${sum_to_n_c(testValue)}`);

  // Test with larger value to demonstrate performance differences
  const largeValue = 1000;
  const expectedLarge = (largeValue * (largeValue + 1)) / 2;

  console.log(`\nTesting with n = ${largeValue} (expected: ${expectedLarge})`);

  console.time("Mathematical Formula");
  const resultA = sum_to_n_a(largeValue);
  console.timeEnd("Mathematical Formula");

  console.time("Iterative Loop");
  const resultB = sum_to_n_b(largeValue);
  console.timeEnd("Iterative Loop");

  console.time("Recursive");
  const resultC = sum_to_n_c(largeValue);
  console.timeEnd("Recursive");

  console.log(`Results: A=${resultA}, B=${resultB}, C=${resultC}`);
  console.log(
    `All results match: ${
      resultA === resultB && resultB === resultC && resultC === expectedLarge
    }`
  );
}

// Uncomment the line below to run tests
runTests();
