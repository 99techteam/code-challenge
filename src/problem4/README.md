# Problem 4: Summation to n

This folder contains three TypeScript implementations of the **triangular number** (sum of integers from 1 through n inclusive)

Example: `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.

**Assumption:** The mathematical result is always less than `Number.MAX_SAFE_INTEGER` (so you stay in the range where double-precision arithmetic in JavaScript is exact for these integers).

## Files

| File               | Purpose                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| `sum_to_n.ts`      | Three exported functions: `sum_to_n_a`, `sum_to_n_b`, `sum_to_n_c`            |
| `sum_to_n.test.ts` | Vitest checks against known values and cross-checks all three implementations |
| `tsconfig.json`    | Strict TypeScript; `module` / `moduleResolution` set to `Node16`              |
| `vitest.config.ts` | Runs tests in Node against `*.test.ts`                                        |

## Implementations

| Function     | Approach                 | Time | Extra space  |
| ------------ | ------------------------ | ---- | ------------ |
| `sum_to_n_a` | Closed form \(n(n+1)/2\) | O(1) | O(1)         |
| `sum_to_n_b` | Iterative `for` loop     | O(n) | O(1)         |
| `sum_to_n_c` | `Array.from` + `reduce`  | O(n) | O(n) (array) |

For large nonnegative `n`, **`sum_to_n_a`** does the least work. **`sum_to_n_b`** is straightforward and allocation-free. **`sum_to_n_c`** mirrors a functional style but pays for building an array.

## Setup

From this directory:

```bash
npm install
```

## Tests

```bash
npm test
```

Runs Vitest once (`vitest run`). For watch mode while editing:

```bash
npx vitest
```

## Compile (optional)

Emit JavaScript into `dist/`:

```bash
npx tsc -p .
```
