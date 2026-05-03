/**
 * Three implementations of `sum_to_n`.
 *
 * Contract:
 *   Input  : n — any integer (positive, zero, or negative).
 *   Output : sum of integers from 1..n inclusive when n > 0,
 *            0 when n === 0,
 *            sum of integers from n..-1 inclusive (i.e. -1 + -2 + ... + n) when n < 0.
 *   Assumption: |result| < Number.MAX_SAFE_INTEGER (per the brief).
 *
 * The three implementations differ in algorithmic approach so the trade-offs
 * are visible side-by-side. All three return identical values for the same
 * input — see `sum_to_n.test.ts` for property-style verification.
 */

const MAX_SAFE = Number.MAX_SAFE_INTEGER;

function assertInteger(n: number): void {
  if (!Number.isInteger(n)) {
    throw new TypeError(`sum_to_n: n must be an integer, got ${n}`);
  }
}

/**
 * Approach A — iterative accumulator.
 *
 * Time  : O(n)   — one addition per step.
 * Space : O(1)   — single accumulator variable.
 *
 * Pros : easiest to read; trivially correct; no allocation.
 * Cons : linear in |n|; slow for very large inputs.
 *
 * Negative `n` is handled by iterating from -1 down to n.
 */
export function sumToN_iter(n: number): number {
  assertInteger(n);
  let total = 0;
  if (n >= 0) {
    for (let i = 1; i <= n; i++) total += i;
  } else {
    for (let i = -1; i >= n; i--) total += i;
  }
  return total;
}

/**
 * Approach B — closed-form (Gauss) formula.
 *
 * Time  : O(1).
 * Space : O(1).
 *
 * Pros : optimal; constant work regardless of n.
 * Cons : relies on integer arithmetic staying inside Number.MAX_SAFE_INTEGER.
 *        We validate the bound up front so a violation is loud, not silent.
 *
 * Identity: 1 + 2 + ... + n = n * (n + 1) / 2.
 * The same identity flips sign cleanly for negative n: e.g. n=-3 gives -3*-2/2 = 3,
 * but the *signed* sum we want is (-1) + (-2) + (-3) = -6. We therefore compute
 * over |n| and re-apply the sign.
 */
export function sumToN_formula(n: number): number {
  assertInteger(n);
  const sign = Math.sign(n);
  const m = Math.abs(n);
  // Overflow check: we need m*(m+1) <= 2*MAX_SAFE for the result (after /2)
  // to remain a safe integer. Solve m*(m+1) <= 2*MAX_SAFE for the largest m:
  //   m_max = floor((sqrt(8*MAX_SAFE + 1) - 1) / 2)
  // Computed once at module load.
  if (m > MAX_M) {
    throw new RangeError(`sum_to_n: |n|=${m} would overflow MAX_SAFE_INTEGER`);
  }
  return (sign * (m * (m + 1))) / 2;
}

const MAX_M = Math.floor((Math.sqrt(8 * MAX_SAFE + 1) - 1) / 2);

/**
 * Approach C — functional reduce over a generated range.
 *
 * Time  : O(n).
 * Space : O(n) — Array.from materialises the full range.
 *
 * Pros : declarative; reads as "sum of the range"; useful when you want to
 *        compose other transforms (filter, map) on the same range.
 * Cons : allocates an n-element array; worst space profile of the three.
 *        Demonstrative only — for production prefer Approach B.
 */
export function sumToN_reduce(n: number): number {
  assertInteger(n);
  if (n === 0) return 0;
  const length = Math.abs(n);
  const direction = Math.sign(n);
  return Array.from({ length }, (_, i) => (i + 1) * direction).reduce(
    (acc, x) => acc + x,
    0,
  );
}
