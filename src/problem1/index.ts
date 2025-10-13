var sum_to_n_a = function(n) {
  return n * (n + 1) / 2;
};

var sum_to_n_b = function(n){
  let sum = 0;
  for(let i = 0; i <= n; i++) {
    sum += i;
  }
  return sum;
};

var sum_to_n_c = function(n) {
  if(n === 0) return 0;
  return n + sum_to_n_c(n - 1);
};

console.log("Sum to 100 (A):", sum_to_n_a(100));
console.log("Sum to 100 (B):", sum_to_n_b(100));
console.log("Sum to 100 (C):", sum_to_n_c(100));

console.log("Sum to 1000 (A):", sum_to_n_a(1000));
console.log("Sum to 1000 (B):", sum_to_n_b(1000));
console.log("Sum to 1000 (C):", sum_to_n_c(1000));

console.log("Sum to 10000 (A):", sum_to_n_a(7000));
console.log("Sum to 10000 (B):", sum_to_n_b(7000));
console.log("Sum to 10000 (C):", sum_to_n_c(7000));
