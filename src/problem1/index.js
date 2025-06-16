// Implementation A: Mathematical formula approach
// Uses the arithmetic series formula: n * (n + 1) / 2
var sum_to_n_a = function(n) {
    return (n * (n + 1)) >> 1; // Right shift by 1 is equivalent to dividing by 2
};

// Implementation B: Iterative approach with for loop
// Loops through each number from 1 to n and accumulates the sum
var sum_to_n_b = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// Implementation C: Recursive approach
// Recursively calls itself with n-1 until reaching base case
var sum_to_n_c = function(n) {
    if (n <= 1) {
        return n;
    }
    return n + sum_to_n_c(n - 1);
};