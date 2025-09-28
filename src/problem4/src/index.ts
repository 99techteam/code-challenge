/***
Time Complexity: O(n) (linear, iterating from 1 to n).
Space Complexity: O(1) (constant, no additional memory used).
***/
function sum_to_n_a(n: number): number {
	let sum = 0;
	for (let i = 1; i <= n; i++) {
		sum += i;
	}
	return sum;
}

/***
Time Complexity: O(n) (linear, recursion from n down to 1).
Space Complexity: O(n) (linear, call stack for recursion).
***/
function sum_to_n_b(n: number): number {
	if (n <= 0) return 0;
	return n + sum_to_n_b(n - 1);
}


/***
Time Complexity: O(1) (constant, direct calculation).
Space Complexity: O(1) (constant, no additional memory used).
***/
function sum_to_n_c(n: number): number {
	return (n * (n + 1)) / 2;
}

console.log(sum_to_n_a(10)); // 55
console.log(sum_to_n_b(10)); // 55
console.log(sum_to_n_c(10)); // 55