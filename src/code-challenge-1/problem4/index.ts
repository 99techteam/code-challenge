/**
 * Problem 4: Three ways to sum to n (TypeScript)
 *
 * Provide 3 unique implementations of the following function in TypeScript.
 * Input:  n - any integer
 * Output: return - summation to n, i.e. sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15
 *
 * Assuming this input will always produce a result lesser than Number.MAX_SAFE_INTEGER.
 */

/**
 * Implementation A: Gauss closed-form formula
 *
 * Uses the triangular number identity: Σ(1..n) = n*(n+1)/2
 *
 * Complexity:
 *   Time  — O(1): a single arithmetic expression regardless of n.
 *   Space — O(1): no auxiliary data structures.
 *
 * This is the most efficient implementation. Preferred for production use.
 */
function sum_to_n_a(n: number): number {
  return (n * (n + 1)) / 2;
}

/**
 * Implementation B: Iterative accumulation
 *
 * Adds each integer from 1 to n into a running total.
 *
 * Complexity:
 *   Time  — O(n): one iteration per integer in [1, n].
 *   Space — O(1): only a single accumulator variable is allocated.
 *
 * Straightforward and easy to reason about. Suitable when the formula is
 * not immediately obvious to the reader.
 */
function sum_to_n_b(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
 * Implementation C: Recursive with tail-call style
 *
 * Recursively adds n to the sum of (n-1), bottoming out at n === 0.
 *
 * Complexity:
 *   Time  — O(n): n recursive calls on the call stack.
 *   Space — O(n): each call frame is retained until the base case is reached
 *                 (JavaScript engines do not guarantee tail-call optimisation,
 *                 so this will stack-overflow for very large n).
 *
 * Demonstrates recursion clearly but is the least practical of the three for
 * large inputs due to stack depth.
 */
function sum_to_n_c(n: number): number {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
}

export { sum_to_n_a, sum_to_n_b, sum_to_n_c };
