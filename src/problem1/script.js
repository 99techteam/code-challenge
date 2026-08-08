/**
 * Validates input to ensure it's a safe integer
 * @param {number} n - The input number to validate
 * @throws {TypeError} If input is not a number
 * @throws {RangeError} If input is not an integer or exceeds safe range
 */
const validateInput = (n) => {
  if (typeof n !== "number") {
    throw new TypeError(`Expected number, got ${typeof n}`);
  }

  if (!Number.isFinite(n)) {
    throw new RangeError("Input must be a finite number");
  }

  if (!Number.isInteger(n)) {
    throw new RangeError("Input must be an integer");
  }

  // Check if result would exceed safe integer range
  // Using the formula: n * (n + 1) / 2
  const absN = Math.abs(n);
  if (absN > 0 && absN * (absN + 1) > Number.MAX_SAFE_INTEGER * 2) {
    throw new RangeError(
      `Input ${n} would produce a result exceeding MAX_SAFE_INTEGER`,
    );
  }
};

/**
 * Approach A: Iterative summation using for loop
 *
 * Pros:
 * - Clear and readable
 * - Good performance: O(n) time, O(1) space
 * - Easy to debug
 * - Works well for all sizes
 *
 * Cons:
 * - Slower than mathematical formula for large n
 *
 * Use case: When readability and debugging are priorities
 *
 * @param {number} n - Any integer
 * @returns {number} Sum from 1 to n (or -1 to n if negative)
 */
const sum_to_n_a = (n) => {
  validateInput(n);

  // Handle edge cases
  if (n === 0) return 0;

  // For negative numbers, sum from -1 down to n
  const isNegative = n < 0;
  const absN = Math.abs(n);

  let sum = 0;
  for (let i = 1; i <= absN; i++) {
    sum += i;
  }
  return isNegative ? -sum : sum;
};

/**
 * Approach B: Functional approach using Array methods
 *
 * Pros:
 * - Modern, declarative style
 * - Follows functional programming paradigm
 * - Immutable and composable
 *
 * Cons:
 * - O(n) space complexity (creates array)
 * - Slower due to array creation and iteration
 * - Not suitable for very large n
 *
 * Use case: When working in functional programming style or small datasets
 *
 * @param {number} n - Any integer
 * @returns {number} Sum from 1 to n (or -1 to n if negative)
 */
const sum_to_n_b = (n) => {
  validateInput(n);

  if (n === 0) return 0;

  const isNegative = n < 0;
  const absN = Math.abs(n);

  const sum = Array.from({ length: absN }, (_, i) => i + 1).reduce(
    (acc, curr) => acc + curr,
    0,
  );
  return isNegative ? -sum : sum;
};

/**
 * Approach C: Mathematical formula (Gauss formula)
 *
 * Pros:
 * - Optimal performance: O(1) time and space
 * - Most efficient for any size of n
 * - Elegant and concise
 *
 * Cons:
 * - Less obvious for developers unfamiliar with the formula
 * - Requires understanding of mathematical concept
 *
 * Use case: Production code where performance matters (RECOMMENDED)
 * Formula: sum = n * (n + 1) / 2
 *
 * @param {number} n - Any integer
 * @returns {number} Sum from 1 to n (or -1 to n if negative)
 */
const sum_to_n_c = (n) => {
  validateInput(n);

  if (n === 0) return 0;

  const isNegative = n < 0;
  const absN = Math.abs(n);

  const sum = (absN * (absN + 1)) / 2;
  return isNegative ? -sum : sum;
};

// ============================================================================
// TESTING & DEMONSTRATION
// ============================================================================

/**
 * Test suite to verify all implementations
 */
const runTests = () => {
  console.log("=".repeat(60));
  console.log("TESTING ALL IMPLEMENTATIONS");
  console.log("=".repeat(60));

  const testCases = [
    { input: 5, expected: 15, description: "Positive small number" },
    { input: 0, expected: 0, description: "Zero" },
    { input: -5, expected: -15, description: "Negative number" },
    { input: 1, expected: 1, description: "Edge case: 1" },
    { input: 100, expected: 5050, description: "Larger number" },
    { input: 1000, expected: 500500, description: "Very large number" },
  ];

  const implementations = [
    { name: "sum_to_n_a (Iterative)", fn: sum_to_n_a },
    { name: "sum_to_n_b (Functional)", fn: sum_to_n_b },
    { name: "sum_to_n_c (Mathematical)", fn: sum_to_n_c },
  ];

  let allPassed = true;

  testCases.forEach(({ input, expected, description }) => {
    console.log(`\nTest: ${description} (n=${input})`);
    implementations.forEach(({ name, fn }) => {
      try {
        const result = fn(input);
        const passed = result === expected;
        allPassed = allPassed && passed;
        console.log(
          `  ${passed ? "✓" : "✗"} ${name}: ${result} ${
            passed ? "" : `(expected ${expected})`
          }`,
        );
      } catch (error) {
        allPassed = false;
        console.log(`  ✗ ${name}: ERROR - ${error.message}`);
      }
    });
  });

  console.log("\n" + "=".repeat(60));
  console.log(allPassed ? "✓ ALL TESTS PASSED" : "✗ SOME TESTS FAILED");
  console.log("=".repeat(60));
};
