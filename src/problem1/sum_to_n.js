// Implementation A: Iterative approach using a for loop
const sum_to_n_a = (n) => {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// Implementation B: Mathematical formula approach
const sum_to_n_b = (n) => {
    // Using the arithmetic series formula: sum = n * (n + 1) / 2
    return (n * (n + 1)) / 2;
};

// Implementation C: Recursive approach
const sum_to_n_c = (n) => {
    // Base case: if n is 0 or 1, return n
    if (n <= 1) {
        return n;
    }
    // Recursive case: n + sum of (n-1)
    return n + sum_to_n_c(n - 1);
};

// Example usage and testing
console.log("Testing sum_to_n functions with n=5:");
console.log("sum_to_n_a(5):", sum_to_n_a(5)); // Should output 15
console.log("sum_to_n_b(5):", sum_to_n_b(5)); // Should output 15
console.log("sum_to_n_c(5):", sum_to_n_c(5)); // Should output 15

console.log("\nTesting with n=10:");
console.log("sum_to_n_a(10):", sum_to_n_a(10)); // Should output 55
console.log("sum_to_n_b(10):", sum_to_n_b(10)); // Should output 55
console.log("sum_to_n_c(10):", sum_to_n_c(10)); // Should output 55

// Export functions if using in a module environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
} 