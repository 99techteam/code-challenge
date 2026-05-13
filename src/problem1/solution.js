var sum_to_n_a = function(n) {
    let out = 0;
    for (let i = 1; i <= n; i++) {
        out += i;
    }
    return out;
};

var sum_to_n_b = function(n) {
    return (n * (n + 1)) / 2;
};

var sum_to_n_c = function(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    return n + sum_to_n_c(n - 1);
};