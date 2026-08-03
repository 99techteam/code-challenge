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

function assertEqual(
  actual: unknown,
  expected: unknown,
  label: string,
): void {
  if (actual !== expected) {
    throw new Error(
      `${label}: actual=${String(actual)}, expected=${String(expected)}`,
    );
  }
}

function oracle(
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

const implementations = [
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
] as const;

for (
  let n = -20_000;
  n <= 20_000;
  n += 1
) {
  const expected = oracle(n);

  for (
    const implementation
    of implementations
  ) {
    assertEqual(
      implementation(n),
      expected,
      `n=${n}`,
    );
  }
}

const directory: string =
  mkdtempSync(
    join(
      tmpdir(),
      "problem4-audit-",
    ),
  );

const file: string =
  join(
    directory,
    "audit.jsonl",
  );

try {
  assertEqual(
    executeSumAWithAudit(
      100,
      file,
    ).result,
    5050,
    "function A",
  );

  assertEqual(
    executeSumBWithAudit(
      100,
      file,
    ).result,
    5050,
    "function B",
  );

  assertEqual(
    executeSumCWithAudit(
      100,
      file,
    ).result,
    5050,
    "function C",
  );

  assertEqual(
    verifyAuditLog(file),
    3,
    "audit record count",
  );

  const records = String(
    readFileSync(file, "utf8"),
  )
    .trim()
    .split(/\r?\n/)
    .map(
      (line: string) =>
        JSON.parse(line),
    );

  assertEqual(
    records.length,
    3,
    "three audit lines",
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
      record.action,
      "SUM_TO_N",
      "audit action",
    );

    assertEqual(
      record.status,
      "SUCCESS",
      "audit status",
    );
  }
} finally {
  rmSync(
    directory,
    {
      recursive: true,
      force: true,
    },
  );
}

console.log("PASS");
