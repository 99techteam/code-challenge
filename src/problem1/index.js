// Implementation A: iterative — accumulate 1..n with a loop.
var sum_to_n_a = function(n) {
    var sum = 0;
    for (var i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// Implementation B: closed-form — Gauss's formula n(n + 1) / 2.
var sum_to_n_b = function(n) {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
};

// Implementation C: recursive — n plus the sum of everything below it.
var sum_to_n_c = function(n) {
    if (n <= 0) return 0;
    return n + sum_to_n_c(n - 1);
};

module.exports = {
    sum_to_n_a: sum_to_n_a,
    sum_to_n_b: sum_to_n_b,
    sum_to_n_c: sum_to_n_c,
};
