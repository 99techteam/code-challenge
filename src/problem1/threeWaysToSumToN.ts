const INVALID_INPUT_ERROR = "Invalid input";
/**
 * Checks if the given number is valid.
 * @param n - The number to check.
 * @returns True if the number is valid, false otherwise.
 */
const isValidNumber = (n: number): boolean => {
  return n < Number.MAX_SAFE_INTEGER;
};

/**
 * Sums numbers from 1 to n using a for loop.
 * @param n - The upper limit of the sum.
 * @returns The sum of numbers from 1 to n.
 * @throws Error if the input is invalid.
 * Explain: This function uses a for loop to iterate from 1 to n, accumulating the sum.
 * Complexity: O(n) because it iterates through all numbers from 1 to n.
 */
const sumToNumberWayOne = (n: number): number => {
  if (!isValidNumber(n)) {
    throw new Error(INVALID_INPUT_ERROR);
  }
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

/**
 * Sums numbers from 1 to n using the formula.
 * @param n - The upper limit of the sum.
 * @returns The sum of numbers from 1 to n.
 * @throws Error if the input is invalid.
 * Explain: This function uses the formula n * (n + 1) / 2 to calculate the sum.
 * Sum = 1 + 2 + ... + n
 * Sum = n + (n - 1) + (n - 2) + ... + 1;
 * 2 * Sum = (n + 1) + (n + 1) + ... + (n + 1) [There are n terms]
 * 2 * Sum = n * (n + 1)
 * Sum = n * (n + 1) / 2
 * Complexity: O(1) because it uses a mathematical formula.
 */
const sumToNumberWayTwo = (n: number): number => {
  if (!isValidNumber(n)) {
    throw new Error(INVALID_INPUT_ERROR);
  }
  return (n * (n + 1)) / 2;
};

/**
 * Sums numbers from 1 to n using the reduce method.
 * @param n - The upper limit of the sum.
 * @returns The sum of numbers from 1 to n.
 * @throws Error if the input is invalid.
 * Explain: This function uses the reduce method to accumulate the sum.
 * Array.from({ length: n }, (_, i) => i + 1) creates an array of numbers from 1 to n.
 * Reduce: The reduce method is then used to sum all the elements in the array.
 * Complexity: O(n) because it iterates through all numbers from 1 to n.
 */
const sumToNumberWayThree = (n: number): number => {
  if (!isValidNumber(n)) {
    throw new Error(INVALID_INPUT_ERROR);
  }
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (prev, curr) => prev + curr,
    0
  );
};
