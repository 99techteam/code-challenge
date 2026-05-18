/**
 * Iterative approach using a loop
 * Logic: Initializes a sum variable and adds every integer from 1 to n.
 * Time Complexity: O(n), Space Complexity: O(1)
 */
var sum_to_n_a = function (n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

/**
 * Mathematical formula approach
 * Logic: Uses the arithmetic progression sum formula n * (n + 1) / 2.
 * Time Complexity: O(1), Space Complexity: O(1)
 */
var sum_to_n_b = function(n) {
    return (n * (n + 1)) / 2;
};

/**
 * Recursive approach
 * Logic: Recursively adds the current n to the sum of numbers up to n - 1.
 * Time Complexity: O(n), Space Complexity: O(n) due to call stack
 */
var sum_to_n_c = function(n) {
    if (n <= 1) {
        return n; // Handles base case
    }
    return n + sum_to_n_c(n - 1);
};


console.log(sum_to_n_a(10));
console.log(sum_to_n_b(10));
console.log(sum_to_n_c(10));
