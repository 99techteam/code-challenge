// A: Iterative approach
// Time: O(n) for positive n | Extra space: O(1)
function sum_to_n_a(n: number): number {
    let sum = 0;

    for (let i = 1; i <= n; i++) {
        sum += i;
    }

    return sum;
}

// B: Recursive approach
// Time: O(n) | Extra space: O(n) due to the call stack.
function sum_to_n_b(n: number): number {
    if (n <= 0) {
        return 0;
    }

    return n + sum_to_n_b(n - 1);
}

// C: Arithmetic series formula
// Time: O(1) | Extra space: O(1).
// Divide the even factor first to keep the intermediate
// multiplication within the safe integer range.
function sum_to_n_c(n: number): number {
    if (n <= 0) {
        return 0;
    }

    return n % 2 === 0
        ? (n / 2) * (n + 1)
        : n * ((n + 1) / 2);
}

console.log(sum_to_n_a(5)); // 15
console.log(sum_to_n_b(5)); // 15
console.log(sum_to_n_c(5)); // 15