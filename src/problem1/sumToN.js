var sum_to_n_a = function(n) {
    const nums = Array.from({length: n}, (_, i) => i + 1);
    return nums.reduce((a, b) => a + b, 0);
};

var sum_to_n_b = function(n) {
    return n * (n + 1) / 2;
};

var sum_to_n_c = function(n) {
    let total = 0;
    
    for (let i = 1; i <= n; i++) {
        total += i;
    }

    return total;
};
