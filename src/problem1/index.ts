/**
 * Calculates the sum of the first n natural numbers using mathematical formula.
 */
const calculateSumUsingFormula = (count: number): number =>
  (count * (count + 1)) >> 1; // equivalent to dividing by 2, but faster

/**
 * Calculates sum using iteration.
 */
const calculateSumUsingIterative = (count: number): number => {
  let accumulator = 0;
  for (let index = 1; index <= count; index++) {
    accumulator += index;
  }
  return accumulator;
};

/**
 * Calculates sum using recursion with memoization for optimization.
 */
const calculateSumUsingRecursive = (
  count: number,
  cache: Map<number, number> = new Map()
): number => {
  if (count === 0) return 0;
  if (cache.has(count)) return cache.get(count)!;

  const result = count + calculateSumUsingRecursive(count - 1, cache);
  cache.set(count, result);
  return result;
};

/**
 * Calculates sum using array reduce (functional approach).
 */
const calculateSumUsingFunct = (count: number): number =>
  count === 0
    ? 0
    : Array.from({ length: count }, (_, index) => index + 1).reduce(
        (acc, val) => acc + val,
        0
      );

// Performance-optimized test runner
const runPerformanceTests = () => {
  const testData = [
    { input: 0, expected: 0 },
    { input: 1, expected: 1 },
    { input: 5, expected: 15 },
    { input: 10, expected: 55 },
    { input: 100, expected: 5050 },
    { input: 1000, expected: 500500 },
  ];

  const algorithms = [
    { name: "Formula", method: calculateSumUsingFormula },
    { name: "Iterative", method: calculateSumUsingIterative },
    { name: "Recursive", method: calculateSumUsingRecursive },
    { name: "Functional", method: calculateSumUsingFunct },
  ];

  algorithms.forEach(({ name, method }) => {
    console.log(`\n${name} Algorithm:`);

    const startTime = performance.now();
    let passedTests = 0;

    testData.forEach(({ input, expected }) => {
      const output = method(input);
      const status = output === expected ? "✅" : "❌";
      console.log(`  ${status} f(${input}) = ${output}`);
      if (output === expected) passedTests++;
    });

    const endTime = performance.now();
    console.log(`  Tests passed: ${passedTests}/${testData.length}`);
    console.log(`  Execution time: ${(endTime - startTime).toFixed(3)}ms`);
  });
};

runPerformanceTests();
