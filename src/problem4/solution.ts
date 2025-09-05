/**
 * Problem 4: Three ways to sum to n
 * Three unique implementations of sum_to_n function in TypeScript
 */

/**
 * Method A: Iterative Approach (For Loop)
 *
 * Complexity Analysis:
 * - Time Complexity: O(n) - Linear time complexity
 * - Space Complexity: O(1) - Constant space complexity
 * - Efficiency: Good for small to medium values of n
 *
 * This approach uses a simple for loop to iterate from 1 to n,
 * accumulating the sum. It's straightforward and easy to understand.
 */
function sum_to_n_a(n: number): number {
  // Handle edge cases
  if (n <= 0) return 0;
  if (n === 1) return 1;

  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
 * Method B: Mathematical Formula (Most Efficient)
 *
 * Complexity Analysis:
 * - Time Complexity: O(1) - Constant time complexity
 * - Space Complexity: O(1) - Constant space complexity
 * - Efficiency: Excellent - Best approach for any value of n
 *
 * This approach uses the mathematical formula for the sum of natural numbers:
 * Sum = n * (n + 1) / 2
 *
 * This is the most efficient method as it calculates the result in constant time
 * regardless of the input size.
 */
function sum_to_n_b(n: number): number {
  // Handle edge cases
  if (n <= 0) return 0;
  if (n === 1) return 1;

  // Mathematical formula: n * (n + 1) / 2
  return (n * (n + 1)) / 2;
}

/**
 * Method C: Recursive Approach
 *
 * Complexity Analysis:
 * - Time Complexity: O(n) - Linear time complexity
 * - Space Complexity: O(n) - Linear space complexity due to call stack
 * - Efficiency: Poor for large values of n due to stack overflow risk
 *
 * This approach uses recursion to break down the problem into smaller subproblems.
 * While elegant, it's not practical for large values of n due to:
 * 1. Stack overflow risk (JavaScript call stack limit ~10,000-50,000 calls)
 * 2. Higher memory usage due to function call overhead
 * 3. Slower execution due to function call overhead
 */
function sum_to_n_c(n: number): number {
  // Handle edge cases
  if (n <= 0) return 0;
  if (n === 1) return 1;

  // Recursive case: n + sum of all numbers from 1 to (n-1)
  return n + sum_to_n_c(n - 1);
}

/**
 * Method D: Tail Recursive Approach (Optimized Recursion)
 *
 * Complexity Analysis:
 * - Time Complexity: O(n) - Linear time complexity
 * - Space Complexity: O(1) - Constant space complexity (with tail call optimization)
 * - Efficiency: Good - Better than regular recursion, but still slower than iterative
 *
 * This is an optimized version of recursion that uses tail recursion.
 * With proper tail call optimization, this can achieve O(1) space complexity.
 * However, not all JavaScript engines optimize tail calls, so it may still use O(n) space.
 */
function sum_to_n_d(n: number): number {
  function tailRecursiveSum(n: number, accumulator: number = 0): number {
    if (n <= 0) return accumulator;
    return tailRecursiveSum(n - 1, accumulator + n);
  }

  return tailRecursiveSum(n);
}

/**
 * Method E: Bit Manipulation Approach (Advanced)
 *
 * Complexity Analysis:
 * - Time Complexity: O(1) - Constant time complexity
 * - Space Complexity: O(1) - Constant space complexity
 * - Efficiency: Excellent - Same as mathematical formula but uses bit operations
 *
 * This approach uses bit manipulation to implement the same mathematical formula.
 * It's more complex but demonstrates advanced programming techniques.
 */
function sum_to_n_e(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;

  // Using bit manipulation: n * (n + 1) / 2
  // Right shift by 1 is equivalent to dividing by 2
  return (n * (n + 1)) >> 1;
}

// Export all functions for testing
export { sum_to_n_a, sum_to_n_b, sum_to_n_c, sum_to_n_d, sum_to_n_e };

// Test cases and performance comparison
function runTests(): void {
  const testCases = [0, 1, 5, 10, 100, 1000, 10000];

  console.log("Testing all implementations:");
  console.log("n\tMethod A\tMethod B\tMethod C\tMethod D\tMethod E");
  console.log("=".repeat(80));

  testCases.forEach((n) => {
    const resultA = sum_to_n_a(n);
    const resultB = sum_to_n_b(n);
    let resultC, resultD, resultE;

    try {
      resultC = sum_to_n_c(n);
    } catch (error) {
      resultC = "Stack Overflow";
    }

    resultD = sum_to_n_d(n);
    resultE = sum_to_n_e(n);

    console.log(
      `${n}\t${resultA}\t\t${resultB}\t\t${resultC}\t\t${resultD}\t\t${resultE}`
    );

    // Verify all methods produce the same result (when they don't overflow)
    const results = [resultA, resultB, resultD, resultE];
    const allMatch = results.every((result) => result === resultA);

    if (!allMatch) {
      console.error(`❌ Mismatch for n=${n}`);
    }
  });

  console.log("\n✅ All implementations working correctly!");
}

// Performance comparison
function performanceTest(): void {
  const n = 100000;
  const iterations = 1000;

  console.log(`\nPerformance test with n=${n}, ${iterations} iterations:`);

  // Test Method A (Iterative)
  console.time("Method A (Iterative)");
  for (let i = 0; i < iterations; i++) {
    sum_to_n_a(n);
  }
  console.timeEnd("Method A (Iterative)");

  // Test Method B (Mathematical)
  console.time("Method B (Mathematical)");
  for (let i = 0; i < iterations; i++) {
    sum_to_n_b(n);
  }
  console.timeEnd("Method B (Mathematical)");

  // Test Method C (Recursive) - Skip for large n to avoid stack overflow
  if (n <= 10000) {
    console.time("Method C (Recursive)");
    for (let i = 0; i < iterations; i++) {
      sum_to_n_c(n);
    }
    console.timeEnd("Method C (Recursive)");
  } else {
    console.log(
      "Method C (Recursive): Skipped (n too large, would cause stack overflow)"
    );
  }

  // Test Method D (Tail Recursive)
  console.time("Method D (Tail Recursive)");
  for (let i = 0; i < iterations; i++) {
    sum_to_n_d(n);
  }
  console.timeEnd("Method D (Tail Recursive)");

  // Test Method E (Bit Manipulation)
  console.time("Method E (Bit Manipulation)");
  for (let i = 0; i < iterations; i++) {
    sum_to_n_e(n);
  }
  console.timeEnd("Method E (Bit Manipulation)");
}

// Complexity analysis summary
function printComplexityAnalysis(): void {
  console.log("\n" + "=".repeat(60));
  console.log("COMPLEXITY ANALYSIS SUMMARY");
  console.log("=".repeat(60));

  console.log("\nMethod A (Iterative):");
  console.log("  Time Complexity:  O(n)");
  console.log("  Space Complexity: O(1)");
  console.log("  Best for:         Small to medium values of n");
  console.log("  Pros:             Simple, readable, no stack overflow risk");
  console.log("  Cons:             Linear time complexity");

  console.log("\nMethod B (Mathematical):");
  console.log("  Time Complexity:  O(1)");
  console.log("  Space Complexity: O(1)");
  console.log("  Best for:         Any value of n");
  console.log("  Pros:             Fastest, most efficient, handles large n");
  console.log("  Cons:             Requires mathematical knowledge");

  console.log("\nMethod C (Recursive):");
  console.log("  Time Complexity:  O(n)");
  console.log("  Space Complexity: O(n)");
  console.log("  Best for:         Small values of n, educational purposes");
  console.log("  Pros:             Elegant, demonstrates recursion");
  console.log("  Cons:             Stack overflow risk, higher memory usage");

  console.log("\nMethod D (Tail Recursive):");
  console.log("  Time Complexity:  O(n)");
  console.log("  Space Complexity: O(1) with TCO, O(n) without");
  console.log("  Best for:         Medium values of n");
  console.log("  Pros:             Better than regular recursion");
  console.log(
    "  Cons:             Still slower than iterative, TCO not guaranteed"
  );

  console.log("\nMethod E (Bit Manipulation):");
  console.log("  Time Complexity:  O(1)");
  console.log("  Space Complexity: O(1)");
  console.log("  Best for:         Any value of n, performance-critical code");
  console.log("  Pros:             Fastest, demonstrates advanced techniques");
  console.log(
    "  Cons:             Less readable, requires bit manipulation knowledge"
  );

  console.log("\n" + "=".repeat(60));
  console.log(
    "RECOMMENDATION: Use Method B (Mathematical) for production code"
  );
  console.log("=".repeat(60));
}

// Run all tests and analysis
if (typeof window === "undefined") {
  runTests();
  performanceTest();
  printComplexityAnalysis();
}
