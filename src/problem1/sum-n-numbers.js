/**
 * Implementation 1: Using a for loop
 */
function sum_to_n_a(n) {
	let sum = 0;
	for (let i = 1; i <= n; i++) {
		sum += i;
	}
	return sum;
}

/**
 * Implementation 2: Using recursion
 */
function sum_to_n_b(n) {
	if (n <= 0) return 0;
	return n + sum_to_n_b(n - 1);
}

/**
 * Implementation 3: Using the arithmetic series formula
 */
function sum_to_n_c(n) {
	return (n * (n + 1)) / 2;
}

// Example usage:
console.log(sum_to_n_a(5));      // 15
console.log(sum_to_n_b(5)); // 15
console.log(sum_to_n_c(5));   // 15

//How to run:
// node src/problem1/sum-n-numbers.js