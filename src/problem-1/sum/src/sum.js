// Implementation A: Mathematical formula O(1)
export const sum_to_n_a = function(n) {
    return (n * (n + 1)) / 2;
};

// Implementation B: Iterative O(n)
export const sum_to_n_b = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// Implementation C: Recursive with memoization O(n)
export const sum_to_n_c = function(n) {
    const memo = {};
    const recurse = (n) => {
        if (n <= 0) return 0;
        if (memo[n]) return memo[n];
        return memo[n] = n + recurse(n - 1);
    };
    return recurse(n);
};