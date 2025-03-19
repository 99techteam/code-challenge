/**
  * Provide 3 unique implementations of the following function in TypeScript.
  * - Comment on the complexity or efficiency of each function.
  * Input: `n` - any integer
  * Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`
  * Output: `return` - summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.
  */


//  Implementation 1: Looping
//  Time Complexity: O(n)
function sum_to_n_a(n) {
  let result = 0
  for(let i = 0; i <= n; i++) {
    result += i
  }
  return result
}
console.log(sum_to_n_a(5))

// Implementation 2: Math Formula
// Time Complexity: O(1)
function sum_to_n_b(n){
  return (n * (n + 1)) / 2;
}
console.log(sum_to_n_b(5))

// Implementation 3: Recursion
// Time Complexity: O(1)
function sum_to_n_c(n) {
  if(n === 0) return 0
  return n + sum_to_n_c(n - 1);
}
console.log(sum_to_n_c(5))

