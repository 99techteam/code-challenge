# Problem 4: Sum to N

Three ways to calculate the sum of integers from 1 to n.

## Solutions

**A. Math formula** — O(1) time, O(1) space  
Uses the formula `n * (n + 1) / 2`

**B. Iterative** — O(n) time, O(1) space  
Loops from 1 to n, accumulating the sum

**C. Recursive** — O(n) time, O(n) space  
Calls itself with `n-1` until reaching the base case

## Test

```bash
npx tsx src/problem4/index.test.ts
```
