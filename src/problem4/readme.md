### Problem 4: Sum to N

Provide 3 unique implementations of the following function in TypeScript.

- Comment on the complexity or efficiency of each function.

**Input**: `n` - any integer

*Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`*.

**Output**: `return` - summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.

`Also added ->`
`sum_to_n(-5) === -5 + -4 + -3 + -2 + -1 === -15`

## Implementations

```
## sum_to_n_a
## Iterative approach

 function sum_to_n_a(n: number): number {
    const val = Math.trunc(n);
    const absN = Math.abs(val);

    let sum = 0;
    for (let i = 1; i <= absN; i++) {
            sum += i;
    }

    return val < 0 ? -sum : sum;
}
```

| **Implementation** | **Approach** | **Time Complexity** | **Space Complexity** |
| --- | --- | --- | --- |
| `sum_to_n_a` | Iterative (Loop) | O(n) | O(1) |



```
## sum_to_n_b
## Recursive approach

function sum_to_n_b(n: number): number {
    const val = Math.trunc(n);
    if (val === 0) return 0; 

    const recursiveSum = (num: number): number => {
        if (num === 1) return 1;
        return num + recursiveSum(num - 1);
    };

    const absN = Math.abs(val);
    const result = recursiveSum(absN);
    
    return val < 0 ? -result : result;
}
```

| **Implementation** | **Approach** | **Time Complexity** | **Space Complexity** |
| --- | --- | --- | --- |
| `sum_to_n_b` | Recursive | O(n) | O(n) |


```
## sum_to_n_c
## Mathematical approach (Gauss's Formula)

function sum_to_n_c(n: number): number {
    const val = Math.trunc(n);
    
    if (val === 0) return 0;

    const absN = Math.abs(val);
    const sum = (absN * (absN + 1)) / 2;

    return val < 0 ? -sum : sum;
}

```

| **Implementation** | **Approach** | **Time Complexity** | **Space Complexity** |
| --- | --- | --- | --- |
| `sum_to_n_c` | Mathematical (Gauss) | O(1) | O(1) |




## Design Philosophy

The solutions share a consistent design to ensure reliability across all input types:

- **Normalization:** All inputs are processed using `Math.trunc()` to handle floating-point numbers and `Math.abs()` to handle negative ranges. The original sign is restored at the final step.
- **Edge Case Handling:** Explicit guards are implemented for `0` to prevent unnecessary iterations or stack depth.
- **Consistency:** Every implementation follows the same mathematical contract, ensuring predictable results regardless of which function is called.

## Getting Started

### Prerequisites

- Node.js (v22+)
- `npm`

### Installation

1. Clone the repository.
2. Install the required dependencies:Bash
    
    ```
    npm install
    ```
    

### Running Tests

The project includes a comprehensive Jest test suite that validates positive, negative, decimal, and boundary inputs for all three implementations.

- **Run all tests:**
    
    ```
    pnpm test
    ```
    
- **Run tests for a specific implementation:**
    
    ```
    pnpm test "specific test file"
    
    pnpm test src/problem4/sum_to_n.test.ts
    
    ```
    

- **Sample out put**

```
  sum_to_n implementations
    sum_to_n_a
      ✓ sums positive integers correctly (1 to 5) (1 ms)
      ✓ handles the base case of 1 (2 ms)
      ✓ returns 0 for 0
      ✓ handles negative integers correctly (-5 to -1)
      ✓ sanitizes decimal inputs (truncates 5.9 to 5)
      ✓ handles negative decimal inputs (-5.9 to -5)
      ✓ handles large numbers (within MAX_SAFE_INTEGER)
    sum_to_n_b
      ✓ sums positive integers correctly (1 to 5)
      ✓ handles the base case of 1 (1 ms)
      ✓ returns 0 for 0
      ✓ handles negative integers correctly (-5 to -1)
      ✓ sanitizes decimal inputs (truncates 5.9 to 5)
      ✓ handles negative decimal inputs (-5.9 to -5)
      ✓ handles large numbers (within MAX_SAFE_INTEGER)
    sum_to_n_c
      ✓ sums positive integers correctly (1 to 5)
      ✓ handles the base case of 1
      ✓ returns 0 for 0
      ✓ handles negative integers correctly (-5 to -1)
      ✓ sanitizes decimal inputs (truncates 5.9 to 5)
      ✓ handles negative decimal inputs (-5.9 to -5)
      ✓ handles large numbers (within MAX_SAFE_INTEGER)

Test Suites: 1 passed, 1 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        0.07 s, estimated 1 s
Ran all test suites matching src/problem4/sum_to_n.test.ts.
```
## File Structure
```
problem4/
  ├─ sum_to_n.ts        # Source code for three implementations
  ├─ sum_to_n.test.ts       # Test script
  └─ readme.md          # This file
```

## Summary 
| **Implementation** | **Approach** | **Time Complexity** | **Space Complexity** |
| --- | --- | --- | --- |
| `sum_to_n_a` | Iterative (Loop) | O(n) | O(1) |
| `sum_to_n_b` | Recursive | O(n) | O(n) |
| `sum_to_n_c` | Mathematical (Gauss) | O(1) | O(1) |
