import {
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
} from "./index";

import {
  executeSumAWithAudit,
  executeSumBWithAudit,
  executeSumCWithAudit,
} from "./service";

import {
  verifyAuditLog,
} from "./verify-audit";

const {
  mkdtempSync,
  readFileSync,
  rmSync,
} = require("node:fs");

const {
  tmpdir,
} = require("node:os");

const {
  join,
} = require("node:path");

type SumFunction = (
  n: number,
) => number;

const implementations:
  ReadonlyArray<SumFunction> = [
    sum_to_n_a,
    sum_to_n_b,
    sum_to_n_c,
  ];

let assertions = 0;

function assertEqual(
  actual: unknown,
  expected: unknown,
  label: string,
): void {
  assertions += 1;

  if (actual !== expected) {
    throw new Error(
      `${label}: actual=${String(actual)}, expected=${String(expected)}`,
    );
  }
}

function bigintOracle(
  n: number,
): number {
  const magnitude =
    BigInt(Math.abs(n));

  const positive =
    (
      magnitude *
      (magnitude + 1n)
    ) / 2n;

  return Number(
    n < 0
      ? -positive
      : positive,
  );
}

function verifyAll(
  input: number,
): void {
  const expected =
    bigintOracle(input);

  for (
    const implementation
    of implementations
  ) {
    assertEqual(
      implementation(input),
      expected,
      `input=${input}`,
    );
  }
}

function createRandom(
  seed: number,
): () => number {
  let state = seed >>> 0;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;

    return state >>> 0;
  };
}

const startedAt = Date.now();

/**
 * Exhaustive signed range for all three implementations.
 */
for (
  let input = -5_000;
  input <= 5_000;
  input += 1
) {
  verifyAll(input);
}

/**
 * Deterministic random verification for all three implementations.
 */
const nextRandom =
  createRandom(0x9e3779b9);

for (
  let sample = 0;
  sample < 10_000;
  sample += 1
) {
  const magnitude =
    nextRandom() % 10_001;

  const input =
    (nextRandom() & 1) === 0
      ? magnitude
      : -magnitude;

  verifyAll(input);
}

/**
 * Large but practical inputs for all three implementations.
 */
for (
  const input
  of [
    -1_000_000,
    -100_000,
    100_000,
    1_000_000,
  ]
) {
  verifyAll(input);
}

/**
 * Safe-result boundary checks for the non-linear implementations.
 *
 * Solution B intentionally walks every integer, so using it at the
 * Number.MAX_SAFE_INTEGER boundary would make the stress test impractical.
 */
const maximumSafeN =
  Math.floor(
    (
      Math.sqrt(
        1 +
        8 *
          Number.MAX_SAFE_INTEGER,
      ) -
      1
    ) /
      2,
  );

for (
  const input
  of [
    maximumSafeN - 1,
    maximumSafeN,
    -(maximumSafeN - 1),
    -maximumSafeN,
  ]
) {
  const expected =
    bigintOracle(input);

  assertEqual(
    sum_to_n_a(input),
    expected,
    `boundary A input=${input}`,
  );

  assertEqual(
    sum_to_n_c(input),
    expected,
    `boundary C input=${input}`,
  );
}

/**
 * Invalid-input checks for all three implementations.
 */
for (
  const invalid
  of [
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    1.5,
    -2.25,
    Number.MAX_SAFE_INTEGER + 1,
  ]
) {
  for (
    const implementation
    of implementations
  ) {
    let failed = false;

    try {
      implementation(invalid);
    } catch {
      failed = true;
    }

    assertEqual(
      failed,
      true,
      `invalid=${String(invalid)}`,
    );
  }
}

/**
 * Audit stress:
 * 100 calls per function create 300 chained records.
 */
const auditDirectory: string =
  mkdtempSync(
    join(
      tmpdir(),
      "problem4-stress-audit-",
    ),
  );

const auditFile: string =
  join(
    auditDirectory,
    "audit.jsonl",
  );

try {
  for (
    let input = 1;
    input <= 100;
    input += 1
  ) {
    const expected =
      bigintOracle(input);

    assertEqual(
      executeSumAWithAudit(
        input,
        auditFile,
      ).result,
      expected,
      `audit A input=${input}`,
    );

    assertEqual(
      executeSumBWithAudit(
        input,
        auditFile,
      ).result,
      expected,
      `audit B input=${input}`,
    );

    assertEqual(
      executeSumCWithAudit(
        input,
        auditFile,
      ).result,
      expected,
      `audit C input=${input}`,
    );
  }

  assertEqual(
    verifyAuditLog(auditFile),
    300,
    "audit chain count",
  );

  const records = String(
    readFileSync(
      auditFile,
      "utf8",
    ),
  )
    .trim()
    .split(/\r?\n/)
    .map(
      (line: string) =>
        JSON.parse(line),
    );

  assertEqual(
    records.length,
    300,
    "audit line count",
  );

  for (
    const record
    of records
  ) {
    assertEqual(
      "algorithm" in record,
      false,
      "algorithm field must not exist",
    );

    assertEqual(
      record.status,
      "SUCCESS",
      "audit status",
    );
  }
} finally {
  rmSync(
    auditDirectory,
    {
      recursive: true,
      force: true,
    },
  );
}

const elapsedMs =
  Date.now() - startedAt;

console.log("STRESS_TEST_PASS");
console.log(
  `assertions=${assertions}`,
);
console.log(
  `auditRecords=300`,
);
console.log(
  `safeBoundary=${maximumSafeN}`,
);
console.log(
  `elapsedMs=${elapsedMs}`,
);
