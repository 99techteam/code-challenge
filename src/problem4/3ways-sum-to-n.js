// sum using loop
var sum_to_n_a = function(n) {
  if (n <= 0) {
    return 0;
  }

  if (!Number.isInteger(n)) {
    return ('n is not a integer');
  }

  var sum = 0;

  for (var i = 0; i <= n; i++) {
    sum += i;
  }

  return sum;
};

// sum using recursion
var sum_to_n_b = function(n) {
  if (n <= 0) {
    return 0;
  }

  if (!Number.isInteger(n)) {
    return ('n is not a integer');
  }

  if (n === 1) {
    return 1;
  }

  return n + sum_to_n_b(n - 1);
};

// sum using Gauss S = n(n+1)/2
var sum_to_n_c = function(n) {
  if (n <= 0) {
    return 0;
  }

  if (!Number.isInteger(n)) {
    return ('n is not a integer');
  }

  return n*(n+1)/2;
};

console.log('First solution:');
console.log('Sum(0): ', sum_to_n_a(0));
console.log('Sum(""): ', sum_to_n_a(''));
console.log('Sum(5.5): ', sum_to_n_a(5.5));
console.log('Sum(1): ', sum_to_n_a(1));
console.log('Sum(5): ', sum_to_n_a(5));
console.log('Sum(10): ', sum_to_n_a(10));
console.log('Sum(100): ', sum_to_n_a(100));
console.log('Sum(1000): ', sum_to_n_a(1000));

console.log('\n------------------------------------------');

console.log('2nd solution:');
console.log('Sum(0): ', sum_to_n_b(0));
console.log('Sum(""): ', sum_to_n_b(''));
console.log('Sum(5.5): ', sum_to_n_b(5.5));
console.log('Sum(1): ', sum_to_n_b(1));
console.log('Sum(5): ', sum_to_n_b(5));
console.log('Sum(10): ', sum_to_n_b(10));
console.log('Sum(100): ', sum_to_n_b(100));
console.log('Sum(1000): ', sum_to_n_b(1000));

console.log('\n------------------------------------------');

console.log('3rd solution:');
console.log('Sum(0): ', sum_to_n_c(0));
console.log('Sum(""): ', sum_to_n_c(''));
console.log('Sum(5.5): ', sum_to_n_c(5.5));
console.log('Sum(1): ', sum_to_n_c(1));
console.log('Sum(5): ', sum_to_n_c(5));
console.log('Sum(10): ', sum_to_n_c(10));
console.log('Sum(100): ', sum_to_n_c(100));
console.log('Sum(1000): ', sum_to_n_c(1000));
