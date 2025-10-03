// Solution 1: Recursive approach
function sum_to_n_1(n) {
    if (n <= 0) {
        return 0;
    } else {
        return n + sum_to_n_1(n - 1);
    }
}
console.log('Testing solution 1:');
console.log(`Result: ${sum_to_n_1(5)} - Respect: 15`); // Output: 15
console.log(`Result: ${sum_to_n_1(10)} - Respect: 55`); // Output: 55
console.log(`Result: ${sum_to_n_1(0)} - Respect: 0`); // Output: 0
console.log(`Result: ${sum_to_n_1(-3)} - Respect: 0`); // Output: 0

// Solution 2: Using the formula n * (n + 1) / 2
function sum_to_n_2(n) {
    if (n <= 0) {
        return 0;
    } else {
        return (n * (n + 1)) / 2;
    }
}
console.log('Testing solution 2:');
console.log(`Result: ${sum_to_n_2(5)} - Respect: 15`); // Output: 15
console.log(`Result: ${sum_to_n_2(10)} - Respect: 55`); // Output: 55
console.log(`Result: ${sum_to_n_2(0)} - Respect: 0`); // Output: 0
console.log(`Result: ${sum_to_n_2(-3)} - Respect: 0`); // Output: 0

// Solution 3: Iterative approach
function sum_to_n_3(n) {
    if (n <= 0) {
        return 0;
    } else {
        let sum = 0;
        for (let i = 1; i <= n; i++) {
            sum += i;
        }
        return sum;
    }
}
console.log('Testing solution 3:');
console.log(`Result: ${sum_to_n_3(5)} - Respect: 15`); // Output: 15
console.log(`Result: ${sum_to_n_3(10)} - Respect: 55`); // Output: 55
console.log(`Result: ${sum_to_n_3(0)} - Respect: 0`); // Output: 0
console.log(`Result: ${sum_to_n_3(-3)} - Respect: 0`); // Output: 0
