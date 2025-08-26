var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
function sum_to_n_a(n) {
    var sum = 0;
    for (var i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}
// Complexity: O(n) - Sử dụng vòng lặp để cộng từng số, hiệu quả với n nhỏ.
function sum_to_n_b(n) {
    return (n * (n + 1)) / 2;
}
// Complexity: O(1) - Sử dụng công thức toán học, rất hiệu quả cho mọi n.
function sum_to_n_c(n) {
    return __spreadArray([], new Array(n), true).map(function (_, i) { return i + 1; }).reduce(function (a, b) { return a + b; }, 0);
}
// Complexity: O(n) - Tạo mảng và dùng reduce, rõ ràng nhưng không tối ưu bằng công thức.
console.log(sum_to_n_a(500));
console.log(sum_to_n_b(500));
console.log(sum_to_n_c(500));
