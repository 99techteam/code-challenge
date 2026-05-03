var sum_to_n_a = function (n) {
    //Time Complexity O(n)
    let total = 0;
    for (var i = 1; i <= n; i++) {
        total += i;
    }
    return total;
};

var sum_to_n_b = function (n) {
    //Time Complexity O(1)
    return (n * (n + 1)) / 2;
};

var sum_to_n_c = function (n) {
    //Time Complexity O(n)
    let sum = 0;
    let i = 1;
    while (i <= n) {
        sum += i;
        i++;
    }
    return sum;
};
