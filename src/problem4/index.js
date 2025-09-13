function sum_to_n_for(n) {
    var sum = 0;
    for (var i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}
function sum_to_n_while(n) {
    var sum = 0, i = 1;
    while (i <= n) {
        sum += i;
        i++;
    }
    return sum;
}
function sum_to_n_avg(n) {
    return n * ((n + 1) / 2);
}
function sum_to_n_reduce(n) {
    return Array.from({ length: n }, function (_, i) { return i + 1; }).reduce(function (acc, curr) { return acc + curr; }, 0);
}
console.log(sum_to_n_for(5));
console.log(sum_to_n_while(5));
console.log(sum_to_n_avg(5));
console.log(sum_to_n_reduce(5));
