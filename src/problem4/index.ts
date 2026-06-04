// Time Complexity: O(1) - constant time, just arithmetic operations
// Space Complexity: O(1) - no extra memory used
function sum_to_n_a(n: number): number {
	return (n * (n + 1)) / 2;
}

// Time Complexity: O(n) - iterates through all numbers from 1 to n
// Space Complexity: O(1) - only a single accumulator variable
function sum_to_n_b(n: number): number {
	let sum = 0;
	for (let i = 1; i <= n; i++) {
		sum += i;
	}
	return sum;
}

// Time Complexity: O(n) - makes n recursive calls
// Space Complexity: O(n) - each recursive call adds a frame to the call stack
function sum_to_n_c(n: number): number {
	if (n <= 0) return 0;
	return n + sum_to_n_c(n - 1);
}

