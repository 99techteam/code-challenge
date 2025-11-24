// The first solution
// The simplest way to solve the problem is to use a loop to sum all numbers from 1 to n
// The complexity is O(n)
// The n should be smaller than 10000000 to avoid performance issues
function sumToN1(n: number) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

// The second solution
// we assume that if the number is very large, the loop may take a long time
// So we use the mathematical formula to calculate the result
// First, we convert n to BigInt to handle very large numbers
// Then we use the formula n * (n + 1) / 2
// This way, we can avoid the performance issues with large n
// This approach is efficient and handles large inputs gracefully
// The complexity is O(1)
function sumToN2(n: number) {
    const bigN = BigInt(n);
    const result = (bigN * (bigN + BigInt(1))) / BigInt(2);
    return result;
}

// The third solution
//.we can consider to use Divide & Conquer technique to optimize the summation process
// This technique breaks the problem into smaller subproblems, solves each subproblem recursively, and combines the results
// The complexity remains O(n), without needing loop
// Trade-off: This approach is more complex and may have higher overhead due to recursive calls
function sumToN3(n: number) {
    function recursiveSum(start: bigint, end: bigint): bigint {
        if (start === end) {
            return start;
        }
        const mid = (start + end) / 2n;
        return recursiveSum(start, mid) + recursiveSum(mid + 1n, end);
    }
    return recursiveSum(1n, BigInt(n));
}

export { sumToN1, sumToN2, sumToN3 };
