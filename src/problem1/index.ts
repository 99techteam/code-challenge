/**
 * first idea in my head was using reduce function, i know the performance it not too good with many loop to generate and calculate, 
 * but the logic is clear by using the previous value to accumulate the sum. better way can a for loop but i like reduce more.
 */
const sum_to_n_a = function (n: number): number {
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (acc, val) => acc + val,
    0
  );
};

/*
 * my second idea was using math, because i love math so i found that if we calculate the sum of an arithmetic sequence, 
 * we have the last number of the list plus the first number is equal the n-1 number plus the second number, and so on. so we have n/2 pairs of (n+1).
 * but then if n is odd number the middle number will be alone without any pair. so we have n/2 -1 pares of (n+1) plus the middle number
 * but the special thing is double the middled number is equal to n + 1. then we can convert it back to n/2 pairs of (n+1).
 * so finally we have n/2 * (n + 1). 
 */
const sum_to_n_b = function (n: number): number {
  return n / 2 * (n + 1);
};

/*
 * actually i have little block with the 3rd idea, originally i want to use while loop to accumulate the sum, but then i think it may not good enough.
 * then i try to do a little research and found there are many answers in the internet lol. and i know that recursion can solve the problem.
 * then i implement it as the third way to deal with it, hope its still acceptable for the test. 
 */
const sum_to_n_c = function (n: number): number {
  if (n <= 1) {
    return n;
  }
  return n + sum_to_n_c(n - 1);
};
