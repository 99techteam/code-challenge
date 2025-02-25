/**
 * Iterative Approach
 * @param n - A positive integer as input.
 * @returns The sum of numbers from 1 to n
 * 
 * Complexity:
 *   - Time Complexity: O(n) - The loop runs from 1 to n.
 *   - Space Complexity: O(1) - Only a single variable is used to store the result.
 * Efficiency:
 *   - This approach is simple and easy to understand.
 *   - It works well for small and medium values of n.
 *   - For very large values of n, the linear time complexity makes it slower compared to the mathematical formula approach.
 */

function sum_to_n_a(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
 * Mathematical Formula
 * @param n - A positive integer as input.
 * @returns The sum of numbers from 1 to n
 * 
 * Complexity:
 *   - Time Complexity: O(1) - Only a single mathematical operation is performed.
 *   - Space Complexity: O(1) - No additional memory is used.
 * Efficiency:
 *   - This is the most efficient approach in terms of both time and space.
 *   - It works in constant time, making it ideal for very large values of n.
 *   - The only limitation is that the result must not exceed `Number.MAX_SAFE_INTEGER`.
 */

function sum_to_n_b(n: number): number {
  return (n * (n + 1)) / 2;
}

/**
 * Recursive Approach
 * @param n - A positive integer as input.
 * @returns The sum of numbers from 1 to n
 * 
 * Complexity:
 *   - Time Complexity: O(1) - Each recursive call reduces n by 1.
 *   - Space Complexity: O(1) - Each recursive call adds a stack frame.
 * Efficiency:
 *   - This approach is elegant and easy to understand but inefficient for large values of n.
 *   - The recursive calls consume additional memory due to the call stack, which can lead to a stack overflow for very large n.
 *   - It is not recommended for practical use when n is large, but it is a good example of how recursion works.
 */

function sum_to_n_c(n: number): number {
  if (n === 1) return 1;
  return n + sum_to_n_c(n - 1);
}