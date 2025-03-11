/**
 * Calculates the sum of integers from 1 to n using a simple loop.
 *
 * @param {number} n - The upper limit of the summation.
 * @returns {number} - The sum of integers from 1 to n.
 *
 * Time Complexity: O(n) - Linear time, as the loop iterates n times.
 * Space Complexity: O(1) - Constant space, as only a single variable 'sum' is used.
 */
const sumToNSolutionA = (n) => {
  // Handle negative input gracefully (sum of empty set is 0)
  if (n < 0) {
    return 0;
  }

  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }

  return sum;
};

/**
 * Calculates the sum of integers from 1 to n using the mathematical formula: n * (n + 1) / 2.
 *
 * @param {number} n - The upper limit of the summation.
 * @returns {number} - The sum of integers from 1 to n.
 *
 * Time Complexity: O(1) - Constant time, as it performs a fixed number of arithmetic operations.
 * Space Complexity: O(1) - Constant space, as only a few variables are used.
 */
const sumToNSolutionB = (n) => {
  if (n < 0) {
    return 0; // Handle negative input gracefully
  }
  return (n * (n + 1)) / 2;
};

/**
 * Calculates the sum of integers from 1 to n using recursion.
 *
 * @param {number} n - The upper limit of the summation.
 * @returns {number} - The sum of integers from 1 to n.
 *
 * Time Complexity: O(n) - Linear time, due to array creation and reduction.
 * Space Complexity: O(n) - Linear space, as an array of size n is created.
 */
const sumToNSolutionC = (n) => {
  if (n <= 0) {
    return 0;
  }
  return n + sumToNSolutionC(n - 1);
};

// Test Cases
const testCases = [
  { input: 0, expected: 0 },
  { input: 1, expected: 1 },
  { input: 5, expected: 15 },
  { input: 10, expected: 55 },
  { input: -1, expected: 0 },
  { input: -5, expected: 0 },
  { input: 100, expected: 5050 },
  { input: 1000, expected: 500500 },
];

function runTests(solution, solutionName) {
  console.log(`\nTesting ${solutionName}:`);
  testCases.forEach((test, index) => {
    const actual = solution(test.input);
    const result = actual === test.expected ? "Pass" : "Fail";
    console.log(
      `Test ${index + 1}: Input=${test.input}, Expected=${
        test.expected
      }, Actual=${actual}, Result=${result}`
    );
  });
}

// Run tests for each solution
runTests(sumToNSolutionA, "Solution A (Iterative)");
runTests(sumToNSolutionB, "Solution B (Mathematical)");
runTests(sumToNSolutionC, "Solution C (Recursive)");
