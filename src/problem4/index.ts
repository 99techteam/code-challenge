/**
 * @file Problem 4 - Summation to N
 * @description Provides three unique TypeScript implementations for calculating
 * the summation from 1 to n.
 * @author Paing Sett Kyaw
 * @created 2026-05-15
 * @updated 2026-05-15
 */

/**
 * @description Calculates the summation from 1 to n using a standard iterative
 * loop.
 * @param n - Any integer input.
 * @returns The summation from 1 to n. Returns 0 when n is less than or equal to 0.
 * @complexity Time: O(n), because each number from 1 through n is visited once.
 * Space: O(1), because only a running total is stored.
 */
function sum_to_n_a(n: number): number {
  if (n <= 0) {
    return 0;
  }

  let total = 0;

  for (let current = 1; current <= n; current += 1) {
    total += current;
  }

  return total;
}

/**
 * @description Calculates the summation from 1 to n using the arithmetic series
 * formula.
 * @param n - Any integer input.
 * @returns The summation from 1 to n. Returns 0 when n is less than or equal to 0.
 * @complexity Time: O(1), because the result is calculated directly with a
 * formula. Space: O(1), because no extra data structure is created.
 */
function sum_to_n_b(n: number): number {
  if (n <= 0) {
    return 0;
  }

  return (n * (n + 1)) / 2;
}

/**
 * @description Calculates the summation from 1 to n by pairing the smallest and
 * largest remaining values.
 * @param n - Any integer input.
 * @returns The summation from 1 to n. Returns 0 when n is less than or equal to 0.
 * @complexity Time: O(n), but it performs about half as many loop iterations as
 * the direct iterative solution. Space: O(1), because only counters and a
 * running total are stored.
 */
function sum_to_n_c(n: number): number {
  if (n <= 0) {
    return 0;
  }

  let low = 1;
  let high = n;
  let total = 0;

  while (low < high) {
    total += low + high;
    low += 1;
    high -= 1;
  }

  if (low === high) {
    total += low;
  }

  return total;
}

export { sum_to_n_a, sum_to_n_b, sum_to_n_c };
