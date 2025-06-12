/**
 * Helper function to validate input and handle base cases
 * Returns null if should continue processing, or the result value if early return
 */
const validateAndHandleBaseCases = (n: number): number | null => {
  if (typeof n !== "number" || isNaN(n)) {
    throw new Error("Input must be a valid number");
  }
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error("Input must be a non-negative integer");
  }

  if (n === 0) return 0;
  if (n === 1) return 1;

  return null;
};

/**
 * sumToN1 - Mathematical Formula Approach
 * Uses the well-known mathematical formula for calculating the sum of consecutive integers from 1 to n.
 * The formula is n*(n+1)/2. This is the most efficient approach with O(1) time complexity.
 */
const sumToN1 = (n: number) => {
  const earlyResult = validateAndHandleBaseCases(n);
  if (earlyResult !== null) return earlyResult;

  return (n * (n + 1)) / 2;
};

/**
 * sumToN1alternative - Bit Shift Optimization
 * This is a variation of the first function that uses a bit shift operation (>> 1) instead of division by 2.
 * Bit shifting right by 1 is equivalent to dividing by 2 but can be slightly faster at the processor level.
 */
const sumToN1alternative = (n: number) => {
  const earlyResult = validateAndHandleBaseCases(n);
  if (earlyResult !== null) return earlyResult;

  return (n * (n + 1)) >> 1;
};

/**
 * sumToN2 - Pairing Method
 * This function implements a pairing approach:
 * - It pairs numbers from the beginning and end (1+n, 2+(n-1), etc.)
 * - Each pair sums to n+1
 * - For even n: there are n/2 pairs, so result is (n+1) * (n/2)
 * - For odd n: there are (n-1)/2 pairs plus the middle number, so it adds the middle value separately
 */
const sumToN2 = (n: number) => {
  const earlyResult = validateAndHandleBaseCases(n);
  if (earlyResult !== null) return earlyResult;

  const firstPlusLast = n + 1;
  const middleNumberValue = n % 2 !== 0 ? Math.ceil(n / 2) : 0;
  return firstPlusLast * Math.floor(n / 2) + middleNumberValue;
};

/**
 * sumToN3 - Recursive Memoization Approach with Closure
 * This function uses closure to maintain a dynamic cache and recursive computation:
 * - Uses recursive formula: sum(n) = n + sum(n-1)
 * - Implements memoization to cache previously computed results
 * - Avoids redundant recursive calls by storing results in a Map
 * - Closure keeps cache private and persistent across function calls
 */
const sumToN3 = (function () {
  const cache = new Map<number, number>();
  return function sum(n: number): number {
    const earlyResult = validateAndHandleBaseCases(n);
    if (earlyResult !== null) return earlyResult;

    if (cache.has(n)) {
      const value = cache.get(n);
      if (value !== undefined) {
        return value;
      }
    }

    const result: number = n + sum(n - 1);
    cache.set(n, result);
    return result;
  };
})();

/**
 * Test function to verify all sumToN implementations
 * Tests with various cases including edge cases and larger numbers
 */
const testSumToNFunctions = () => {
  const testCases = [
    0,
    1,
    2,
    3,
    5,
    10,
    15,
    20,
    100,
    1000,
    1000, // Very large value repeated
  ];

  const functions = [
    { name: "sumToN1", fn: sumToN1 },
    { name: "sumToN1alternative", fn: sumToN1alternative },
    { name: "sumToN2", fn: sumToN2 },
    { name: "sumToN3", fn: sumToN3 },
  ];

  console.log("Testing sumToN functions...\n");

  testCases.forEach((n) => {
    console.log(`Test case: n = ${n}`);
    const results = functions.map(({ name, fn }) => {
      const startTime = performance.now();
      const result = fn(n);
      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(4);
      return { name, result, executionTime };
    });

    // Check if all results are the same
    const firstResult = results[0].result;
    const allSame = results.every((r) => r.result === firstResult);

    results.forEach(({ name, result, executionTime }) => {
      console.log(`${name}: ${result} (${executionTime}ms)`);
    });

    console.log(`All results match: ${allSame ? "true" : "false"}`);
    console.log("");
  });
};

// Run the test
testSumToNFunctions();
