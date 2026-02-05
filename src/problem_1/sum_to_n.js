
var sum_to_n_a = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

var sum_to_n_b = function(n) {
    if (n <= 0) {
        return 0;
    }
    if (n === 1) {
        return 1;
    }
    return n + sum_to_n_b(n - 1);
};

var sum_to_n_c = function(n) {
    return (n * (n + 1)) / 2;
};

console.log("Testing sum_to_n_a:");
console.log("sum_to_n_a(5) =", sum_to_n_a(5)); // Expected: 15

console.log("\nTesting sum_to_n_b:");
console.log("sum_to_n_b(5) =", sum_to_n_b(5)); // Expected: 15

console.log("\nTesting sum_to_n_c:");
console.log("sum_to_n_c(5) =", sum_to_n_c(5)); // Expected: 15
