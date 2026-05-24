"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sum_to_n_a = sum_to_n_a;
exports.sum_to_n_b = sum_to_n_b;
exports.sum_to_n_c = sum_to_n_c;
function sum_to_n_a(n) {
    //time: O(n), space: O(1)
    if (n <= 0)
        return 0;
    var sum = 0;
    for (var i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}
function sum_to_n_b(n) {
    //time: O(n), space: O(n)
    if (n <= 0)
        return 0;
    if (n === 1)
        return 1;
    return n + sum_to_n_b(n - 1);
}
function sum_to_n_c(n) {
    //time: O(1), space: O(1)
    if (n <= 0)
        return 0;
    return (n * (n + 1)) / 2;
}
