const isPositiveInteger = (n) => {
  return typeof n === 'number' && Number.isInteger(n) && n > 0;
}

const sum_to_n_a = function (n) {
  if (!isPositiveInteger(n)) {
    throw new Error('Input must be a non-negative integer');
  }
  
  if (n <= 1) {
    return n;
  }
  return n + sum_to_n_a(n - 1);
};

const sum_to_n_b = function (n) {
  if (!isPositiveInteger(n)) {
    throw new Error('Input must be a non-negative integer');
  }
  
  let res = 0;
  for (let i = 1; i <= n; i++) {
    res += i;
  }
  return res;
};

const sum_to_n_c = function (n) {
  if (!isPositiveInteger(n)) {
    throw new Error('Input must be a non-negative integer');
  }
  
  return (n * (n + 1)) / 2;
};