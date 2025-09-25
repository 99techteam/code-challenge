function sum_to_n_a(n: number) {
    // Time Complexity: O(1)
    return n * (n + 1) / 2;
}

function sum_to_n_b(n: number) {
    // Time Complexity: O(n)
    let sum = 0;
    for (let i = 1 ; i <= n; i++) {
        sum += i;
    }
    return sum;
}

function sum_to_n_c(n: number) {
    // Time Complexity: O(n)
    return Array.from({ length: n }, (_, i) => i + 1).reduce((acc, curr) => acc + curr, 0);
}

(function main() {
    const suma = sum_to_n_a(5);
    const sumb = sum_to_n_b(5);
    const sumc = sum_to_n_c(5);

    console.log(suma);
    console.log(sumb);
    console.log(sumc);
})();