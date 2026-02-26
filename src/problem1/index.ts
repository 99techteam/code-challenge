
/*
Provide 3 unique implementations of the following function in JavaScript.
Input: n - any integer
Assuming this input will always produce a result lesser than Number.MAX_SAFE_INTEGER.
Output: return - summation to n, i.e. sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15.
*/ 

var sum_to_n_a = function(n: number): number {
    // using the formula for the sum of an arithmetic series
    if (n <= 0) return 0
    return n * (n + 1) / 2;
};

var sum_to_n_b = function(n: number): number {
    // using a loop
    if (n <= 0) return 0;

    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }

    return sum;
};

var sum_to_n_c = function(n: number): number {
    // using recursion
    if (n <= 0) return 0;
    
    return n + sum_to_n_c(n - 1);
};

const numbers = 5;

console.log(sum_to_n_a(numbers));
console.log(sum_to_n_b(numbers));
console.log(sum_to_n_c(numbers));

// RUN: npm run start