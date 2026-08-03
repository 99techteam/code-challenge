# Problem 4 — Deep stress-test report

## Result

```text
Status: STRESS_TEST_PASS
Assertions: 1,197,832
Maximum safe-result input: 134,217,727
Elapsed: 1,307 ms
Suites: 13
```

## Coverage executed

- Fixed positive, negative, zero, and known-result cases.
- Exhaustive verification of all three functions from `-12,000` through `12,000`.
- 8,000 deterministic random inputs through all three functions.
- 200,000 deterministic random inputs across the complete safe-result domain for solutions A and C.
- 8,192 values immediately below the safe-result boundary, checked with both signs.
- Exact maximum safe input executed through solution B despite its linear complexity.
- First overflowing result rejected by all three functions.
- Values surrounding powers of two.
- Recurrence and sign-symmetry metamorphic properties.
- Invalid values: `NaN`, infinities, decimals, and unsafe integers.
- 315 sequential success/failure audit records.
- 600 concurrent records written by eight Node.js processes.
- Unique `traceId` verification for concurrent records.
- Audit chain verification after concurrent writes.
- Seven tamper/corruption scenarios.
- Confirmation that audit records contain no `algorithm` field.

## Suite timings

| Suite | Assertions | Elapsed |
|---|---:|---:|
| Fixed examples and signed edges | 36 | 1 ms |
| Exhaustive all-functions range | 96,004 | 96 ms |
| Random moderate range for all functions | 32,000 | 22 ms |
| Full safe-domain random test for A and C | 600,000 | 165 ms |
| Safe-result boundary sweep | 49,154 | 129 ms |
| Result-overflow rejection | 3 | 111 ms |
| Power-of-two neighborhoods | 672 | 2 ms |
| Metamorphic identities for all functions | 18,000 | 23 ms |
| Full-domain metamorphic identities for A and C | 400,000 | 144 ms |
| Invalid runtime inputs | 18 | 1 ms |
| Sequential success and failure audit chain | 733 | 112 ms |
| Concurrent multi-process audit chain | 1,203 | 497 ms |
| Audit tamper and corruption detection | 9 | 4 ms |

## Tamper scenarios detected

1. Modified result without recomputing the record hash.
2. Broken `previousHash`.
3. Deleted middle record.
4. Reordered records.
5. Duplicated record.
6. Malformed JSON.
7. Truncated final record.

## Commands

```bat
npm test
npm run stress
```

`npm run stress` executes the deep suite. `npm run stress:quick` keeps the
smaller suite for fast local checks.

## Boundary of this test

No finite test can prove correctness for every possible runtime environment.
This suite combines exhaustive ranges, independent `BigInt` oracles,
full-domain deterministic sampling, mathematical invariants, exact boundary
execution, concurrent audit writes, and deliberate log corruption.
