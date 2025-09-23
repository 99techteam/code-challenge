// Three ways to sum to n
/**
 * Input validation helper function
 * @param {*} n - input value to validate
 * @returns {number} - validated and processed input
 * @throws {Error} - if input is invalid
 */
function validateInput(n) {
    // Check if input is null or undefined
    if (n === null || n === undefined) {
        throw new Error('Input cannot be null or undefined');
    }

    // Convert to number if it's a string number
    const num = Number(n);

    // Check if it's a valid number
    if (isNaN(num)) {
        throw new Error('Input must be a valid number');
    }

    // Check if it's a floating point and convert to integer
    if (!Number.isInteger(num)) {
        throw new Error('Input must be an integer');
    }

    // Check if it's negative
    if (num < 0) {
        throw new Error('Input cannot be negative');
    }

    return num;
}

// Method 1: Iterative
var sum_to_n_a = function(n) {
    try {
        n = validateInput(n);
        if (n === 0) return 0;
        
        let sum = 0;
        for (let i = 1; i <= n; i++) {
            // Check for potential overflow
            if (sum > Number.MAX_SAFE_INTEGER - i) {
                throw new Error('Result would exceed maximum safe integer');
            }
            sum += i;
        }
        return sum;
    } catch (error) {
        throw error;
    }
};

// Method 2: Using formula
var sum_to_n_b = function(n) {
    try {
        n = validateInput(n);
        if (n === 0) return 0;
        
        // Using the formula n * (n + 1) / 2
        // Check for potential overflow before calculation
        if (n > Math.sqrt(2 * Number.MAX_SAFE_INTEGER)) {
            throw new Error('Result would exceed maximum safe integer');
        }
        
        return Math.floor(n * (n + 1) / 2);
    } catch (error) {
        throw error;
    }
};

// Method 3: Recursive
var sum_to_n_c = function(n) {
    try {
        n = validateInput(n);
        if (n === 0) return 0;
        
        // Helper function to check for stack overflow
        function recursiveSum(num, depth = 0) {
            if (depth > 10000) { // Prevent stack overflow
                throw new Error('Input too large for recursive approach');
            }
            if (num <= 1) return num;
            return num + recursiveSum(num - 1, depth + 1);
        }
        
        return recursiveSum(n);
    } catch (error) {
        throw error;
    }
};
