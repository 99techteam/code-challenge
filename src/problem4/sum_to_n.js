// First solution: In this solution, we will iterate through all numbers from 1 to n and add them up.
// Time Complexity: O(n) - We will iterate through all numbers from 1 to n
// Space Complexity: O(1) - We use only one variable for accumulation
const sum_to_n_1 = (n) => {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

// Second solution: In this solution, we will use the formula for the sum of an arithmetic series.
// Time Complexity: O(1) - We use a single calculation to find the sum
// Space Complexity: O(1) - We use only one variable for the calculation
const sum_to_n_2 = (n) => {
    return (n * (n + 1)) / 2;
}

// Third solution: Using a trampoline technique to avoid stack overflow
// Time Complexity: O(n) - We still process n numbers
// Space Complexity: O(1) - No call stack used, only iterative variables
const sum_to_n_3 = (n) => {
    const sumHelper = (current, accumulator) => {
        if (current <= 0) {
            return accumulator;
        }
        return () => sumHelper(current - 1, accumulator + current);
    };
    
    let result = sumHelper(n, 0);
    while (typeof result === 'function') {
        result = result();
    }
    return result;
}


// Test the solutions
console.log("Testing with n = 10:");
console.log(`sum_to_n_1(10) = ${sum_to_n_1(10)}`);
console.log(`sum_to_n_2(10) = ${sum_to_n_2(10)}`);
console.log(`sum_to_n_3(10) = ${sum_to_n_3(10)}`); 

