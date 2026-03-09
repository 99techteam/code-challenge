// Implementation 1: Iterative
// This implementation uses a simple iterative loop to calculate the summation.
function sum_to_n_a(n) {
    let sum = 0;

    for (let i = 1; i <= n; i++) {
        sum += i;
    }

    return sum;
}

// Implementation 2: Recursive
// This implementation uses recursion to calculate the summation.
//Warning: When n is large, this implementation may cause a stack overflow error due to the large number of recursive calls.
function sum_to_n_b(n) {
    if (n === 1) {
        return 1;
    } else {
        return n + sum_to_n_b(n - 1);
    }
}

// Implementation 3: Formula
// This implementation utilizes the formula for the summation of the first N natural numbers, which is n * (n + 1) / 2.
function sum_to_n_c(n) {
    return (n * (n + 1)) / 2;
}
