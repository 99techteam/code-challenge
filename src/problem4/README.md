# Problem 4 — Sum from 1 to n

Three TypeScript implementations of the summation \(1 + 2 + \cdots + n\), with correctness checks and a performance comparison suitable for technical review.

## Project overview

**Goal:** Given a non-negative integer `n`, return the sum of all integers from `1` to `n`.

| Input | Output |
|-------|--------|
| `n = 5` | `15` |
| `n = 10` | `55` |

Results are assumed to stay below `Number.MAX_SAFE_INTEGER`.

## Getting started

```bash
npm install
npm run dev    # run tests + benchmarks (ts-node)
npm run build  # compile to dist/
npm start      # run compiled output
```

Source entry point: `src/main.ts`.

## Implementations

### `sum_to_n_a` — iterative loop

Accumulates a running total from `1` through `n` using a `for` loop.

```ts
function sum_to_n_a(n: number): number {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
}
```

Straightforward and easy to follow; performance scales linearly with `n`.

### `sum_to_n_b` — recursion

Defines the sum recursively: `sum(n) = n + sum(n - 1)`, with base case `n <= 0 → 0`.

```ts
function sum_to_n_b(n: number): number {
  if (n <= 0) {
    return 0;
  }
  return n + sum_to_n_b(n - 1);
}
```

Mirrors the mathematical definition; each step consumes call-stack space.

### `sum_to_n_c` — mathematical formula

Uses Gauss’s formula: \(\frac{n(n + 1)}{2}\).

```ts
function sum_to_n_c(n: number): number {
  return (n * (n + 1)) / 2;
}
```

Constant-time arithmetic regardless of `n` (within safe integer limits).

## Complexity analysis

| Implementation | Time | Space | Notes |
|----------------|------|-------|-------|
| `sum_to_n_a` (loop) | O(n) | O(1) | One addition per integer |
| `sum_to_n_b` (recursion) | O(n) | O(n) | Call stack depth equals `n` |
| `sum_to_n_c` (formula) | O(1) | O(1) | Fixed number of operations |

## Efficiency conclusion

**`sum_to_n_c` is optimal** for this problem:

- **Time:** O(1) — multiply, add, and divide once.
- **Space:** O(1) — no auxiliary structures or stack growth.

The loop and recursion both perform O(n) work. Recursion adds function-call and stack-frame overhead on every step, so it is typically slower than the loop even though both are O(n) in big-O terms.

For production use, prefer the formula unless there is a specific reason to demonstrate iteration or recursion (e.g. teaching or interviews).

## Benchmarking

The project includes a separate benchmark phase (after correctness tests) that times each function under load.

### Configuration

| Constant | Value | Rationale |
|----------|-------|-----------|
| `BENCHMARK_N` | `8_000` | Large enough to expose loop vs formula cost; below Node’s default recursion stack limit (~9.5k frames) |
| `BENCHMARK_ITERATIONS` | `100_000` | Enough repetitions for stable, readable timings |

### Why repeated iterations?

A single call—especially for the formula—often completes in microseconds. Running many iterations:

- Averages out timer noise and system jitter
- Makes differences between approaches visible in console output

### Why warm-up execution?

The first call to a function can be slower due to JIT compilation and CPU caches. `benchmarkSumFunction` calls `fn(n)` once before timing so measurements reflect steady-state performance.

### Why `void resultSink`?

The benchmark loop accumulates return values into `resultSink`. Without using that value, a JavaScript engine might optimize away the loop as dead code. `void resultSink` keeps the work observable without changing the measured functions.

### Why `performance.now()`?

Node’s `performance.now()` (from `node:perf_hooks`) provides sub-millisecond resolution suitable for micro-benchmarks, unlike `Date.now()` which is coarser. Timings are reported as total milliseconds and average milliseconds per call.

### Sample output (illustrative)

```
=== Performance benchmark ===
n = 8000, iterations = 100000

sum_to_n_a (loop)
  total time:   ~800–1100 ms
  average time: ~0.008–0.011 ms per call

sum_to_n_b (recursion)
  total time:   ~9000–11000 ms
  average time: ~0.09–0.11 ms per call

sum_to_n_c (formula)
  total time:   ~1–3 ms
  average time: ~0.00001–0.00002 ms per call
```

Exact numbers vary by machine and Node version; the formula should remain orders of magnitude faster than the loop, and the loop faster than recursion.

## Design decisions

### Recursion stack limitations

`sum_to_n_b` creates one stack frame per integer down to the base case. In Node.js, depths around **10,000** commonly hit `Maximum call stack size exceeded`. That limit is independent of `Number.MAX_SAFE_INTEGER`—you can overflow the stack long before numeric overflow.

Benchmarks use `n = 8_000` so recursion completes reliably without modifying the recursive implementation.

### Why recursion is less efficient

Recursion and the loop both do O(n) arithmetic, but recursion pays extra cost per step:

- Function call / return overhead
- O(n) call-stack memory

The loop runs in a single stack frame with O(1) extra space.

### Why benchmark logic is isolated

Benchmarking lives in `benchmarkSumFunction`, `runBenchmarks()`, and constants—not inside `sum_to_n_a`, `sum_to_n_b`, or `sum_to_n_c`. That keeps:

- Core functions **pure** and easy to test
- Performance instrumentation **optional** and replaceable
- Reviewers able to judge algorithm correctness without measurement noise

### Why functions are not modified for measurement

Injecting timers or counters into the sum implementations would couple them to benchmarking concerns and change their structure. Passing function references into a generic benchmark harness preserves original behavior and matches how you would test production code in isolation.

## AI-assisted development disclosure

This submission was developed with AI tooling used deliberately and reviewed by the author.

| Tool | Role |
|------|------|
| **ChatGPT** | Prompt engineering and conceptual explanations (complexity, benchmarking theory, documentation structure) |
| **Cursor** | Agentic-assisted implementation (scaffolding, refactors, README drafting) |

**Author responsibility:**

- All generated code was **manually reviewed** and understood before acceptance.
- Correctness was verified via test cases and by running the project locally.
- Outputs were **not** accepted blindly; implementations and docs were edited to match intent and standards.

**Scope note:** The base assignment required three implementations and basic tests. The **benchmarking / time-comparison section** was the author’s own extension—added intentionally to demonstrate performance reasoning beyond the minimum spec.

## Project structure

```
problem4/
├── src/
│   └── main.ts      # implementations, tests, benchmarks
├── package.json
├── tsconfig.json
└── README.md
```

## License

ISC — see `package.json`.
