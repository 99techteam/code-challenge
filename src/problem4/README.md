# problem4

Three implementations of `sum_to_n` (formula, recursion, loop) with complexity analysis.

## Assumptions 

The solution is presented under these assumptions:

- **Negative Integers:** for all negative integers, their absolute values must be taken.

- **NaN & Infinity:** all inputs are validated against `NaN` or `Infinity` and should return `0` for these.

## Run Tests with Docker

Build the image:

```bash
docker build -t problem4 ./src/problem4
```

Run the test suite:

```bash
docker run -t --rm problem4
```

The container uses [Bun](https://bun.com) and executes `bun test` by default.

This project was created using `bun init` in bun v1.3.11.
