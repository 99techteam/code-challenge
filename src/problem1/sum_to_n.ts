/**
 * Problem 4 - Three distinct implementations of summation from 1..n.
 * All functions assume `n` is an integer greater or equal to 0 and that the
 * result does not overflow `Number.MAX_SAFE_INTEGER`, as per the prompt.
 */

/**
 * Iterative accumulation. Keeps a running total in a tight loop.
 * Time: O(n) due to the single pass; Space: O(1)
 */
export function sum_to_n_a(n: number): number {
  const m = Math.trunc(n);
  if (m < 0) {
    throw new Error('sum_to_n_a expects a non-negative integer.');
  }
  let sum = 0;
  for (let i = 1; i <= m; i += 1) {
    sum += i;
  }
  return sum;
}

/**
 * Divide-and-conquer recursion. Splits the range into halves and sums them.
 * Depth is O(log n), but all numbers 1..n are still visited once overall.
 * Time: O(n), Space: O(log n) due to recursion stack.
 */
export function sum_to_n_b(n: number): number {
  const m = Math.trunc(n);
  if (m < 0) {
    throw new Error('sum_to_n_b expects a non-negative integer.');
  }

  const helper = (start: number, end: number): number => {
    if (start > end) return 0;
    if (start === end) return start;
    const mid = Math.floor((start + end) / 2);
    return helper(start, mid) + helper(mid + 1, end);
  };

  return helper(1, m);
}

/**
 * Closed-form arithmetic progression formula (a.k.a. "Gauss trick").
 * Time: O(1), Space: O(1)
 */
export function sum_to_n_c(n: number): number {
  const m = Math.trunc(n);
  if (m < 0) {
    throw new Error('sum_to_n_c expects a non-negative integer.');
  }
  return (m * (m + 1)) / 2;
}
