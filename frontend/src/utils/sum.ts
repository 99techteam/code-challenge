/**
 * Problem 1: Three ways to sum to n
 */

/**
 * Implementation A: Mathematical formula (Gauss)
 * Time Complexity: O(1) - Constant time arithmetic operations
 * Space Complexity: O(1) - Constant space
 */
export const sum_to_n_a = (n: number): number => {
  return (n * (n + 1)) / 2;
};

/**
 * Implementation B: Iterative approach
 * Time Complexity: O(n) - Loops n times
 * Space Complexity: O(1) - Constant space for sum variable
 */
export const sum_to_n_b = (n: number): number => {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

/**
 * Implementation C: Recursive approach
 * Time Complexity: O(n) - n recursive calls
 * Space Complexity: O(n) - Call stack grows to n
 */
export const sum_to_n_c = (n: number): number => {
  if (n <= 1) return n;
  return n + sum_to_n_c(n - 1);
};
