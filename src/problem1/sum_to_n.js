/**
 * 1. Using a for loop:
This method iteratively adds each number from 1 to n to a running total. 
It’s straightforward and easy to understand, 
commonly used in programming for summing sequences.
 */

var sum_to_n_a = function () {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

/**
 * 2. Using the mathematical formula:
The sum of the first n natural numbers can be calculated directly using the formula n(n+1)/2 
This approach is the most efficient, as it computes the result in constant time without any loops.
 */

var sum_to_n_b = function () {
  return (n * (n + 1)) / 2;
};

/**
 * 3. Using recursion:
This method calls the function itself with n-1 until it reaches the base case (n = 1 or n = 0). 
It demonstrates the concept of recursion, 
but is less efficient for large n due to call stack limitations.
    */

var sum_to_n_c = function () {
  if (n <= 1) return n;
  return n + sum_to_n_c(n - 1);
};
