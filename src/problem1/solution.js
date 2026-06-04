/**
 * Problem 1: Three ways to sum to n
 *
 * Cách 1: Iterative Approach
 * Cách 2: Mathematical Formula
 * Cách 3: Recursive Approach
 */

/**
 * Cách 1: Use iterative approach
 * Use for loop to sum from 1 to n.
 */
var sum_to_n_a = function(n) {
    var sum = 0;
    for (var i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

/**
 * Cách 2: Use mathematical formula
 * Apply Gauss formula: n * (n + 1) / 2
 */
var sum_to_n_b = function(n) {
    return (n * (n + 1)) / 2;
};

/**
 * Cách 3: Use recursive approach
 * sum(n) = n + sum(n - 1)
 */
var sum_to_n_c = function(n) {
    if (n <= 1) return n;
    return n + sum_to_n_c(n - 1);
};

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
