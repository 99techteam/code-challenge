/**
 * Implementation 1: Using a For Loop
 * Time complexity: O(n).
 * Space complexity: O(1).
 * @param {number} n - The target number to sum up to.
 * @returns {number} - The sum of integers from 1 to `n`.
 */
function sum_to_n_a(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
* Implementation 2: Using the Mathematical Formula for Summation
* Time complexity: O(1).
* Space complexity: O(1).
* @param {number} n - The target number to sum up to.
* @returns {number} - The sum of integers from 1 to `n`.
*/
function sum_to_n_b(n: number): number {
  return (n * (n + 1)) / 2;
}

/**
* Implementation 3: Using Recursion.
* Time complexity: O(n).
* Space complexity: O(n).
* @param {number} n - The target number to sum up to.
* @returns {number} - The sum of integers from 1 to `n`.
*/
function sum_to_n_c(n: number): number {
  if (n === 1) {
    return 1;
  }
  return n + sum_to_n_c(n - 1);
}