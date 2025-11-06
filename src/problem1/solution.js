// Solution A
var sum_to_n_a = function(n) {
    if (n < 0) {
        let sum = 0;
        for (let i = n; i <= 0; i++) {
            sum += i;
        }
        return sum;
    }
    
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// Solution B
var sum_to_n_b = function(n) {
    return n * (n + 1) / 2;
};

// Solution C
var sum_to_n_c = function(n) {
    if (n === 0) {
        return 0;
    }
    
    if (n < 0) {
        return n + sum_to_n_c(n + 1);
    }
    
    return n + sum_to_n_c(n - 1);
};

console.log("Testing Solution A::");
console.log("sum_to_n_a(5) =", sum_to_n_a(5));
console.log("sum_to_n_a(10) =", sum_to_n_a(10));
console.log("sum_to_n_a(0) =", sum_to_n_a(0));
console.log("sum_to_n_a(-5) =", sum_to_n_a(-5));

console.log("Testing Solution B:");
console.log("sum_to_n_b(5) =", sum_to_n_b(5));
console.log("sum_to_n_b(10) =", sum_to_n_b(10));
console.log("sum_to_n_b(0) =", sum_to_n_b(0));
console.log("sum_to_n_b(-5) =", sum_to_n_b(-5));

console.log("Testing Solution C:");
console.log("sum_to_n_c(5) =", sum_to_n_c(5));
console.log("sum_to_n_c(10) =", sum_to_n_c(10));
console.log("sum_to_n_c(0) =", sum_to_n_c(0));
console.log("sum_to_n_c(-5) =", sum_to_n_c(-5));

