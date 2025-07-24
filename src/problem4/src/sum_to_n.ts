/**
 * sum_to_n_a - Formula approach
 * Time: O(1), Space: O(1)
 */
export function sum_to_n_a(n: number): number {
  return (n * (n + 1)) / 2;
}

/**
 * sum_to_n_b - Loop approach
 * Time: O(n), Space: O(1)
 */
export function sum_to_n_b(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
}

/**
 * sum_to_n_c - Recursive approach
 * Time: O(n), Space: O(n)
 */
export function sum_to_n_c(n: number): number {
  if (n <= 1) return n;
  return n + sum_to_n_c(n - 1);
}
