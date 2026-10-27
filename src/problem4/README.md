# Problem 4 — Three ways to sum to n

Implementations and complexity comments are in [sum.ts](sum.ts). Run `npm install && npm test && npm run typecheck` with Node.js 24 or later.

**Assumption:** The sum means integers from 1 through n, so for n <= 0 the empty sum is 0. The input must be a safe integer; the prompt guarantees the output fits within Number.MAX_SAFE_INTEGER. The formula is fastest for large n; the loop and recursion intentionally demonstrate distinct approaches.
