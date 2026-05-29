# Problem 4: Three Ways to Sum to n

## Problem Description

Provide 3 unique implementations of a function that calculates the summation of all integers from 1 to n.

### Specifications

- **Input**: `n` - any integer
- **Output**: summation to n (e.g., `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`)
- **Assumptions**:
  - Result will always be less than `Number.MAX_SAFE_INTEGER`
  - Negative integers should return 0
  - Non-integer inputs should be truncated to the nearest lower integer

---

## Implementation A: Recursion

```typescript
function sum_to_n_a(n: number): number {
  if (n < 0)
    return 0;

  n = Math.trunc(n);

  if (n <= 1)
    return n;
  else
    return n + sum_to_n_a(n - 1);
}
```

### Complexity Analysis

| Metric                | Value |
|--------               |-------|
| **Time Complexity**   | O(n)  |
| **Space Complexity**  | O(n)  |

### Efficiency Comment

Least efficient due to function call overhead and risk of stack overflow for large n values. However, it is elegant and easy to understand. Not recommended for production use with large inputs.

---

## Implementation B: Loop (Iterative)

```typescript
function sum_to_n_b(n: number): number {
  if (n < 0)
    return 0;

  n = Math.trunc(n);

  let sum: number = 0;

  for (let i = 1; i <= n; i++)
    sum += i;

  return sum;
}
```

### Complexity Analysis

| Metric                | Value |
|--------               |-------|
| **Time Complexity**   | O(n)  |
| **Space Complexity**  | O(1)  |

### Efficiency Comment

More efficient than recursion. No stack overflow risk. Provides a good balance between readability and performance for moderate values of n. Suitable for general use cases.

---

## Implementation C: Mathematical Formula

```typescript
function sum_to_n_c(n: number): number {
 if (n < 0)
  return 0;
 
 n = Math.trunc(n);
 
 return (n * (n + 1)) / 2;
}
```

### Complexity Analysis

| Metric                | Value |
|--------               |-------|
| **Time Complexity**   | O(1)  |
| **Space Complexity**  | O(1)  |

### Efficiency Comment

**Most efficient**. Uses the mathematical formula for arithmetic series: n(n+1)/2. Delivers instant results regardless of input size with no loops or recursion. Recommended for production use.

---

## Summary Comparison

| Method        | Time | Space  | Best For                              |
|--------       |------|------- |----------                             |
| **Recursion** | O(n) | O(n)   | Educational purposes, small n values  |
| **Loop**      | O(n) | O(1)   | Balanced approach, moderate n values  |
| **Formula**   | O(1) | O(1)   | **Production code, optimal solution** |

---

## Example Usage

```typescript
console.log(sum_to_n_a(5));   // Output: 15
console.log(sum_to_n_b(5));   // Output: 15
console.log(sum_to_n_c(5));   // Output: 15

console.log(sum_to_n_a(-3));  // Output: 0
console.log(sum_to_n_b(3.7)); // Output: 6 (truncates to 3)
```
