/**
 * Implementation A: Mathematical Formula (Gauss's summation formula)
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 */
var sum_to_n_a = function(n) {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
};

/**
 * Implementation B: Iterative Approach (Using a standard for-loop)
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */
var sum_to_n_b = function(n) {
    if (n <= 0) return 0;
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

/**
 * Implementation C: Recursive Approach
 * Time Complexity: O(n)
 * Space Complexity: O(n) (due to call stack frames)
 */
var sum_to_n_c = function(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    return n + sum_to_n_c(n - 1);
};