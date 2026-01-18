// ===============================
// Implementation A — Iterative
// ===============================

// Complexity
// Time: O(n) — iterates from 1 to n
// Space: O(1) — constant extra memory
//
// Notes:
// - Very readable and safe
// - Slightly slower for large n due to iteration
// - Best when clarity is preferred over performance
export const sum_to_n_a = (n: number): number => {
	let sum = 0;
	for (let i = 1; i <= n; i++) {
		sum += i;
	}
	return sum;
};

// ===============================
// Implementation B — Mathematical Formula
// ===============================

// Complexity
// Time: O(1) — constant time calculation
// Space: O(1) — constant extra memory
//
// Notes:
// - Most efficient implementation
// - No loops or recursion
// - Safe under the assumption that the result
//   is less than Number.MAX_SAFE_INTEGER
export const sum_to_n_b = (n: number): number => {
	return (n * (n + 1)) / 2;
};

// ===============================
// Implementation C — Recursive
// ===============================

// Complexity
// Time: O(n) — one recursive call per decrement
// Space: O(n) — call stack grows linearly
//
// Notes:
// - Elegant and expressive
// - Inefficient for large n due to recursion overhead
// - Risk of stack overflow; not recommended for production
export const sum_to_n_c = (n: number): number => {
	if (n <= 1) return n;
	return n + sum_to_n_c(n - 1);
};
