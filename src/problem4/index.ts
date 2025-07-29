/**
 * Method 1: Simple Loop
 * Easy to maintain and change (+, -, *, /, %, etc.), but expected to be slower than Gauss's formula because of the loop 
 * Time complexity: O(n)
 * Space complexity: O(1)
 */
function sum_to_n_a(n: number): number {
  let total = 0;

  // Add each number from 1 to n
  for (let currentNumber = 1; currentNumber <= n; currentNumber++) {
    total += currentNumber;
  }

  return total;
}

/**
 * Method 2: Gauss's formula
 * Should be the fastest because it's a direct formula, no loop or recursion
 * Time: O(1)
 * Space: O(1)
 */
function sum_to_n_b(n: number): number {
  // The magic formula: sum = n × (n + 1) ÷ 2
  return (n * (n + 1)) / 2;
}

/**
 * Method 3: Recursion (has fewest lines of code, but expected to be the slowest)
 * Caution: normally computer can easily calculate the result of sum_to_n_c(100000) but recursion will cause stack overflow (max call stack size)
 * Time complexity: O(n)
 * Space complexity: O(n)
 */
function sum_to_n_c(n: number): number {
  // Stop condition: sum of just 1 is 1
  if (n === 1) {
    return 1;
  }

  // Recursive step: current number + sum of all previous numbers
  return n + sum_to_n_c(n - 1);
}

/**
 * Performance benchmark to measure actual execution times
 */
function benchmarkPerformance(
  sumFunction: (n: number) => number,
  testCases: number[] = [1000, 10000, 100000, 9999, 99999]
) {
  const testResults: { input: number; duration: number }[] = [];
  const repeatTimes = 1;

  for (const inputNumber of testCases) {
    console.log(
      `Benchmarking [${sumFunction.name}] with input: ${inputNumber}`
    );
    const startTime = performance.now();
    for (let i = 0; i < repeatTimes; i++) {
      sumFunction(inputNumber);
    }
    const endTime = performance.now();
    const duration = (endTime - startTime) / repeatTimes;
    testResults.push({ input: inputNumber, duration });
    console.log(
      `Benchmarking result: [${
        sumFunction.name
      }], input: ${inputNumber}, duration: ${duration.toFixed(6)}ms`
    );
  }
  return testResults;
}

function main() {
  const testCases = [10, 100, 500, 900, 9000]; // please adjust large number if you facing stack overflow (max call stack size)
  const testFunctions = [sum_to_n_a, sum_to_n_b, sum_to_n_c];
  const testResults = testFunctions.map((testFunction) =>
    benchmarkPerformance(testFunction, testCases)
  );

  const bestResultPerTestCases = testCases.map((testCase) => {
    const testResultsMap = new Map<number, string>();
    testResults.forEach((testResult, i) => {
      const result = testResult.find((result) => result.input === testCase);
      testResultsMap.set(result?.duration ?? 0, testFunctions[i].name);
    });

    const result: any = {
      input: testCase,
    };
    testResults.forEach((testResult, i) => {
      result[testFunctions[i].name + " (ms)"] =
        testResult.find((result) => result.input === testCase)?.duration ??
        "N/A";
    });

    result.fastest =
      testResultsMap.get(Math.min(...Array.from(testResultsMap.keys()))) ??
      "N/A";

    result.slowest =
      testResultsMap.get(Math.max(...Array.from(testResultsMap.keys()))) ??
      "N/A";
    return result;
  });
  console.log("--------------------------------");
  console.table(bestResultPerTestCases);
}

main();
