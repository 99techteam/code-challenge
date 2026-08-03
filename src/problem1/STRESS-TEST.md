# Problem 1 stress test

Place these files in:

```text
D:\99\code-challenge\src\problem1\
```

## Standard run

When the terminal is already in `src\problem1`:

```bat
node stress-test.js standard
```

Or:

```bat
run-stress.cmd standard
```

From the repository root:

```bat
node src\problem1\stress-test.js standard
```

## Modes

```text
smoke     Fast verification
standard  Recommended before committing
heavy     High-volume test
```

Examples:

```bat
node stress-test.js smoke
node stress-test.js standard
node stress-test.js heavy
```

Use a deterministic seed:

```bat
node stress-test.js standard 20260803
```

The same mode and seed produce the same random inputs.

## Coverage

The stress test checks:

- edge cases and zero;
- positive and negative integers;
- exhaustive small ranges;
- deterministic randomized inputs;
- precision near `Number.MAX_SAFE_INTEGER`;
- exact BigInt reference values;
- agreement between implementations;
- `S(-n) = -S(n)`;
- `S(n) - S(n - 1) = n`;
- invalid input rejection;
- audit callback events from `index.js`;
- integration with `audit.js`;
- throughput and the long-running O(n) implementation.

## Reports

Reports are written to:

```text
src\problem1\logs\stress-test-....log
src\problem1\logs\stress-test-....json
```
