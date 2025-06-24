// 1. Using arithmetic formula: n * (n + 1) / 2
var sum_to_n_a = function (n) {
    return n * (n + 1) / 2;
};

// 2. Using iterative loop
var sum_to_n_b = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// 3.Using recursive approach
var sum_to_n_c = function(n) {
    if (n <= 1) return n;
    return n + sum_to_n_c(n - 1);
};
// Example usage
const n = 5, m = 6;
console.log({
  sum_to_n_a: sum_to_n_a(n), // Output: 15
  sum_to_n_b: sum_to_n_b(n), // Output: 15
  sum_to_n_c: sum_to_n_c(n), // Output: 15
});
console.log({
  sum_to_n_a: sum_to_n_a(m), // Output: 21
  sum_to_n_b: sum_to_n_b(m), // Output: 21
  sum_to_n_c: sum_to_n_c(m), // Output: 21
});