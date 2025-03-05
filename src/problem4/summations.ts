//Mathematical Formula Approach(n(n+1)/2)
//Time Complexity: O(1)
//Space Complexity: O(1)
//Efficiency: fastest, most optimized performance
function sum_to_n(n: number): string {
    // Check if n is a positive integer
    if (!Number.isInteger(n) || n < 1) {
        throw new Error("The input value must be a positive integer.");
    }

    // Check to avoid exceeding JavaScript safe number limits
    if (n > Number.MAX_SAFE_INTEGER) {
        throw new Error("Too large a value, may cause inaccuracy");
    }

    // String representation of addition
    let sumExpression = Array.from({ length: n }, (_, i) => i + 1).join(" + ");

    // Calculate sum by Gauss formula
    let sum = (n * (n + 1)) / 2;

    // Output
    return `sum_to_n(${n}) === ${sumExpression} === ${sum}`;
}

// Test case
function test_sum_to_n() {
    console.log(sum_to_n(5));  //  sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15
    console.log(sum_to_n(10)); //  sum_to_n(10) === 1 + 2 + ... + 10 === 55
    console.log(sum_to_n(1));  //  sum_to_n(1) === 1 === 1
}

test_sum_to_n();
