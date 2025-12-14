
/**
 * Uses the arithmetic series formula: n × (n + 1) / 2
 * @param {number} n 
 * @returns {number}
 */
var sum_to_n_a = function (n) {
    if (n <= 0) return 0;
    return n * (n + 1) / 2;
};

/**
 * Uses a for loop to accumulate the sum.
 * @param {number} n 
 * @returns {number}
 */
var sum_to_n_b = function (n) {
    var sum = 0;
    for (var i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

/**
 * Uses recursion to calculate the sum.
 * @param {number} n 
 * @returns {number}
 */
var sum_to_n_c = function (n) {
    if (n <= 0) return 0;
    return n + sum_to_n_c(n - 1);
};
