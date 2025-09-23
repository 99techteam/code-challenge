var sum_to_n_a = function(n) {
    return (n * (n + 1)) / 2;
};

var sum_to_n_b = function(n) {
    return Array.from({ length: n }, (_, i) => i + 1).reduce((sum, num) => sum + num, 0);
};

var sum_to_n_c = function(n) {

    return n <= 1 ? n : n + sum_to_n_c(n - 1);
};