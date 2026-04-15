# 99Tech Backend Assessment

This repository contains my backend assessment solutions for 99Tech.

## Problem 4

File: `src/problem4.ts`

The task is to provide three unique TypeScript implementations of:

```ts
function sum_to_n(n: number): number
```

For example:

```ts
sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15
```

### Assumption

The prompt says `n` can be any integer, but only defines the positive case.
For `n <= 0`, I interpret "sum to n" as walking from `1` down to `n`.

Example:

```ts
sum_to_n(-3) === 1 + 0 + (-1) + (-2) + (-3) === -5
```

The prompt also states that the result will always be less than
`Number.MAX_SAFE_INTEGER`.

### Implementations

- `sum_to_n_a`: arithmetic formula, `O(1)` time and `O(1)` space.
- `sum_to_n_b`: iterative loop, `O(|n|)` time and `O(1)` space.
- `sum_to_n_c`: recursion, `O(|n|)` time and `O(|n|)` space.

### Run

```bash
npm install
npm run build
npm start
```
