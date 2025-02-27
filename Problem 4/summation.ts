//1.Iterative Approach
//Time Complexity: O(n)
//Space Complexity: O(1)
//Efficiency: For small to medium n
function sum_to_n_a(n: number): number {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

//2.Mathematical Formula Approach(n(n+1)/2)
//Time Complexity: O(1)
//Space Complexity: O(1)
//Efficiency: This is the most efficient method, ideal for all n
function sum_to_n_b(n: number): number {
    return n * (n + 1) / 2;
}

//3.Recursive Approach(calls itself with n-1 until n reaches 1)
//Time Complexity: O(n)
//Space Complexity: O(n)
//Efficiency: This method is less efficient for large n due to stack space usage
function sum_to_n_c(n: number): number {
    if (n == 1) {
        return 1;
    }
    return n + sum_to_n_c(n - 1);
}