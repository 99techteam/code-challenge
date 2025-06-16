
/*
To find the maximum safe n you can use algebra:
n(n+1)/2 < Number.MAX_SAFE_INTEGER
​n =  Math.floor((-1 + Math.sqrt(1 + 8 * maxSafe)) / 2) = 134217727
*/

function checkSafeNumber(n: any) {
	const MAX_SAFE_N = 134217727;
	//check and show friendly info to user
	if (typeof n !== 'number' || !Number.isInteger(n) || isNaN(n)) {
		console.log(`Please input valid number`);
		return false;
	}
	if (n < 1) {
		console.log(`Please input value > 0`);
		return false;
	}

	if (n >= MAX_SAFE_N) {
		console.log(`Result is larger than Number.MAX_SAFE_INTEGER`);
		return false;
	}
	return true;
}

// Apply Mathematical
const sum_to_n_a = (n: number): number | null => {
	if (!checkSafeNumber(n)) return null;
	return (n * (n + 1)) / 2;
}

//Apply Recursive
const sum_to_n_b = (n: number): number | null => {
	if (!checkSafeNumber(n)) return null;
	if (n <= 1) return n;
  return n + sum_to_n_b(n - 1);
}

//Apply memoization
const sum_to_n_c = (() => {
	const cache = new Map<number, number | null>();
	return function(n: any): number | null {
		if (!checkSafeNumber(n)) return null;
		if (cache.has(n)) {
			return cache.get(n)!;
		}
		let sum = 0;
		for (let i = 1; i <= n; i++) {
			sum += i;
		}
		cache.set(n, sum);
		return sum;
	};
})();

console.log(sum_to_n_a(10));
console.log(sum_to_n_b(10));
console.log(sum_to_n_c(10));
console.log(sum_to_n_c('abc'));
console.log(sum_to_n_c(-1));
console.log(sum_to_n_c(134217727));