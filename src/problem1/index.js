// assume the number n passed to function is valid and ingnore the checking valid number n
// HOW TO RUN
// cd /src/problem1 && node index

// using formula (n * (n + 1)) / 2
var sum_to_n_a = function (n) {
  return (n * (n + 1)) / 2;
};

// using for-loop to sum up all the numbers from 1 -> n
var sum_to_n_b = function (n) {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
};
// sum up all the numbers from 1 -> n using Array
var sum_to_n_b2 = function (n) {
  return Array.from({ length: n })
    .map((_, idx) => idx + 1)
    .reduce((total, num) => total + num, 0);
};

// using recursive method
// this approach is quite bad inters of performance and memory
// it's just for showing how the recursive method work
var sum_to_n_c = function (n) {
  if (n === 1) return 1;
  return sum_to_n_c(n - 1) + n;
};

// Feel free to change this value to view the result
const n = 30;
console.log({
  sum_to_n_a: sum_to_n_a(n),
  sum_to_n_b: sum_to_n_b(n),
  sum_to_n_b2: sum_to_n_b2(n),
  sum_to_n_c: sum_to_n_c(n),
});
