# Problem 4 — Stress-test results

## Verification status

```text
Status: PASSED
Assertions: 1,869,698
Maximum safe-result input: 134,217,727
Node.js: v22.16.0
Version 5.8.3
```

## Test coverage

The automated stress suite verifies:

1. fixed examples, zero, and signed edge cases;
2. independent iterative accumulation for every input from `-100,000` to `100,000`;
3. 250,000 deterministic random inputs checked against a `BigInt` oracle;
4. 4,096 values at both positive and negative safe-result boundaries;
5. powers of two and neighboring values;
6. recurrence and sign metamorphic identities;
7. invalid runtime inputs;
8. warmed, multi-round performance benchmarks with rotating execution order.

## Benchmark

The benchmark uses varying valid inputs, 40,000 warm-up calls per
implementation, 9 measured rounds, and 120,000 calls per round.

| Rank | Implementation | Median | Operations/second | Relative |
|---:|---|---:|---:|---:|
| 1 | `sum_to_n_a` — Gauss formula | 1.574 ms | 76,220,723 | 1.00× |
| 2 | `sum_to_n_c` — Binary block decomposition | 24.352 ms | 4,927,689 | 15.47× |
| 3 | `sum_to_n_b` — Matrix exponentiation | 192.863 ms | 622,202 | 122.50× |

## Best algorithm

### `sum_to_n_a` — Gauss formula

It is the best implementation for this exact problem because it has:

```text
Time:  O(1)
Space: O(1)
```

It also has the smallest implementation surface and the lowest measured median
runtime in this stress test.

### Why not B?

`sum_to_n_b` is algorithmically interesting and demonstrates matrix
exponentiation, but it performs many fixed-size matrix multiplications. Its
`O(log |n|)` complexity cannot beat a direct `O(1)` identity for this problem.

### Why not C?

`sum_to_n_c` is more lightweight than matrix exponentiation and demonstrates
binary decomposition, but it still inspects `O(log |n|)` blocks. It is useful
as an alternative algorithm, not as the production choice.

## Recommendation

Keep all three functions because the task explicitly requests three unique
implementations, but treat `sum_to_n_a` as the preferred implementation.

```ts
export const sum_to_n = sum_to_n_a;
```

Benchmark timing is environment-dependent. The correctness result and
asymptotic recommendation do not depend on the benchmark machine.
