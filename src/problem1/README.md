# Problem 1 — Complete quality suite

## Files

```text
src/problem1/
├── index.js
├── audit.js
├── verify-audit.js
├── stress-test.js
├── run-stress.cmd
├── README.md
└── logs/
```

## Normal execution

```javascript
const {
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
} = require("./index");

console.log(sum_to_n_a(5)); // 15
```

## Mathematical audit

From `src/problem1`:

```bat
node audit.js 5 all
```

Generated files:

```text
logs\audit-....log
logs\audit-....jsonl
logs\audit-....manifest.json
```

The JSONL evidence uses a SHA-256 hash chain. Every event contains:

- continuous `globalStep`;
- one `auditId`;
- `previousHash`;
- `eventHash`;
- timestamp;
- algorithm;
- action;
- calculation data.

## Verify an audit

```bat
node verify-audit.js logs\<manifest-file>.manifest.json
```

Expected:

```text
Audit integrity: VALID
```

Any changed, removed, reordered, duplicated, or truncated JSONL event is detected.

## Run complete testing

Recommended:

```bat
node stress-test.js standard
```

Or:

```bat
run-stress.cmd standard
```

Modes:

```text
smoke     quick local validation
standard  recommended before commit
heavy     high-volume validation
```

Deterministic seed:

```bat
node stress-test.js standard 20260803
```

## Coverage

The suite includes:

1. Valid positive, negative, zero, and boundary cases.
2. Exhaustive signed integer ranges.
3. Deterministic random tests.
4. BigInt independent oracle comparisons.
5. Precision tests near `Number.MAX_SAFE_INTEGER`.
6. Invalid type and non-integer rejection.
7. Out-of-contract result-overflow rejection.
8. Mathematical invariant testing.
9. Audit callback schema checks.
10. Logger failure propagation.
11. Audit CLI success path.
12. Audit CLI invalid argument paths.
13. File-system failure injection.
14. Algorithm failure injection and partial error audit.
15. Mutation-test sensitivity.
16. Audit tamper detection.
17. Audit truncation detection.
18. Concurrent audit isolation.
19. Subprocess timeout detection.
20. Throughput and long-loop performance checks.

Reports are written to:

```text
logs\stress-test-....log
logs\stress-test-....json
```
