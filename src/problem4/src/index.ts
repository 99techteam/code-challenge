/** Sum 1..n using the arithmetic series formula: n * (n + 1) / 2. O(1) time. */
function sum_to_n_a(n: number): number {
    return (n * (n + 1)) / 2;
}

/** Sum 1..n by iterating with a while loop and a running total. O(n) time, O(1) space. */
function sum_to_n_b(n: number): number {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

/** Adds remaining down to 1 onto total, used as the recursive core for sum_to_n_c. */
function accumulate(total: number, remaining: number): number {
    if (remaining <= 0) return total;
    return accumulate(total + remaining, remaining - 1);
}

/** Sum 1..n via recursion through accumulate. O(n) time, O(n) call-stack space. */
function sum_to_n_c(n: number): number {
    return accumulate(0, n);
}

export { sum_to_n_a, sum_to_n_b, sum_to_n_c };

const sample = 5;
console.log(`sum_to_n_a(${sample}) = ${sum_to_n_a(sample)}`);
console.log(`sum_to_n_b(${sample}) = ${sum_to_n_b(sample)}`);
console.log(`sum_to_n_c(${sample}) = ${sum_to_n_c(sample)}`);
