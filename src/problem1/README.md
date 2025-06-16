# Sum to N - Three Implementation Approaches

This project demonstrates three different approaches to calculate the sum of integers from 1 to n
## Problem Statement

Calculate the sum: 1 + 2 + 3 + ... + n

## Implementations

### Implementation A: Mathematical Formula
```javascript
var sum_to_n_a = function(n) {
    return (n * (n + 1)) >> 1;
};
```
- **Approach**: Uses the arithmetic series formula: n × (n + 1) ÷ 2
- **Time Complexity**: O(1) - Constant time
- **Space Complexity**: O(1) - Constant space
- **Advantages**: Most efficient, direct mathematical solution
- **Note**: Uses bit shift operator (`>> 1`) for division by 2

### Implementation B: Iterative Loop
```javascript
var sum_to_n_b = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};
```
- **Approach**: Loops through each number and accumulates the sum
- **Time Complexity**: O(n) - Linear time
- **Space Complexity**: O(1) - Constant space
- **Advantages**: Easy to understand, memory efficient

### Implementation C: Recursive
```javascript
var sum_to_n_c = function(n) {
    if (n <= 1) {
        return n;
    }
    return n + sum_to_n_c(n - 1);
};
```
- **Approach**: Recursively calls itself with n-1 until base case
- **Time Complexity**: O(n) - Linear time
- **Space Complexity**: O(n) - Linear space (call stack)
- **Advantages**: Elegant recursive solution
- **Disadvantages**: Risk of stack overflow for large n

## Complexity Comparison

| Implementation | Time Complexity | Space Complexity | Performance |
|---------------|----------------|------------------|-------------|
| A (Formula)   | O(1)           | O(1)             | Best        |
| B (Iterative) | O(n)           | O(1)             | Good        |
| C (Recursive) | O(n)           | O(n)             | Worst       |

## Recommendations

- **Use Implementation A** for production code - most efficient
- **Use Implementation B** for educational purposes or when clarity is prioritized
- **Use Implementation C** sparingly, mainly for demonstrating recursion concepts