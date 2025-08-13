/**
 * @param {number} n
 * */
var sum_to_n_a = function (n) {
  if (n <= 0) throw new Error("n must be a positive number");
  return (n * (n + 1)) / 2;
};

/**
 * @param {number} n
 * */
var sum_to_n_b = function (n) {
  if (n <= 0) throw new Error("n must be a positive number");
  let result = 0;
  for (let i = 1; i <= n; i++) {
    result += i;
  }
  return result;
};

/**
 * @param {number} n
 * */
var sum_to_n_c = function (n) {
  if (n <= 0) throw new Error("n must be a positive number");
  return recursiveSum(n);
};

function recursiveSum(n, sum = 0) {
  if (n === 0) return sum;
  return recursiveSum(n - 1, sum + n);
}

module.exports = {
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
};
