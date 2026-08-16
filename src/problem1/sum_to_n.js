/**
 * Problem 1: Three ways to sum to n
 *
 * Input: n - any integer
 * Assumption: the result is always < Number.MAX_SAFE_INTEGER.
 * Output: sum of integers from 1 to n, e.g. sum_to_n(5) === 1+2+3+4+5 === 15.
 *
 * These implementations assume n >= 0, consistent with the "sum to n" spec
 * (there is no natural summation from 1 to a negative n).
 */

// A. Iterative loop — O(n) time, O(1) space.
// Most straightforward and easy to read; fine for small/medium n.
var sum_to_n_a = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// B. Mathematical formula (Gauss' sum) — O(1) time, O(1) space.
// The fastest option, no loop needed: n * (n + 1) / 2.
var sum_to_n_b = function (n) {
  return (n * (n + 1)) / 2;
};

// C. Recursive — O(n) time, O(n) space (call stack).
// Demonstrates a functional/recursive approach. Not suitable for very large n
// (risks a stack overflow), but included as a distinct technique from A and B.
var sum_to_n_c = function (n) {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
};

// Runs a shared set of test cases through all three implementations and
// checks that they agree, so a regression in any one of them is obvious.
//
// sum_to_n_c is recursive, so it's only exercised for n small enough to fit
// the call stack; sum_to_n_a/b (loop/formula) are also checked against much
// larger n, where a naive recursive approach would overflow the stack.
function runTestCases() {
  const recursionSafeCases = [0, 1, 5, 10, 100, 1000];
  const largeOnlyCases = [1_000_000, 12345678];
  let allPassed = true;

  for (const n of recursionSafeCases) {
    const a = sum_to_n_a(n);
    const b = sum_to_n_b(n);
    const c = sum_to_n_c(n);
    const expected = (n * (n + 1)) / 2;
    const passed = a === expected && b === expected && c === expected;
    allPassed = allPassed && passed;

    console.log(
      `sum_to_n(${n}) => a=${a} b=${b} c=${c} expected=${expected} ${
        passed ? "PASS" : "FAIL"
      }`
    );
  }

  for (const n of largeOnlyCases) {
    const a = sum_to_n_a(n);
    const b = sum_to_n_b(n);
    const expected = (n * (n + 1)) / 2;
    const passed = a === expected && b === expected;
    allPassed = allPassed && passed;

    console.log(
      `sum_to_n(${n}) => a=${a} b=${b} expected=${expected} (c skipped: would overflow the call stack) ${
        passed ? "PASS" : "FAIL"
      }`
    );
  }

  console.log(allPassed ? "\nAll test cases passed." : "\nSome test cases failed.");
  return allPassed;
}

runTestCases();

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c, runTestCases };
