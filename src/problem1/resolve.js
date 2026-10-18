var sum_to_n_a = function(n) {
    let result = 0;
    for (i = 1; i <= n; i++) {
        result += i;
    }
    return result;
};

var sum_to_n_b = function(n) {
    const arr = [...Array(n + 1).keys()];
    return arr.reduce((accumulator, current) => accumulator + current, 0);
};

var sum_to_n_c = function(n) {
    let result = n;
    while (n--) {
        result+=n;
    }
    return result;
}

console.log("1st Sum", sum_to_n_a(5) === 15, sum_to_n_a(5));
console.log("2nd Sum", sum_to_n_b(5) === 15, sum_to_n_b(5));
console.log("3rd Sum", sum_to_n_c(5) === 15, sum_to_n_c(5));