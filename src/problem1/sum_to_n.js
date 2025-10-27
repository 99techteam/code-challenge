/**
 * Solution A: Arithmetic Series Formula - O(1)
 * Most efficient approach using mathematical formula: n(n+1)/2
 */
var sum_to_n_a = function(n) {
    return (n * (n + 1)) / 2;
};

/**
 * Solution B: Iterative Approach - O(n)
 * Traditional loop-based accumulation
 */
var sum_to_n_b = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

/**
 * Solution C: Recursive Approach - O(n)
 * Functional programming style with tail recursion consideration
 */
var sum_to_n_c = function(n) {
    if (n <= 0) return 0;
    return n + sum_to_n_c(n - 1);
};

