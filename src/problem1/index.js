var sum_to_n_a = function(n) {
  return n * (n + 1) / 2;
}

var sum_to_n_b = function(n) {
  return Array.from({length: n}, (_,i) => i + 1).reduce((acc, curr) => acc + curr, 0);
}

var sum_to_n_c = function(n){
  if(n <= 0) return 0;

  return sum_to_n_c(n - 1) + n;
}
