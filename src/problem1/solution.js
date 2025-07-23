// Method A: Mathematical Formula (O(1) time complexity)
// Uses the arithmetic series formula: sum = n * (n + 1) / 2
var sum_to_n_a = function(n) {
    if (n <= 0) return 0;
    
    return (n * (n + 1)) / 2;
};

// Method B: Iterative Loop (O(n) time complexity)
// Traditional for-loop approach
var sum_to_n_b = function(n) {
    if (n <= 0) return 0;
    
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// Method C: Recursive Approach (O(n) time complexity, O(n) space complexity due to call stack)
// Uses recursion with base case
var sum_to_n_c = function(n) {
    // Base cases
    if (n <= 0) return 0;
    if (n === 1) return 1;
    
    return n + sum_to_n_c(n - 1);
};

// Test cases to verify all implementations work correctly
console.log("Testing sum_to_n_a:");
console.log(`sum_to_n_a(5) = ${sum_to_n_a(5)}`); // Expected: 15
console.log(`sum_to_n_a(0) = ${sum_to_n_a(0)}`); // Expected: 0
console.log(`sum_to_n_a(1) = ${sum_to_n_a(1)}`); // Expected: 1
console.log(`sum_to_n_a(10) = ${sum_to_n_a(10)}`); // Expected: 55

console.log("\nTesting sum_to_n_b:");
console.log(`sum_to_n_b(5) = ${sum_to_n_b(5)}`); // Expected: 15
console.log(`sum_to_n_b(0) = ${sum_to_n_b(0)}`); // Expected: 0
console.log(`sum_to_n_b(1) = ${sum_to_n_b(1)}`); // Expected: 1
console.log(`sum_to_n_b(10) = ${sum_to_n_b(10)}`); // Expected: 55

console.log("\nTesting sum_to_n_c:");
console.log(`sum_to_n_c(5) = ${sum_to_n_c(5)}`); // Expected: 15
console.log(`sum_to_n_c(0) = ${sum_to_n_c(0)}`); // Expected: 0
console.log(`sum_to_n_c(1) = ${sum_to_n_c(1)}`); // Expected: 1
console.log(`sum_to_n_c(10) = ${sum_to_n_c(10)}`); // Expected: 55
