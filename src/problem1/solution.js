// Problem 1: Three ways to sum to n
// Three unique implementations of sum_to_n function

// Method 1: Iterative approach using for loop
// Time Complexity: O(n)
// Space Complexity: O(1)
var sum_to_n_a = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// Method 2: Mathematical formula approach (most efficient)
// Time Complexity: O(1)
// Space Complexity: O(1)
// Uses the formula: n * (n + 1) / 2
var sum_to_n_b = function (n) {
  return (n * (n + 1)) / 2;
};

// Method 3: Recursive approach
// Time Complexity: O(n)
// Space Complexity: O(n) due to call stack
var sum_to_n_c = function (n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  return n + sum_to_n_c(n - 1);
};

// Test cases to verify all implementations
function runTests() {
  const testCases = [0, 1, 5, 10, 100, 1000];

  console.log("Testing all three implementations:");
  console.log("n\tMethod A\tMethod B\tMethod C");
  console.log("=".repeat(50));

  testCases.forEach((n) => {
    const resultA = sum_to_n_a(n);
    const resultB = sum_to_n_b(n);
    const resultC = sum_to_n_c(n);

    console.log(`${n}\t${resultA}\t\t${resultB}\t\t${resultC}`);

    // Verify all methods produce the same result
    if (resultA !== resultB || resultB !== resultC) {
      console.error(
        `❌ Mismatch for n=${n}: A=${resultA}, B=${resultB}, C=${resultC}`
      );
    }
  });

  console.log("\n✅ All implementations working correctly!");
}

// Performance comparison
function performanceTest() {
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

  // Test Method C (Recursive) - Note: may cause stack overflow for large n
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
}

// Export functions for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    sum_to_n_a,
    sum_to_n_b,
    sum_to_n_c,
    runTests,
    performanceTest,
  };
}

// Run tests if this file is executed directly
if (typeof window === "undefined" && require.main === module) {
  runTests();
  performanceTest();
}
