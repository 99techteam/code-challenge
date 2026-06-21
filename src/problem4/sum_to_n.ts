/**
 * Iterative approach.
 * Time Complexity: O(n) 
 * Space Complexity: O(1)
 */
export function sum_to_n_a(n: number): number {
    const val = Math.trunc(n);
    const absN = Math.abs(val);

    let sum = 0;
    for (let i = 1; i <= absN; i++) {
            sum += i;
    }

    return val < 0 ? -sum : sum;
}

/**
 * Recursive approach.
 * Time Complexity: O(n)
 * Space Complexity: O(n) 
 */
export function sum_to_n_b(n: number): number {
    const val = Math.trunc(n);
    if (val === 0) return 0; 

    const recursiveSum = (num: number): number => {
        if (num === 1) return 1;
        return num + recursiveSum(num - 1);
    };

    const absN = Math.abs(val);
    const result = recursiveSum(absN);
    
    return val < 0 ? -result : result;
}

/**
 * Mathematical approach (Gauss's Formula).
 * Time Complexity: O(1)
 * Space Complexity: O(1).
 */
export function sum_to_n_c(n: number): number {
    const val = Math.trunc(n);
    
    if (val === 0) return 0;

    const absN = Math.abs(val);
    const sum = (absN * (absN + 1)) / 2;

    return val < 0 ? -sum : sum;
}
