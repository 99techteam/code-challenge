// Problem 1: Three ways to sum to n

// Method 1: Using a for loop (iterative approach)
var sum_to_n_a = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// Method 2: Using the mathematical formula n * (n + 1) / 2
var sum_to_n_b = function(n) {
    return (n * (n + 1)) / 2;
};

// Method 3: Using recursion
var sum_to_n_c = function(n) {
    if (n <= 1) {
        return n;
    }
    return n + sum_to_n_c(n - 1);
};

// Test cases
console.log('Testing sum_to_n_a(5):', sum_to_n_a(5)); // Expected: 15
console.log('Testing sum_to_n_b(5):', sum_to_n_b(5)); // Expected: 15
console.log('Testing sum_to_n_c(5):', sum_to_n_c(5)); // Expected: 15

console.log('\nTesting sum_to_n_a(10):', sum_to_n_a(10)); // Expected: 55
console.log('Testing sum_to_n_b(10):', sum_to_n_b(10)); // Expected: 55
console.log('Testing sum_to_n_c(10):', sum_to_n_c(10)); // Expected: 55

