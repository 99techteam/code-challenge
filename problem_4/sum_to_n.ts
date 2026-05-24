export function sum_to_n_a(n: number): number {
    //time: O(n), space: O(1)
    if (n <= 0) return 0;
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

export function sum_to_n_b(n: number): number {
    //time: O(n), space: O(n)
    if (n <= 0) return 0;
    if (n === 1) return 1;
    return n + sum_to_n_b(n - 1);
}

export function sum_to_n_c(n: number): number {
    //time: O(1), space: O(1)
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
}

