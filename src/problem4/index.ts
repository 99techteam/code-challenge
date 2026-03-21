/**
 * Problem 4: Three ways to sum to n
 * Summation from 1 to n: sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15
 * Handles positive integers, negative integers, and zero.
 */

/**
 * Implementation A: Gauss closed-form formula
 *
 * For n >= 0: n * (n + 1) / 2  (standard arithmetic series)
 * For n <  0: -(|n| * (|n| + 1) / 2)  (symmetric signed sum toward -1)
 *
 * Time complexity:  O(1) — single arithmetic expression, no iteration
 * Space complexity: O(1) — no additional memory
 */
export function sum_to_n_a(n: number): number {
  const abs = Math.abs(n);
  return Math.sign(n) * (abs * (abs + 1)) / 2;
}

/**
 * Implementation B: Iterative loop
 *
 * Accumulates the sum by iterating from 1 to n (or n to -1 for negatives).
 *
 * Time complexity:  O(n) — linear, one pass through all integers up to n
 * Space complexity: O(1) — only a single accumulator variable
 */
export function sum_to_n_b(n: number): number {
  let sum = 0;
  if (n >= 0) {
    for (let i = 1; i <= n; i++) {
      sum += i;
    }
  } else {
    for (let i = -1; i >= n; i--) {
      sum += i;
    }
  }
  return sum;
}

/**
 * Implementation C: Recursive
 *
 * Recursively sums by reducing n toward 0 on each call.
 *
 * Time complexity:  O(n) — n recursive calls on the call stack
 * Space complexity: O(n) — each call frame is kept on the stack until unwinding;
 *                          this can cause a stack overflow for very large |n|
 */
export function sum_to_n_c(n: number): number {
  if (n === 0) return 0;
  if (n > 0) return n + sum_to_n_c(n - 1);
  return n + sum_to_n_c(n + 1);
}
