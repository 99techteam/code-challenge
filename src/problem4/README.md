# Problem 4 — Three functions with audit log

All three challenge functions remain pure and have explanatory comments
directly above them.

Each function has a corresponding audited service wrapper:

```text
executeSumAWithAudit
executeSumBWithAudit
executeSumCWithAudit
```

The audit log does not contain an `algorithm` field.

## Run one function

```bat
cd /d D:\99\code-challenge\src\problem4
npm install

npm start -- a 100
npm start -- b 100
npm start -- c 100
```

Each command prints the result directly:

```text
5050
```

Each function call appends one record to:

```text
logs/problem4-audit.jsonl
```

After running A, B, and C, the log contains three records.

## Generate three audit records at once

```bat
npm run audit:sample -- 100
```

## Audit fields

```text
sequence
timestamp
traceId
action
status
input
result
durationMs
inputHash
outputHash
error
previousHash
recordHash
```

There is no `algorithm` field.

## Verify audit integrity

```bat
npm run audit:verify
```

Expected after the sample command:

```text
AUDIT_OK records=3
```

## Test

```bat
npm test
```

Expected result:

```text
PASS
```


## Stress test

Run correctness, boundary, invalid-input, and audit-chain stress checks:

```bat
npm run stress
```

Expected output:

```text
STRESS_TEST_PASS
assertions=...
auditRecords=300
safeBoundary=134217727
elapsedMs=...
```

The stress test does not benchmark or compare algorithms.


## Deep stress test

```bat
npm run stress
```

This runs exhaustive, random full-domain, exact-boundary, overflow,
metamorphic, invalid-input, sequential audit, concurrent multi-process audit,
and tamper-detection checks.

The verified output from the packaged run is documented in:

```text
DEEP-STRESS-REPORT.md
deep-stress-result.json
```

For a faster local check:

```bat
npm run stress:quick
```
