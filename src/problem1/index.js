// Math formula
var sum_to_n_a = function(n) {
  return n * (n + 1) / 2;
};

//Recursive approach
var sum_to_n_b = function(n) {
  if (n === 1) return 1;
  return n + sum_to_n_b(n - 1);
};

// Iterative loop
var sum_to_n_c = function(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
      sum += i;
  }
  return sum;
};

// Test cases
console.log(sum_to_n_a(5)); // 15
console.log(sum_to_n_b(5)); // 15
console.log(sum_to_n_c(5)); // 15

console.log(sum_to_n_a(0)); // 0
console.log(sum_to_n_b(-3)); // 0
console.log(sum_to_n_c(10)); // 55