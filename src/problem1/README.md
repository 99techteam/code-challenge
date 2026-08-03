# Problem 1 — Three pure functions with a separate audit layer

## Design

The implementation and audit responsibilities are deliberately separated:

```text
index.js  → three pure sum functions only
audit.js  → calls the functions, builds independent proofs, and writes logs
```

`index.js` does not know about log files, hashes, manifests, callbacks, or the
CLI. Each exported solution accepts exactly one argument: `n`.

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

## The three functions in `index.js`

### A. Closed-form arithmetic-series formula

```javascript
sum_to_n_a(n)
```

Uses `n(n + 1) / 2`, dividing the even factor before multiplication.

```text
Time:  O(1)
Space: O(1)
```

### B. Fast matrix exponentiation

```javascript
sum_to_n_b(n)
```

Uses a fixed 3 × 3 transition matrix and exponentiation by squaring.

```text
Time:  O(log |n|)
Space: O(1)
```

### C. Symmetric pairing loop

```javascript
sum_to_n_c(n)
```

Pairs the smallest and largest values. The actual implementation performs the
loop so it remains computationally distinct from solution A.

```text
Time:  O(|n|)
Space: O(1)
```

## Normal execution

```javascript
const {
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
} = require("./index");

console.log(sum_to_n_a(5)); // 15
console.log(sum_to_n_b(5)); // 15
console.log(sum_to_n_c(5)); // 15
```

Negative input follows this documented convention:

```javascript
sum_to_n_a(-4); // -10 = -1 + -2 + -3 + -4
```

## Separate audit function

`audit.js` exports:

```javascript
auditAlgorithm({ key, n, algorithm, writeEvent })
```

For one algorithm it:

1. calls the pure function from `index.js`;
2. records the returned value;
3. generates a separate mathematical proof inside `audit.js`;
4. compares the implementation result with the proof result;
5. sends structured events to the provided writer.

The session-level helper is:

```javascript
runAudit({ n, selectedAlgorithm })
```

## Run an audit

From `src/problem1`:

```bat
node audit.js 5 all
```

Or one implementation:

```bat
node audit.js 5 a
node audit.js 5 b
node audit.js 5 c
```

Generated evidence:

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

Expected result:

```text
Audit integrity: VALID
```

Changed, removed, reordered, duplicated, or truncated evidence is detected.

## Run tests

Recommended before commit:

```bat
node stress-test.js standard
```

Quick mode:

```bat
node stress-test.js smoke
```

The suite verifies, among other cases:

- exact results against a BigInt oracle;
- positive, zero, negative, and boundary inputs;
- invalid input rejection;
- all three functions expose one declared parameter;
- audit instrumentation is owned by `audit.js` rather than `index.js`;
- independent proof comparison;
- audit CLI behavior;
- file-system failures;
- injected algorithm failures;
- mutation sensitivity;
- evidence tampering and truncation;
- concurrent audit isolation;
- performance and long-loop behavior.
