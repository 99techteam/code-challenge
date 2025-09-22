// Write three different functions that compute the sum of the integers from 1 to n (inclusive).

//Solution 1: Using a simple FOR loop
var sum_to_n_a = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }

    return sum;
};

//Solution 2: Generate an array and reduce it
var sum_to_n_b = function(n) {
    return Array.from({ length: n }, (_, i) => i + 1)
        .reduce((acc, cur) => acc + cur, 0);
};

//Solution 3: Using recursion
var sum_to_n_c = function(n) {
    if (n <= 1) return n;

    return n + sum_to_n_c(n - 1);
};

// Using node index.js <n> (eg. index.js 10) to run and test the functions
if (require.main === module) {
    const n = parseInt(process.argv[2]) || 10;
    console.log(`Sum of integers from 1 to ${n}:`);

    console.log('Solution 1: ' + sum_to_n_a(n));
    console.log('Solution 2: ' + sum_to_n_b(n));
    console.log('Solution 3: ' + sum_to_n_c(n));
}