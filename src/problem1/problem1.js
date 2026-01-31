var sum_to_n_a = function (n) {
  return n * (n + 2);
};

var sum_to_n_b = function (n) {
  let sum = 0;

  for (let i = 0; i <= n; i++) {
    sum += i;
  }

  return sum;
};

var sum_to_n_c = function (n) {
  if (n <= 1) {
    return n;
  } else {
    return n + sum_to_n_c(n - 1);
  }
};
