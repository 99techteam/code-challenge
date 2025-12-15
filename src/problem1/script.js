function isValidSumInput(n) {
  if (typeof n === "bigint") {
    return n >= 1n;
  }

  if (typeof n === "number") {
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
      return false;
    }
    if (n > Number.MAX_SAFE_INTEGER) {
      console.warn(
        `Input ${n} exceeds MAX_SAFE_INTEGER. Using BigInt for safety.`
      );
    }
    return true;
  }

  return false;
}

var sum_to_n_a = function (n) {
  if (!isValidSumInput(n)) {
    console.error(
      "Invalid input for sum_to_n_a: Parameter must be a positive whole number."
    );
    return 0n;
  }

  const largeN = BigInt(n);

  // Constant time complexity O(1)
  return (largeN * (largeN + 1n)) / 2n;
};

var sum_to_n_b = function (n) {
  if (!isValidSumInput(n)) {
    console.error(
      "Invalid input for sum_to_n_b: Parameter must be a positive whole number."
    );
    return 0n;
  }

  // Linear time complexity O(n)
  const largeN = BigInt(n);
  let sum = 0n;

  for (let i = 1n; i <= largeN; i++) {
    sum += i;
  }
  return sum;
};

var sum_to_n_c = function (n) {
  // 1. Validation Check
  if (!isValidSumInput(n)) {
    console.error(
      "Invalid input for sum_to_n_c: Parameter must be a positive whole number."
    );
    return 0n;
  }

  const largeN = BigInt(n);

  // Base case
  if (largeN === 1n) return 1n;

  // Linear time complexity O(n), but with O(n) space for the call stack
  return largeN + sum_to_n_c(largeN - 1n);
};

// console.log(sum_to_n_a(9007199254740991n));
// console.log(sum_to_n_b(9007199254740991n));
// console.log(sum_to_n_c(9007199254740991n));
