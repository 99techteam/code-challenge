/**
 * Problem 4: provide three unique implementations for summing integers up to n.
 *
 * For this solution:
 * - If n >= 1, sum 1..n.
 * - If n < 1, return 0 because there are no positive integers in the range 1..n.
 * - Decimal inputs are truncated toward zero to keep the contract deterministic.
 */

/** Iterative loop. Time: O(n), Space: O(1) */
export function sum_to_n_a(n: number): number {
  const limit = Math.trunc(n);

  if (limit < 1) {
    return 0;
  }

  let total = 0;
  for (let value = 1; value <= limit; value += 1) {
    total += value;
  }

  return total;
}

/** Recursive decomposition. Time: O(n), Space: O(n) due to call stack */
export function sum_to_n_b(n: number): number {
  const limit = Math.trunc(n);

  if (limit < 1) {
    return 0;
  }

  if (limit === 1) {
    return 1;
  }

  return limit + sum_to_n_b(limit - 1);
}

/** Arithmetic series formula. Time: O(1), Space: O(1) */
export function sum_to_n_c(n: number): number {
  const limit = Math.trunc(n);

  if (limit < 1) {
    return 0;
  }

  return (limit * (limit + 1)) / 2;
}
