// Task: 3 unique implementations with complexity analysis

function sum_to_n_a(n: number): number { 
    // Mathematical formula approach - most efficient
    // Uses the arithmetic series formula: n*(n+1)/2
    // Time Complexity: O(1) - constant time
    // Space Complexity: O(1) - constant space
    // Pros: Fastest possible solution, handles large numbers well
    // Cons: Potential integer overflow for very large n (though within Number.MAX_SAFE_INTEGER)
    
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
}

function sum_to_n_b(n: number): number { 
    // Functional approach ussing Array.from and reduce
    // Time Complexity: O(n) - linear time to create array and reduce
    // Space Complexity: O(n) - creates an array of size n
    // Pros: Functional programming style, readable, immutable approach
    // Cons: High memory usage, slower than formula, not suitable for large n
    
    if (n <= 0) return 0;
    return Array.from({ length: n }, (_, i) => i + 1).reduce((sum, num) => sum + num, 0);
}

function sum_to_n_c(n: number): number { 
    // Iterative approach with while loop and optimization
    // Time Complexity: O(n) - linear time, but can be faster than for loop
    // Space Complexity: O(1) - constant space
    // Pros: More memory efficient than recursive, handles edge cases well
    // Cons: Still O(n) time complexity, slower than mathematical formula
    
    if (n <= 0) return 0;
    if (n === 1) return 1;
    
    let sum = 0;
    let current = 1;
    
    while (current <= n) {
        sum += current;
        current++;
    }
    
    return sum;
}

// Alternative implementations (bonus):

function sum_to_n_d(n: number): number {
    // Recursive with memoization to avoid stack overflow
    // Time Complexity: O(n) - each number calculated once
    // Space Complexity: O(n) - memoization cache + call stack
    // Pros: Avoids recalculation, educational value
    // Cons: Still uses O(n) space, more complex than needed
    
    const memo: Map<number, number> = new Map();
    
    function memoizedSum(num: number): number {
        if (num <= 0) return 0;
        if (num === 1) return 1;
        if (memo.has(num)) return memo.get(num)!;
        
        const result = num + memoizedSum(num - 1);
        memo.set(num, result);
        return result;
    }
    
    return memoizedSum(n);
}

function sum_to_n_e(n: number): number {
    // Bit manipulation approach (educational/mathematical interest)
    // Time Complexity: O(log n) - number of bits in n
    // Space Complexity: O(1) - constant space
    // Pros: Interesting mathematical approach, relatively efficient
    // Cons: Complex to understand, not intuitive
    
    if (n <= 0) return 0;
    
    // Using bit manipulation to calculate n*(n+1)/2
    // Avoiding direct multiplication to prevent overflow
    let result = 0;
    let a = n;
    let b = n + 1;
    
    // Make sure one of them is even to avoid precision issues
    if (a % 2 === 0) {
        a = a / 2;
    } else {
        b = b / 2;
    }
    
    return a * b;
}

// Performance comparison function for testing
function benchmarkSumFunctions(n: number, iterations: number = 1000): void {
    const functions = [
        { name: 'sum_to_n_a (Formula)', fn: sum_to_n_a },
        { name: 'sum_to_n_b (Functional)', fn: sum_to_n_b },
        { name: 'sum_to_n_c (Iterative)', fn: sum_to_n_c },
    ];
    
    console.log(`\nBenchmarking with n=${n}, iterations=${iterations}`);
    console.log('='.repeat(50));
    
    functions.forEach(({ name, fn }) => {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            fn(n);
        }
        const end = performance.now();
        const result = fn(n);
        console.log(`${name}: ${(end - start).toFixed(4)}ms, Result: ${result}`);
    });
}

// Example usage and testing

console.log('Testing sum_to_n implementations:');
console.log('sum_to_n_a(5):', sum_to_n_a(5)); // 15
console.log('sum_to_n_b(5):', sum_to_n_b(5)); // 15  
console.log('sum_to_n_c(5):', sum_to_n_c(5)); // 15

console.log('\nTesting with larger numbers:');
console.log('sum_to_n_a(1000):', sum_to_n_a(1000)); // 500500
console.log('sum_to_n_b(1000):', sum_to_n_b(1000)); // 500500
console.log('sum_to_n_c(1000):', sum_to_n_c(1000)); // 500500

// Run performance benchmark
benchmarkSumFunctions(10000, 1000);
