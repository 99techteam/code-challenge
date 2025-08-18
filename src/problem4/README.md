# Problem 4: Sum 1 to n

Three different ways to calculate sum from 1 to n.

## The Functions

- `sum_to_n_a` - Uses math formula (fastest)
- `sum_to_n_b` - Basic for loop
- `sum_to_n_c` - Recursive approach

## How they work

**Formula approach**: Just uses `n * (n + 1) / 2`. Super fast.

**Loop approach**: Adds up 1 + 2 + 3 + ... + n. Easy to understand.

**Recursive**: Calls itself with n-1. Kinda neat but slow for big numbers.

## Running it

```bash
npm run build
npm run test
```

All three should give the same answer. The math one is obviously fastest but the loop is fine for most stuff.
