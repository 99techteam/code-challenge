/**
 * Problem 1: Three ways to sum to n
 *
 * Assumptions:
 * - n is an integer.
 * - n is non-negative.
 * - Result is less than Number.MAX_SAFE_INTEGER.
 */

var sum_to_n_a = function (n) {
  // Iterative loop (O(n) time, O(1) space)
  var sum = 0;
  for (var i = 1; i <= n; i += 1) {
    sum += i;
  }
  return sum;
};

var sum_to_n_b = function (n) {
  // Mathematical formula (O(1) time, O(1) space)
  return (n * (n + 1)) / 2;
};

var sum_to_n_c = function (n) {
  // Recursion (O(n) time, O(n) call stack)
  if (n <= 1) return n;
  return n + sum_to_n_c(n - 1);
};


const runTests = () => {

  const testCases = [
    { input: 0, expected: 0 },
    { input: 1, expected: 1 },
    { input: 5, expected: 15 },
    { input: 10, expected: 55 },
    { input: 100, expected: 5050 }
];

const implementations = [
    { name: "Iterative", fn: sum_to_n_a },
    { name: "Formula", fn: sum_to_n_b },
    { name: "Functional", fn: sum_to_n_c }
];

console.log("Running Tests...\n");

testCases.forEach(({ input, expected }) => {
    console.log(`Test n = ${input} (expected: ${expected})`);
    implementations.forEach(({ name, fn }) => {
        const result = fn(input);
        const pass = result === expected;
        console.log(
            `  ${name.padEnd(12)} → ${result} ${pass ? "✅ PASS" : "❌ FAIL"}`
        );
    });
    console.log("");
});

console.log("All tests completed.");
};

runTests();