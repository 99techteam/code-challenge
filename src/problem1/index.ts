// Problem 4: Three ways to sum to n
// Recursive implementation
// Time Complexity: O(n), Space Complexity: O(n) due to recursion stack
function sum_to_n_a(n: number): number {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    return n + sum_to_n_a(n - 1);
}

// Iterative implementation
// Time Complexity: O(n), Space Complexity: O(1)
function sum_to_n_b(n: number): number {
    let sum = 0;
    for (let i = 1; i <= n; i++) {      
        sum += i;
    }
    return sum;
}

// Formula-based implementation
// Time Complexity: O(1), Space Complexity: O(1)
function sum_to_n_c(n: number): number {
    return n > 0 ? (n * (n + 1)) / 2 : 0;
}

console.log(sum_to_n_a(5)); // 15
console.log(sum_to_n_b(10)); // 55
console.log(sum_to_n_c(0)); // 0
console.log(sum_to_n_a(-3)); // 0
console.log(sum_to_n_b(1)); // 1
console.log(sum_to_n_c(100)); // 5050