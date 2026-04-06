/**
 * Problem 4 — Three Ways to Sum to N
 *
 * Given a positive integer n, return the sum of all integers from 1 to n.
 * Assumes n is a positive integer; returns 0 for non-positive or non-finite inputs.
 */

// Approach A — Iterative (for-loop)
// Time: O(n)  |  Space: O(1)
function sum_to_n_a(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  const safeN = Math.floor(n);
  let sum = 0;
  for (let i = 1; i <= safeN; i++) {
    sum += i;
  }
  return sum;
}

// Approach B — Closed-form (Gauss formula: n*(n+1)/2)
// Time: O(1)  |  Space: O(1)
function sum_to_n_b(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  const safeN = Math.floor(n);
  return (safeN * (safeN + 1)) / 2;
}

// Approach C — Recursive
// Time: O(n)  |  Space: O(n) — one stack frame per call
function sum_to_n_c(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  const safeN = Math.floor(n);
  if (safeN === 1) return 1;
  return safeN + sum_to_n_c(safeN - 1);
}

// ─── Test Runner ────────────────────────────────────────────────────────────

type TestCase = { input: number; expected: number };

const testCases: TestCase[] = [
  { input: 1, expected: 1 },
  { input: 2, expected: 3 },
  { input: 5, expected: 15 },
  { input: 10, expected: 55 },
  { input: 100, expected: 5050 },
  { input: 0, expected: 0 },
  { input: -5, expected: 0 },
  { input: 3.9, expected: 6 }, // floor(3.9) = 3, sum = 6
];

const implementations: Array<{ name: string; fn: (n: number) => number }> = [
  { name: "A (Iterative)", fn: sum_to_n_a },
  { name: "B (Gauss formula)", fn: sum_to_n_b },
  { name: "C (Recursive)", fn: sum_to_n_c },
];

console.log("Problem 4 — Three Ways to Sum to N\n");
console.log("=".repeat(56));

let allPassed = true;

for (const { input, expected } of testCases) {
  const results = implementations.map(({ name, fn }) => ({
    name,
    result: fn(input),
  }));

  const allMatch = results.every(({ result }) => result === expected);
  const status = allMatch ? "PASS" : "FAIL";
  if (!allMatch) allPassed = false;

  console.log(`\n[${status}] sum_to_n(${input}) — expected: ${expected}`);
  for (const { name, result } of results) {
    const marker = result === expected ? "✓" : "✗";
    console.log(`  ${marker} ${name}: ${result}`);
  }
}

console.log("\n" + "=".repeat(56));
console.log(allPassed ? "All tests passed!" : "Some tests FAILED.");
