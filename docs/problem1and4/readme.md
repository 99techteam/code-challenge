For the problem we have 3 solutions:
First is using an algorithm math formula to calculate which is simple and fast O(1) time complexity and O(1) space complexity.
Second is using an iterative approach which is simple and fast O(n) time complexity and O(1) space complexity.
Third is using an recursive approach which is simple and fast O(n) time complexity and O(n) space complexity.

```go
/**
 * Implementation A: Mathematical formula (Gauss)
 * Time Complexity: O(1) - Constant time arithmetic operations
 * Space Complexity: O(1) - Constant space
 */
func sum_to_n_a(n: number): number {
    return (n * (n + 1)) / 2;

}

/**
 * Implementation B: Iterative approach
 * Time Complexity: O(n) - Loops n times
 * Space Complexity: O(1) - Constant space for sum variable
 */
func sum_to_n_b(n: number): number {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}
/**
 * Implementation C: Recursive approach
 * Time Complexity: O(n) - n recursive calls
 * Space Complexity: O(n) - Call stack grows to n
 */
func sum_to_n_c(n: number): number {
    if (n <= 1) return n;
    return n + sum_to_n_c(n - 1);
}
```
