
In this problem, I introduce 3 different ways to calculate sum of 1-n elements.

```javascript
var sum_to_n_a = function (n) {
  if (n <= 0) throw new Error("n must be a positive number");
  return (n * (n + 1)) / 2;
};
```
1. sum_to_n_a: By using Mathematical formula, this is the most simple way but also the most optimized way to calculate sum of 1-n elements. By applying this formula, we can get the sum of 1-n elements in O(1) time.


```javascript
var sum_to_n_b = function (n) {
  if (n <= 0) throw new Error("n must be a positive number");
  let result = 0;
  for (let i = 1; i <= n; i++) {
    result += i;
  }
  return result;
};
```
2. sum_to_n_b: By using loop this is the straight-forward way to calculate the sum of 1-n elements. By using this loop-method we can get the sum of 1-n elements in O(n) time. 


```javascript
var sum_to_n_c = function (n) {
  if (n <= 0) throw new Error("n must be a positive number");
  return recursiveSum(n);
};

function recursiveSum(n, sum = 0) {
  if (n === 0) return sum;
  return recursiveSum(n - 1, sum + n);
}
```

3. sum_to_n_c: This is the recursive way to calculate the sum of 1-n elements. By using this recursive-method we can get the sum of 1-n elements in O(n) time.

**Summary**
| Method                        | Time Complexity                        | Notes                                   |
| ----------------------------- | -------------------------------------- | --------------------------------------- |
| Using math formula            | O(1)                                   | Simple algebraic insight                |
| Loop and recursion            | O(n)                                   | Straightforward but slower              |


**Setup and Testing**
```bash
# install dependencies
pnpm i
```

```bash
# run tests
pnpm test
```
