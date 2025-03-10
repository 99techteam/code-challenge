// Using a loop
var sum_to_n_a = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// Using recursion
var sum_to_n_b = function(n) {
    if (n === 1) return 1;
    return n + sum_to_n_b(n - 1);
};

// Using the mathematical formula
var sum_to_n_c = function(n) {
    return (n * (n + 1)) / 2;
};