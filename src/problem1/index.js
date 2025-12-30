var sum_to_n_a = function (n) {
    // your code here
    return (n * (n + 1)) / 2;
};

var sum_to_n_b = function (n) {
    // your code here
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

var sum_to_n_c = function (n) {
    // your code here
    return Array.from({ length: n }, (_, i) => i + 1).reduce((acc, curr) => acc + curr, 0);
};

console.log(sum_to_n_a(100));

console.log(sum_to_n_b(100));

console.log(sum_to_n_c(100));