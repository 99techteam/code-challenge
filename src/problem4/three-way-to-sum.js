// Implementation 1: Iterative Approach
function sum_to_n_iterative(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}
// Time Complexity: O(n) - linear time
// Space Complexity: O(1) - constant space

// Implementation 2: Mathematical Formula
function sum_to_n_formula(n) {
    return (n * (n + 1)) / 2;
}
// Time Complexity: O(1) - constant time
// Space Complexity: O(1) - constant space

// Implementation 3: Recursive Approach
function sum_to_n_recursive(n) {
    if (n <= 1) return n;
    return n + sum_to_n_recursive(n - 1);
}
// Time Complexity: O(n) - linear time
// Space Complexity: O(n) - linear space due to call stack