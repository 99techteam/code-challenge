/**
 * Three implementations of sum_to_n(n) that return 1 + 2 + ... + n.
 *
 * Tradeoffs:
 *  - sum_to_n_a (loop):      simple and predictable, O(n) time / O(1) space.
 *  - sum_to_n_b (formula):   fastest, O(1) time / O(1) space, no iteration.
 *  - sum_to_n_c (recursion): elegant but risks stack overflow for very large n,
 *                            O(n) time / O(n) space due to the call stack.
 */

// Iterative for-loop accumulation. Time: O(n), Space: O(1).
function sum_to_n_a(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) total += i;
  return total;
}

// Closed-form Gauss formula n*(n+1)/2. Time: O(1), Space: O(1).
function sum_to_n_b(n) {
  return (n * (n + 1)) / 2;
}

// Recursive definition sum(n) = n + sum(n-1). Time: O(n), Space: O(n) call stack.
function sum_to_n_c(n) {
  if (n <= 1) return n;
  return n + sum_to_n_c(n - 1);
}

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };

// Tiny self-test, only runs when this file is executed directly via `node`.
if (require.main === module) {
  console.log('sum_to_n_a(5)   =', sum_to_n_a(5));     // expect 15
  console.log('sum_to_n_b(100) =', sum_to_n_b(100));   // expect 5050
  console.log('sum_to_n_c(10)  =', sum_to_n_c(10));    // expect 55
}
