/**
 * Summation 1 + 2 + … + n (triangular number).
 * Assumes the mathematical result is < Number.MAX_SAFE_INTEGER.
 * Requires n >= 0; otherwise logs to stderr and throws.
 * Log error if n < 0.
 */

function requireNonNegative(n: number, label: string): void {
  if (n < 0) {
    console.error(`[${label}] n must be >= 0, got:`, n);
    throw new RangeError(`${label}: n must be non-negative, got ${n}`);
  }
}

/** O(1) time, O(1) space — single arithmetic expression. */
export function sum_to_n_a(n: number): number {
  requireNonNegative(n, "sum_to_n_a");
  return (n * (n + 1)) / 2;
}

/** O(n) time, O(1) space — linear passes, no extra allocations. */
export function sum_to_n_b(n: number): number {
  requireNonNegative(n, "sum_to_n_b");
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/** O(n) time, O(n) space — allocates an array of length n; clearer functional style. */
export function sum_to_n_c(n: number): number {
  requireNonNegative(n, "sum_to_n_c");
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (acc, x) => acc + x,
    0,
  );
}
