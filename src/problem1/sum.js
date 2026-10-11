// 1. Using loop
var sum_to_n_a = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// 2. Using the arithmetic series formula
var sum_to_n_b = function(n) {
    return (n * (n + 1)) / 2;
};

// 3. Using recursion
var sum_to_n_c = function(n) {
    if (n <= 1) return n;
    return n + sum_to_n_c(n - 1);
};

// Test the functions
console.log("sum_to_n_a(5) =", sum_to_n_a(5));
console.log("sum_to_n_b(5) =", sum_to_n_b(5));
console.log("sum_to_n_c(5) =", sum_to_n_c(5));