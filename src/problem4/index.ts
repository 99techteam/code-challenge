/**
 * Problem 4: Sum to n
 *
 * Write a function that takes a number n and returns the sum of all numbers from 1 to n.
 * Provide 3 unique implementations of the following function in TypeScript.
 *
 * Comment on the complexity or efficiency of each function.
 *
 * Input: `n` - any integer
 *
 * Assuming:
 *  - This input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`.
 *  - This input will always be a positive integer greater than 0.
 *      currently the test show that its start from 1 (what show in output return)
 *      so not sure if we have an negative or zero case, where will we start from and how the incremental be like?
 *
 * Output: `return` - summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.
 */


/**
 * Implementation 1: Iterative through a loop, start from 1 to n and add each number to the total.
 * Time Complexity: O(n) - We need to iterate through all numbers from 1 to n.
 * Space Complexity: O(1) - We only use a constant amount of space to store the sum.
 */
const sum_to_n_a = (n: number): number => {
    if (n <= 0) return 0; // Handle edge case for non-positive integers
    let total = 0;
    for (let i = 1; i <= n; i++) {
        total += i;
    }
    return total;
}

/**
 * Implementation 2: Using recursion, we can define the sum to n as n plus the sum to n-1 until we reach the base case of 0.
 * Time Complexity: O(n) - In the worst case, we will have n recursive calls until we reach the base case.
 * Space Complexity: O(n) - Each recursive call adds a layer to the call stack, we will have n layers in the worst case.
 */
const sum_to_n_b = (n: number): number => {
    if (n <= 0) return 0; // Handle edge case for non-positive integers
    if (n === 1) return 1;
    return n + sum_to_n_b(n - 1);
}

/**
 * Implementation 3: Using the mathematical formula for the sum of the first n natural numbers, which is n(n + 1) / 2.
 * Time Complexity: O(1) - We perform a constant number of operations regardless of the value of n.
 * Space Complexity: O(1) - We only use a constant amount of space to store the result.
 */
const sum_to_n_c = (n: number): number => {
    if (n <= 0) return 0; // Handle edge case for non-positive integers
    return n * (n + 1) / 2;
}

const example_n = 5;
console.log(`sum_to_n_a(${example_n}) = ${sum_to_n_a(example_n)}`);
console.log(`sum_to_n_b(${example_n}) = ${sum_to_n_b(example_n)}`);
console.log(`sum_to_n_c(${example_n}) = ${sum_to_n_c(example_n)}`);

export {
    sum_to_n_a,
    sum_to_n_b,
    sum_to_n_c
}