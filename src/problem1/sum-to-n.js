// a. for loop
var sum_to_n_a = function (n) {
  if (n < 1) {
    return 0;
  }
  var total = 0;
  for (var i = 1; i <= n; i++) {
    total += i;
  }
  return total;
};

// b. formula
var sum_to_n_b = function (n) {
  if (n < 1) {
    return 0;
  }
  return (n * (n + 1)) / 2;
};

// c. recursion
var sum_to_n_c = function (n) {
  if (n < 1) {
    return 0;
  }
  return n + sum_to_n_c(n - 1);
};
