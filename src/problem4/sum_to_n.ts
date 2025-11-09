// Three different ways to sum numbers from 1 to n

// Using the mathematical formula
// Time: O(1) - constant time, just one calculation
// Space: O(1) - no extra memory needed
// This is the most efficient approach
var sum_to_n_a = function(n: number): number {
    return n * (n + 1) / 2;
};

// Using a loop
// Time: O(n) - needs to iterate through all numbers from 1 to n
// Space: O(1) - only uses one variable to store the sum
// Simple and straightforward, easy to understand
var sum_to_n_b = function(n: number): number {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// Using recursion
// Time: O(n) - makes n recursive calls
// Space: O(n) - each call adds to the call stack
// Elegant but can cause stack overflow for large n
var sum_to_n_c = function(n: number): number {
    if (n <= 1) return n;
    return n + sum_to_n_c(n - 1);
};

export { sum_to_n_a, sum_to_n_b, sum_to_n_c };
