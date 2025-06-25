var sum_to_n_a = function (n) {
  // your code here
  if (n <= 0) {
    return 0;
  }
  return n + sum_to_n_a(n - 1);
};

var sum_to_n_b = function (n) {
  // your code here
  let sum = 0;
  let i = 1;
  while (i <= n) {
    sum += i;
    i++;
  }
  return sum;
};

var sum_to_n_c = function (n) {
  // your code here
  return (n * (n + 1)) / 2;
};
