# Sum to N: Different Solutions in JavaScript

## 1. Solution 1: Arithmetic Formula

Just use 1 formula to calculate sum to `n`:

$$
\text{sum} = \frac{n(n + 1)}{2}
$$

```jsx
function sumToN(n) {
  return (n * (n + 1)) / 2;
}
```

**Space Complexity:** O(1)  
**Time Complexity:** O(1)

> At first glance, this solution may seem simple, but it's not really straightforward, as not everyone is likely to remember the formula.

---

## 2. Solution 2: Using Recursion

Use recursion to express the sum to `n` as `n + sumToN(n - 1)`, with a base case of `n ≤ 1`.

```jsx
function sumToN(n) {
  if (n <= 1) return n;
  return n + sumToN(n - 1);
}
```

**Space Complexity:** O(n)  
**Time Complexity:** O(n)

> This solution maintains simplicity and is easy to understand and visualize, but its complexity increases linearly with `n` in both time and space.

The space complexity arises from the recursive call stack — each return of function call stores an intermediate value and won't be released until the entire chain resolves.

If we want to avoid this O(n) space overhead, we can switch to an iterative approach — leading us to **Solution 3**.

---

## 3. Solution 3: Using Loop

Use a loop to accumulate the sum from `1` to `n`, similar in spirit to recursion but implemented iteratively.

```jsx
function sumToN(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}
```

**Space Complexity:** O(1)  
**Time Complexity:** O(n)

> Importantly, using a loop **reduces space complexity** compared to recursion by avoiding the growth of the call stack, keeping memory usage constant regardless of input size.

---

## Full Example

```jsx
const n = 10;

function formulaSumToN(n) {
  return (n * (n + 1)) / 2;
}

function recursiveSumToN(n) {
  if (n <= 1) return n;
  return n + recursiveSumToN(n - 1);
}

function loopSumToN(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

console.log(formulaSumToN(n)); // 55
console.log(recursiveSumToN(n)); // 55
console.log(loopSumToN(n)); // 55
```
