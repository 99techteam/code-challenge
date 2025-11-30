# Problem 4 – Sum to n

This folder contains three unique TypeScript implementations for computing the summation from `1` through `n` (where `n ≥ 0` and the result stays below `Number.MAX_SAFE_INTEGER`).

## Files

- `sum_to_n.ts`
  - `sum_to_n_a`: Iterative accumulator using a for-loop (`O(n)` time, `O(1)` space).
  - `sum_to_n_b`: Divide-and-conquer recursion that halves the interval (`O(n)` time, `O(log n)` stack space).
  - `sum_to_n_c`: Constant-time arithmetic progression formula (`O(1)` time, `O(1)` space).

Each function truncates the incoming value to an integer and throws if a negative number is provided, mirroring the assumptions in the prompt.

## Running the snippets

Any TypeScript runtime/bundler will work. For a quick check from the repo root:

```bash
# Compile problem4 TS to JS
npx tsc src/problem4/sum_to_n.ts --target ES2020 --module commonjs --outDir dist/problem4

# Run a small verification
node - <<'NODE'
const sums = require('./dist/problem4/sum_to_n');
console.log('a(10)=', sums.sum_to_n_a(10));
console.log('b(10)=', sums.sum_to_n_b(10));
console.log('c(10)=', sums.sum_to_n_c(10));
NODE
```

Alternatively, drop the file into any TypeScript playground and invoke the exported functions directly.
