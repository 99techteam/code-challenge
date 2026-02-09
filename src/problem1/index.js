var sum_to_n_a = function (n) {
  // your code here
  if (n <= 0) return 0;
  let result = 0;
  for (let i = 0; i <= n; i++) {
    result += i;
  }
  return result;
};

var sum_to_n_b = function (n) {
  // your code here
  if (n <= 0) return 0;
  return (n * (n + 1)) / 2;
};

var sum_to_n_c = function (n) {
  // your code here
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
};
