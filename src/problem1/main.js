var sum_to_n_a = function (n) {
  const topNumber = n;
  const nextNumber = topNumber + 1;
  const result = (topNumber * nextNumber) / 2;
  return result;
};

var sum_to_n_b = function (n) {
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (acc, current) => acc + current,
    0
  );
};

var sum_to_n_c = function (n) {
    // recursive but with a helper function inside,
  const helper = (current, accumulator) => {
    if (current <= 0) return accumulator;
    return helper(current - 1, accumulator + current);
  };

  return helper(n, 0);
};
