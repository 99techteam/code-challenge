/**
 * Sum positive integers from 1 to n. For n <= 0 the empty sum is 0.
 * O(n) time, O(1) auxiliary space.
 */
export function sum_to_n_a(n: number): number {
  validate(n);
  let total = 0;
  for (let i = 1; i <= n; i++) total += i;
  return total;
}

/**
 * Arithmetic series formula. O(1) time, O(1) auxiliary space.
 * Divides one factor first to avoid an unnecessarily large intermediate product.
 */
export function sum_to_n_b(n: number): number {
  validate(n);
  if (n <= 0) return 0;
  return n % 2 === 0 ? (n / 2) * (n + 1) : n * ((n + 1) / 2);
}

/**
 * Balanced recursive summation. O(n) time, O(log n) call stack.
 * Each leaf contributes one integer; unlike linear recursion the stack remains shallow.
 */
export function sum_to_n_c(n: number): number {
  validate(n);
  if (n <= 0) return 0;
  function sumRange(lo: number, hi: number): number {
    if (lo === hi) return lo;
    const mid = lo + Math.floor((hi - lo) / 2);
    return sumRange(lo, mid) + sumRange(mid + 1, hi);
  }
  return sumRange(1, n);
}

function validate(n: number): void {
  if (!Number.isSafeInteger(n)) throw new RangeError('n must be a safe integer');
  // The brief guarantees that the result is a safe integer for relevant inputs.
}
