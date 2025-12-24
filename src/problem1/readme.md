# Sum to N – JavaScript Implementations

This repository demonstrates three different JavaScript implementations
for computing the summation of integers from `1` to `n`.

The goal is to showcase different coding styles, performance trade-offs,
and decision-making commonly expected from a frontend engineer.

---

## Problem Statement

Given an integer `n`, compute the summation from `1` to `n` (inclusive).

Example:

sum_to_n(5) = 1 + 2 + 3 + 4 + 5 = 15

yaml
Copy code

---

## Assumptions

- `n` is an integer
- If `n <= 0`, the function returns `0`
- The result will always be less than `Number.MAX_SAFE_INTEGER`

---

## Implementations

### 1. Iterative Approach (`sum_to_n_a`)

Uses a simple `for` loop to accumulate the sum.

- Time Complexity: **O(n)**
- Space Complexity: **O(1)**

**Why this approach**

- Very readable and easy to debug
- Familiar to all JavaScript developers
- Serves as a clear baseline solution

---

### 2. Mathematical Approach (`sum_to_n_b`) ⭐ Recommended

Uses the arithmetic series formula:

n × (n + 1) / 2

yaml
Copy code

- Time Complexity: **O(1)**
- Space Complexity: **O(1)**

**Why this approach is optimal**

- No loops or recursion
- Best possible performance
- Clear intent and minimal code
- Safest and most efficient choice for production frontend code

This is the version that should be shipped in real-world applications.

---

### 3. Functional Approach (`sum_to_n_c`)

Uses `Array.from` and `reduce` to compute the sum declaratively.

- Time Complexity: **O(n)**
- Space Complexity: **O(n)**

**Why this approach exists**

- Demonstrates functional / declarative style
- Common in modern frontend codebases
- Improves expressiveness, but trades off memory efficiency

---

## Example Output

```js
sum_to_n_a(5); // 15
sum_to_n_b(5); // 15
sum_to_n_c(5); // 15

sum_to_n_b(0); // 0
sum_to_n_b(-3); // 0
```
