/**
 * Problem 1: Three unique implementations of `sum_to_n`.
 *
 * Task:
 *   Input:  n - any integer (result assumed < Number.MAX_SAFE_INTEGER).
 *   Output: summation to n, e.g. sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15.
 *
 * Negative-n convention (applied CONSISTENTLY across all three):
 *   - sum_to_n(0)  === 0
 *   - For n > 0: sum of 1..n            -> sum_to_n(5)  === 15
 *   - For n < 0: sum of n..-1           -> sum_to_n(-3) === (-3)+(-2)+(-1) === -6
 *   All three implementations honour this convention. Note the closed form
 *   needs a sign-aware variant (see sum_to_n_b) because the bare n*(n+1)/2
 *   does not produce -6 for n = -3.
 *
 * Complexity summary:
 *   a) iterative for-loop : O(n) time,  O(1) space
 *   b) closed-form (Gauss): O(1) time,  O(1) space
 *   c) recursion          : O(n) time,  O(n) stack space
 */

// a) Iterative for-loop.
//    Walks either 1..n (n > 0) or n..-1 (n < 0), accumulating a running sum.
//    O(n) time, O(1) space.
var sum_to_n_a = function (n) {
  let sum = 0;
  if (n >= 0) {
    for (let i = 1; i <= n; i++) sum += i;
  } else {
    for (let i = n; i <= -1; i++) sum += i;
  }
  return sum;
};

// b) Closed-form Gauss formula.
//    For n >= 0 this is the classic triangular number  n*(n+1)/2.
//    NOTE: the *plain* formula n*(n+1)/2 does NOT match our negative
//    convention -- for n = -3 it gives (-3)*(-2)/2 = 3, but we want -6.
//    The convention "sum of n..-1" for n < 0 equals -(|n|*(|n|+1)/2), i.e.
//    the same triangular number negated. So the sign-aware closed form is:
//        sign(n) * |n| * (|n| + 1) / 2
//    which yields 15 for n=5, 0 for n=0, and -6 for n=-3. O(1) time & space.
var sum_to_n_b = function (n) {
  const m = Math.abs(n);
  return Math.sign(n) * (m * (m + 1)) / 2;
};

// c) Recursive / functional approach.
//    Peels one term off toward 0 each call: f(n) = n + f(n -/+ 1).
//    O(n) time, O(n) call-stack space.
var sum_to_n_c = function (n) {
  if (n === 0) return 0;
  if (n > 0) return n + sum_to_n_c(n - 1);
  return n + sum_to_n_c(n + 1);
};

// --- Sanity checks (runnable with `node sum_to_n.js`) --------------------
const cases = [
  [5, 15],
  [1, 1],
  [0, 0],
  [10, 55],
  [100, 5050],
  [-1, -1],
  [-3, -6],
  [-100, -5050],
];

for (const [n, expected] of cases) {
  console.assert(sum_to_n_a(n) === expected, `a(${n}) => ${sum_to_n_a(n)}, want ${expected}`);
  console.assert(sum_to_n_b(n) === expected, `b(${n}) => ${sum_to_n_b(n)}, want ${expected}`);
  console.assert(sum_to_n_c(n) === expected, `c(${n}) => ${sum_to_n_c(n)}, want ${expected}`);
  console.assert(
    sum_to_n_a(n) === sum_to_n_b(n) && sum_to_n_b(n) === sum_to_n_c(n),
    `disagreement at n=${n}`
  );
}

console.log("all checks passed");
