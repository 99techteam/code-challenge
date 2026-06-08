/**
 * Solution 1: Using for to calculate the sum from 1 to n
 * Time complexity: O(n)
 * Space complexity: O(1)
 * @param n - The input number
 * @returns - The number that is the sum from 1 to n
 */
var sum_to_n_a = function (n: number) {
	let result = 0;

	for (let index = 1; index <= n; index++) {
		result += index;
	}

	return result;
};

/**
 * Solution 2: Using the mathematical formula:
 * The sum from 1 to n is: (n * (n + 1)) / 2
 * Time complexity: O(1)
 * Space complexity: O(1)
 * @param n - The input number
 * @returns - The number that is the sum from 1 to n
 */
var sum_to_n_b = function (n: number) {
	return Math.floor((n * (n + 1)) / 2);
};

/**
 * Solution 3: Using recursion to reduce n down to the base case (n <= 1)
 * Time complexity: O(n)
 * Space complexity: O(n)
 * @param n 
 * @returns 
 */
var sum_to_n_c = function (n: number): number {
  if (n <= 1) return n;

  return n + sum_to_n_c(n - 1);
};

