/**
 * Calculates the sum of integers from 1 to n using an iterative loop.
 *
 * Time Complexity: O(n) - The loop runs 'n' times.
 * Space Complexity: O(1) - Only a few variables are used, regardless of 'n'.
 */
function sum_to_n_a(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
 * Calculates the sum of integers from 1 to n using recursion.
 *
 * Time Complexity: O(n) - 'n' recursive calls are made.
 * Space Complexity: O(n) - The recursive call stack can grow up to 'n' deep.
 */
function sum_to_n_b(n: number): number {
  if (n <= 0) {
    return 0; // Base case: sum of non-positive numbers is 0
  }
  return n + sum_to_n_b(n - 1); // Recursive step
}

/**
 * Calculates the sum of integers from 1 to n using Gauss's formula.
 *
 * Time Complexity: O(1) - Performs a fixed number of arithmetic operations.
 * Space Complexity: O(1) - Only a few variables are used, regardless of 'n'.
 */
function sum_to_n_c(n: number): number {
  return (n * (n + 1)) / 2; // Direct mathematical formula
}

// --- Test Cases ---
console.log(`sum_to_n_a(10): ${sum_to_n_a(10)}`); // Expected: 66
console.log(`sum_to_n_b(10): ${sum_to_n_b(10)}`); // Expected: 66
console.log(`sum_to_n_c(10): ${sum_to_n_c(10)}`); // Expected: 66

console.log(`sum_to_n_a(0): ${sum_to_n_a(0)}`); // Expected: 0
console.log(`sum_to_n_b(0): ${sum_to_n_b(0)}`); // Expected: 0
console.log(`sum_to_n_c(0): ${sum_to_n_c(0)}`); // Expected: 0

console.log(`sum_to_n_a(1): ${sum_to_n_a(1)}`); // Expected: 1
console.log(`sum_to_n_b(1): ${sum_to_n_b(1)}`); // Expected: 1
console.log(`sum_to_n_c(1): ${sum_to_n_c(1)}`); // Expected: 1
