/**
 * Three implementations of summing integers from 1 to `n` (inclusive).
 * Behavior for any integer `n`:
 * - If n >= 1: sum = 1 + 2 + ... + n
 * - If n < 1: sum = n + (n+1) + ... + 1
 * Assumes result fits within Number.MAX_SAFE_INTEGER.
 */

/** Iterative approach (loop). Time: O(|n|), Space: O(1) */
export function sum_to_n_a(n: number): number {
  if (n >= 1) {
    let sum = 0;
    for (let i = 1; i <= n; i++) sum += i;
    return sum;
  }
  let sum = 0;
  for (let i = n; i <= 1; i++) sum += i;
  return sum;
}

/** Recursive approach. Time: O(|n|), Space: O(|n|) (call stack) */
export function sum_to_n_b(n: number): number {
  if (n === 1) return 1;
  if (n > 1) return n + sum_to_n_b(n - 1);
  return n + sum_to_n_b(n + 1);
}

/** Formula approach (constant time). Time: O(1), Space: O(1) */
export function sum_to_n_c(n: number): number {
  if (n >= 1) return (n * (n + 1)) / 2;
  const count = 2 - n; // number of terms from n..1
  return ((n + 1) * count) / 2;
}
