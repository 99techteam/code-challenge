/**
 * Shared assumptions:
 * - n is an integer
 * - return 0 if n <= 0
 */

/**
 * A. Iterative approach
 * Simple loop, easy to read and debug.
 */
var sum_to_n_a = function (n) {
    if (n <= 0) return 0;

    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

/**
 * B. Mathematical approach (O(1))
 * Uses arithmetic series formula.
 */
var sum_to_n_b = function (n) {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
};

/**
 * C. Functional approach
 * Uses Array + reduce for declarative style.
 */
var sum_to_n_c = function (n) {
    if (n <= 0) return 0;

    return Array.from({ length: n }, (_, i) => i + 1)
        .reduce((sum, value) => sum + value, 0);
};

console.log(sum_to_n_a(5));
console.log(sum_to_n_b(5));
console.log(sum_to_n_c(5));
