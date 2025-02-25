
// Solution A: Using Formula
// Time Complexity: O(1) 
// Space Complexity: O(1)

function sum_to_n_a(n: number): number {
    return (n * (n + 1)) / 2;
}
// ----------------------------------------------------------------

// Solution B: Using a For Loop
// Time Complexity: O(n)
// Space Complexity: O(1)
function sum_to_n_b(n: number): number {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

// ----------------------------------------------------------------

// Solution C: Using Recursion
// Time Complexity: O(n) - linear time, makes n recursive calls
// Space Complexity: O(n) - linear space due to call stack growth

function sum_to_n_c(n: number): number {
    if (n <= 1) return n;
    return n + sum_to_n_c(n - 1);
}

// => Solution A is best practice for space and complexity. 
// But if we don't remember the formula, Solution B will be better for easy implementation and optimize in space