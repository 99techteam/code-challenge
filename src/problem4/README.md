# Sum To N Challenge

Three TypeScript implementations of `sum_to_n`.

## Behavior

- `n > 0`: sum from `1` to `n`
- `n = 0`: return `0`
- `n < 0`: sum from `n` to `-1`
- Non-integer or unsafe values throw an error

## Approaches

- `sum_to_n_a`: iterative loop
- `sum_to_n_b`: arithmetic formula
- `sum_to_n_c`: pair-from-ends loop

## Run

```bash
npm run build
npm test
```

## Files

- `src/sum-to-n.ts`: implementations
- `test/sum-to-n.test.ts`: test cases
