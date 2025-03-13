var sum_to_n_a = function(n) {
    return n * (n + 1) / 2;
};

var sum_to_n_b = function(n) {
    let total = 0;
    for (let index = 1; index <= n; index++) {
        total += index;
    }
    return total;
};

var sum_to_n_c = function(n) {
    return Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a + b, 0);
};