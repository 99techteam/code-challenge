/**
 * Problem 1: Three Ways to Sum to N
 *
 * Input:  n — a positive integer
 * Output: 1 + 2 + 3 + ... + n
 *
 * Assumption: input always produces result < Number.MAX_SAFE_INTEGER
 */

// =============================================================================
// Implementation A: Gauss's Formula (Mathematical)
// =============================================================================
/**
 * Uses the closed-form arithmetic series formula: n * (n + 1) / 2
 *
 * Explanation:
 *   Pair the sequence from both ends: (1+n) + (2+n-1) + ...
 *   There are n/2 such pairs, each summing to (n+1), giving n*(n+1)/2.
 *   No loops needed — a single arithmetic expression does the job.
 *
 * Time Complexity:  O(1)
 * Space Complexity: O(1)
 */
var sum_to_n_a = function (n) {
  return (n * (n + 1)) / 2;
};

// =============================================================================
// Implementation B: Iterative Loop
// =============================================================================
/**
 * Accumulates the sum by looping from 1 up to n.
 *
 * Explanation:
 *   The most straightforward approach — iterate and add each integer.
 *   Easy to read, trace, and debug; no recursion overhead.
 *
 * Time Complexity:  O(n)
 * Space Complexity: O(1)
 */
var sum_to_n_b = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// =============================================================================
// Implementation C: Recursive
// =============================================================================
/**
 * Recursively defines the sum via: sum(n) = n + sum(n - 1), base: sum(0) = 0
 *
 * Explanation:
 *   Naturally mirrors the mathematical definition of the summation.
 *   Each call reduces n by 1 until the base case is reached.
 *   Note: not ideal for very large n due to call stack limits.
 *
 * Time Complexity:  O(n)
 * Space Complexity: O(n)
 */
var sum_to_n_c = function (n) {
  if (n === 0) return 0;
  return n + sum_to_n_c(n - 1);
};

// =============================================================================
// Test Suite
// =============================================================================

const implementations = [
  { name: "sum_to_n_a (Gauss Formula) ", fn: sum_to_n_a },
  { name: "sum_to_n_b (Iterative Loop)", fn: sum_to_n_b },
  { name: "sum_to_n_c (Recursive)     ", fn: sum_to_n_c },
];

const testCases = [
  { input: 1, expected: 1, label: "n=1   → 1" },
  { input: 5, expected: 15, label: "n=5   → 1+2+3+4+5" },
  { input: 10, expected: 55, label: "n=10  → 1+...+10" },
  { input: 100, expected: 5050, label: "n=100 → Gauss classic" },
  { input: 0, expected: 0, label: "n=0   → empty sum" },
];

let allPassed = true;

console.log("=".repeat(58));
console.log("  Running Tests for sum_to_n implementations");
console.log("=".repeat(58));

for (const { name, fn } of implementations) {
  console.log(`\n>> ${name}`);
  console.log("-".repeat(58));

  for (const { input, expected, label } of testCases) {
    const result = fn(input);
    const passed = result === expected;
    if (!passed) allPassed = false;

    const status = passed ? "PASS" : "FAIL";
    console.log(
      `  [${status}]  ${label.padEnd(28)} got: ${result}, expected: ${expected}`
    );
  }
}

console.log("\n" + "=".repeat(58));
console.log(allPassed ? "  ALL TESTS PASSED" : "  SOME TESTS FAILED");
console.log("=".repeat(58));
