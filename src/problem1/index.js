var sum_to_n_a = function (n) {
  return (n * (n + 1)) / 2;
};

var sum_to_n_b = (function () {
  const cache = new Map();

  return function (n) {
    if (cache.has(n)) {
      return cache.get(n);
    }
    const result = (n * (n + 1)) >> 1;
    cache.set(n, result);
    return result;
  };
})();

var sum_to_n_c = function (n) {
  let sum = 0;
  while (n > 0) {
    sum += n--;
  }
  return sum;
};

console.log("Solution 1: " + sum_to_n_a(9));
console.log("Solution 2: " + sum_to_n_b(9));
console.log("Solution 3: " + sum_to_n_c(9));
