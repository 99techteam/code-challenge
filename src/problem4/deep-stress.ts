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
  copyFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require("node:fs");

const {
  tmpdir,
} = require("node:os");

const {
  join,
} = require("node:path");

const {
  spawn,
} = require("node:child_process");

type SumFunction = (
  n: number,
) => number;

interface SuiteResult {
  name: string;
  assertions: number;
  elapsedMs: number;
}

const implementations:
  ReadonlyArray<
    readonly [
      string,
      SumFunction,
    ]
  > = [
    [
      "sum_to_n_a",
      sum_to_n_a,
    ],
    [
      "sum_to_n_b",
      sum_to_n_b,
    ],
    [
      "sum_to_n_c",
      sum_to_n_c,
    ],
  ];

const fastImplementations:
  ReadonlyArray<
    readonly [
      string,
      SumFunction,
    ]
  > = [
    [
      "sum_to_n_a",
      sum_to_n_a,
    ],
    [
      "sum_to_n_c",
      sum_to_n_c,
    ],
  ];

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

let assertions = 0;
const suites: SuiteResult[] = [];

function assert(
  condition: boolean,
  message: string,
): void {
  assertions += 1;

  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(
  actual: unknown,
  expected: unknown,
  label: string,
): void {
  assert(
    actual === expected,
    `${label}: actual=${String(actual)}, expected=${String(expected)}`,
  );
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

  const signed =
    n < 0
      ? -positive
      : positive;

  const result =
    Number(signed);

  assert(
    Number.isSafeInteger(result),
    `Oracle produced unsafe result for n=${n}`,
  );

  return result;
}

function runSuite(
  name: string,
  operation: () => void,
): void {
  const before = assertions;
  const startedAt = Date.now();

  operation();

  suites.push({
    name,
    assertions:
      assertions - before,
    elapsedMs:
      Date.now() - startedAt,
  });
}

async function runAsyncSuite(
  name: string,
  operation: () => Promise<void>,
): Promise<void> {
  const before = assertions;
  const startedAt = Date.now();

  await operation();

  suites.push({
    name,
    assertions:
      assertions - before,
    elapsedMs:
      Date.now() - startedAt,
  });
}

function verifyAll(
  input: number,
): void {
  const expected =
    bigintOracle(input);

  for (
    const [
      name,
      implementation,
    ]
    of implementations
  ) {
    assertEqual(
      implementation(input),
      expected,
      `${name}(${input})`,
    );
  }
}

function verifyFast(
  input: number,
): void {
  const expected =
    bigintOracle(input);

  for (
    const [
      name,
      implementation,
    ]
    of fastImplementations
  ) {
    assertEqual(
      implementation(input),
      expected,
      `${name}(${input})`,
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

function expectFailure(
  operation: () => unknown,
  label: string,
): void {
  let failed = false;

  try {
    operation();
  } catch {
    failed = true;
  }

  assert(
    failed,
    `${label} should fail`,
  );
}

function runWorker(
  choice: "a" | "b" | "c",
  start: number,
  count: number,
  auditFile: string,
): Promise<void> {
  return new Promise(
    (
      resolvePromise,
      rejectPromise,
    ) => {
      const workerFile =
        join(
          __dirname,
          "concurrency-worker.js",
        );

      const child = spawn(
        process.execPath,
        [
          workerFile,
          choice,
          String(start),
          String(count),
          auditFile,
        ],
        {
          stdio: [
            "ignore",
            "ignore",
            "pipe",
          ],
        },
      );

      let errorOutput = "";

      child.stderr.setEncoding(
        "utf8",
      );

      child.stderr.on(
        "data",
        (
          chunk: string,
        ) => {
          errorOutput += chunk;
        },
      );

      child.on(
        "error",
        (
          error: Error,
        ) => {
          rejectPromise(error);
        },
      );

      child.on(
        "exit",
        (
          code: number | null,
        ) => {
          if (code === 0) {
            resolvePromise();
            return;
          }

          rejectPromise(
            new Error(
              `Worker ${choice} failed with code ${String(code)}: ${errorOutput}`,
            ),
          );
        },
      );
    },
  );
}

function readAuditLines(
  file: string,
): string[] {
  return String(
    readFileSync(
      file,
      "utf8",
    ),
  )
    .split(/\r?\n/)
    .filter(Boolean);
}

async function main(): Promise<void> {
  const totalStartedAt =
    Date.now();

  runSuite(
    "Fixed examples and signed edges",
    () => {
      const cases:
        ReadonlyArray<
          readonly [
            number,
            number,
          ]
        > = [
          [0, 0],
          [1, 1],
          [2, 3],
          [5, 15],
          [10, 55],
          [13, 91],
          [100, 5050],
          [-1, -1],
          [-2, -3],
          [-4, -10],
          [-13, -91],
          [-100, -5050],
        ];

      for (
        const [
          input,
          expected,
        ]
        of cases
      ) {
        for (
          const [
            name,
            implementation,
          ]
          of implementations
        ) {
          assertEqual(
            implementation(input),
            expected,
            `${name} fixed input=${input}`,
          );
        }
      }
    },
  );

  runSuite(
    "Exhaustive all-functions range",
    () => {
      for (
        let input = -12_000;
        input <= 12_000;
        input += 1
      ) {
        verifyAll(input);
      }
    },
  );

  runSuite(
    "Random moderate range for all functions",
    () => {
      const nextRandom =
        createRandom(
          0x9e3779b9,
        );

      for (
        let sample = 0;
        sample < 8_000;
        sample += 1
      ) {
        const magnitude =
          nextRandom() % 5_001;

        const input =
          (nextRandom() & 1) === 0
            ? magnitude
            : -magnitude;

        verifyAll(input);
      }
    },
  );

  runSuite(
    "Full safe-domain random test for A and C",
    () => {
      const nextRandom =
        createRandom(
          0x243f6a88,
        );

      for (
        let sample = 0;
        sample < 200_000;
        sample += 1
      ) {
        const magnitude =
          nextRandom() %
          (
            maximumSafeN + 1
          );

        const input =
          (nextRandom() & 1) === 0
            ? magnitude
            : -magnitude;

        verifyFast(input);
      }
    },
  );

  runSuite(
    "Safe-result boundary sweep",
    () => {
      const windowSize = 8_192;

      for (
        let offset = 0;
        offset < windowSize;
        offset += 1
      ) {
        const input =
          maximumSafeN - offset;

        verifyFast(input);
        verifyFast(-input);
      }

      // Solution B is intentionally linear, but the exact maximum valid
      // input is still executed once to prove boundary correctness.
      const expected =
        bigintOracle(
          maximumSafeN,
        );

      assertEqual(
        sum_to_n_b(
          maximumSafeN,
        ),
        expected,
        "sum_to_n_b maximum safe boundary",
      );
    },
  );

  runSuite(
    "Result-overflow rejection",
    () => {
      const overflowInput =
        maximumSafeN + 1;

      for (
        const [
          name,
          implementation,
        ]
        of implementations
      ) {
        expectFailure(
          () =>
            implementation(
              overflowInput,
            ),
          `${name} overflow input`,
        );
      }
    },
  );

  runSuite(
    "Power-of-two neighborhoods",
    () => {
      for (
        let power = 1;
        power <= 65_536;
        power *= 2
      ) {
        for (
          const delta
          of [
            -2,
            -1,
            0,
            1,
            2,
          ]
        ) {
          const input =
            power + delta;

          if (input < 0) {
            continue;
          }

          verifyAll(input);
          verifyAll(-input);
        }
      }
    },
  );

  runSuite(
    "Metamorphic identities for all functions",
    () => {
      const nextRandom =
        createRandom(
          0xb7e15162,
        );

      for (
        let sample = 0;
        sample < 3_000;
        sample += 1
      ) {
        const n =
          1 +
          (
            nextRandom() %
            5_000
          );

        for (
          const [
            name,
            implementation,
          ]
          of implementations
        ) {
          const current =
            implementation(n);

          const previous =
            implementation(
              n - 1,
            );

          const negative =
            implementation(-n);

          assertEqual(
            current - previous,
            n,
            `${name} recurrence n=${n}`,
          );

          assertEqual(
            negative,
            -current,
            `${name} sign symmetry n=${n}`,
          );
        }
      }
    },
  );

  runSuite(
    "Full-domain metamorphic identities for A and C",
    () => {
      const nextRandom =
        createRandom(
          0xdeadbeef,
        );

      for (
        let sample = 0;
        sample < 100_000;
        sample += 1
      ) {
        const n =
          1 +
          (
            nextRandom() %
            maximumSafeN
          );

        for (
          const [
            name,
            implementation,
          ]
          of fastImplementations
        ) {
          const current =
            implementation(n);

          assertEqual(
            current -
              implementation(
                n - 1,
              ),
            n,
            `${name} full recurrence n=${n}`,
          );

          assertEqual(
            implementation(-n),
            -current,
            `${name} full sign n=${n}`,
          );
        }
      }
    },
  );

  runSuite(
    "Invalid runtime inputs",
    () => {
      const invalidInputs = [
        Number.NaN,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        1.5,
        -2.25,
        Number.MAX_SAFE_INTEGER + 1,
      ];

      for (
        const invalid
        of invalidInputs
      ) {
        for (
          const [
            name,
            implementation,
          ]
          of implementations
        ) {
          expectFailure(
            () =>
              implementation(
                invalid,
              ),
            `${name} invalid=${String(invalid)}`,
          );
        }
      }
    },
  );

  runSuite(
    "Sequential success and failure audit chain",
    () => {
      const directory: string =
        mkdtempSync(
          join(
            tmpdir(),
            "problem4-sequential-audit-",
          ),
        );

      const file: string =
        join(
          directory,
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
              file,
            ).result,
            expected,
            `audit A input=${input}`,
          );

          assertEqual(
            executeSumBWithAudit(
              input,
              file,
            ).result,
            expected,
            `audit B input=${input}`,
          );

          assertEqual(
            executeSumCWithAudit(
              input,
              file,
            ).result,
            expected,
            `audit C input=${input}`,
          );
        }

        const invalidValues = [
          "invalid",
          "",
          "1.5",
          "Infinity",
          "NaN",
        ];

        for (
          const invalid
          of invalidValues
        ) {
          expectFailure(
            () =>
              executeSumAWithAudit(
                invalid,
                file,
              ),
            `audit A invalid=${invalid}`,
          );

          expectFailure(
            () =>
              executeSumBWithAudit(
                invalid,
                file,
              ),
            `audit B invalid=${invalid}`,
          );

          expectFailure(
            () =>
              executeSumCWithAudit(
                invalid,
                file,
              ),
            `audit C invalid=${invalid}`,
          );
        }

        const expectedRecords =
          300 +
          invalidValues.length * 3;

        assertEqual(
          verifyAuditLog(file),
          expectedRecords,
          "sequential audit chain count",
        );

        const records =
          readAuditLines(file).map(
            (
              line: string,
            ) =>
              JSON.parse(line),
          );

        assertEqual(
          records.length,
          expectedRecords,
          "sequential audit line count",
        );

        assertEqual(
          records.filter(
            (
              record: {
                status: string;
              },
            ) =>
              record.status ===
              "FAILED",
          ).length,
          invalidValues.length * 3,
          "failed audit count",
        );

        for (
          const record
          of records
        ) {
          assertEqual(
            "algorithm" in record,
            false,
            "algorithm must not appear in audit",
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
    },
  );

  await runAsyncSuite(
    "Concurrent multi-process audit chain",
    async () => {
      const directory: string =
        mkdtempSync(
          join(
            tmpdir(),
            "problem4-concurrent-audit-",
          ),
        );

      const file: string =
        join(
          directory,
          "audit.jsonl",
        );

      try {
        const workers:
          Array<Promise<void>> = [];

        const choices:
          ReadonlyArray<
            "a" | "b" | "c"
          > = [
            "a",
            "b",
            "c",
            "a",
            "b",
            "c",
            "a",
            "c",
          ];

        choices.forEach(
          (
            choice,
            workerIndex,
          ) => {
            workers.push(
              runWorker(
                choice,
                1 +
                  workerIndex *
                    100,
                75,
                file,
              ),
            );
          },
        );

        await Promise.all(
          workers,
        );

        const expectedRecords =
          choices.length * 75;

        assertEqual(
          verifyAuditLog(file),
          expectedRecords,
          "concurrent audit chain count",
        );

        const records =
          readAuditLines(file).map(
            (
              line: string,
            ) =>
              JSON.parse(line),
          );

        assertEqual(
          records.length,
          expectedRecords,
          "concurrent audit line count",
        );

        const traceIds =
          new Set(
            records.map(
              (
                record: {
                  traceId: string;
                },
              ) =>
                record.traceId,
            ),
          );

        assertEqual(
          traceIds.size,
          expectedRecords,
          "concurrent traceId uniqueness",
        );

        for (
          const record
          of records
        ) {
          assertEqual(
            "algorithm" in record,
            false,
            "concurrent audit algorithm field",
          );

          assertEqual(
            record.status,
            "SUCCESS",
            "concurrent audit status",
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
    },
  );

  runSuite(
    "Audit tamper and corruption detection",
    () => {
      const directory: string =
        mkdtempSync(
          join(
            tmpdir(),
            "problem4-tamper-audit-",
          ),
        );

      const original: string =
        join(
          directory,
          "original.jsonl",
        );

      try {
        for (
          let input = 1;
          input <= 12;
          input += 1
        ) {
          executeSumAWithAudit(
            input,
            original,
          );
        }

        assertEqual(
          verifyAuditLog(original),
          12,
          "original audit validity",
        );

        const originalLines =
          readAuditLines(original);

        const cases:
          Array<
            readonly [
              string,
              (
                lines: string[],
              ) => string[],
            ]
          > = [
            [
              "modified-result",
              (
                lines,
              ) => {
                const records =
                  [...lines];

                const first =
                  JSON.parse(
                    records[0] ??
                    "{}",
                  );

                first.result += 1;
                records[0] =
                  JSON.stringify(first);

                return records;
              },
            ],
            [
              "broken-previous-hash",
              (
                lines,
              ) => {
                const records =
                  [...lines];

                const second =
                  JSON.parse(
                    records[1] ??
                    "{}",
                  );

                second.previousHash =
                  "0".repeat(64);

                records[1] =
                  JSON.stringify(second);

                return records;
              },
            ],
            [
              "deleted-middle-line",
              (
                lines,
              ) =>
                lines.filter(
                  (
                    _line,
                    index,
                  ) =>
                    index !== 5,
                ),
            ],
            [
              "reordered-lines",
              (
                lines,
              ) => {
                const records =
                  [...lines];

                const first =
                  records[0];

                records[0] =
                  records[1] ??
                  "";

                records[1] =
                  first ??
                  "";

                return records;
              },
            ],
            [
              "duplicated-line",
              (
                lines,
              ) => [
                ...lines,
                lines[
                  lines.length - 1
                ] ?? "",
              ],
            ],
            [
              "malformed-json",
              (
                lines,
              ) => [
                ...lines,
                "{\"broken\":",
              ],
            ],
            [
              "truncated-record",
              (
                lines,
              ) => {
                const records =
                  [...lines];

                const lastIndex =
                  records.length - 1;

                records[lastIndex] =
                  (
                    records[
                      lastIndex
                    ] ?? ""
                  ).slice(
                    0,
                    -7,
                  );

                return records;
              },
            ],
          ];

        for (
          const [
            name,
            mutate,
          ]
          of cases
        ) {
          const target: string =
            join(
              directory,
              `${name}.jsonl`,
            );

          const changed =
            mutate(
              originalLines,
            );

          writeFileSync(
            target,
            `${changed.join("\n")}\n`,
            "utf8",
          );

          expectFailure(
            () =>
              verifyAuditLog(
                target,
              ),
            `tamper case ${name}`,
          );
        }

        const copied: string =
          join(
            directory,
            "valid-copy.jsonl",
          );

        copyFileSync(
          original,
          copied,
        );

        assertEqual(
          verifyAuditLog(copied),
          12,
          "valid copied audit",
        );
      } finally {
        rmSync(
          directory,
          {
            recursive: true,
            force: true,
          },
        );
      }
    },
  );

  const elapsedMs =
    Date.now() -
    totalStartedAt;

  const report = {
    status:
      "STRESS_TEST_PASS",
    assertions,
    maximumSafeN,
    elapsedMs,
    suites,
    coverage: {
      exhaustiveAllFunctions:
        "-12,000..12,000",
      randomAllFunctions:
        8_000,
      randomFullSafeDomainAandC:
        200_000,
      boundaryWindowEachSide:
        8_192,
      exactMaximumForB:
        true,
      overflowRejectionAllFunctions:
        true,
      sequentialAuditRecords:
        315,
      concurrentAuditRecords:
        600,
      tamperScenarios:
        7,
      algorithmFieldInAudit:
        false,
    },
  };

  console.log(
    "STRESS_TEST_PASS",
  );
  console.log(
    `assertions=${assertions}`,
  );
  console.log(
    `maximumSafeN=${maximumSafeN}`,
  );
  console.log(
    `elapsedMs=${elapsedMs}`,
  );
  console.log(
    `suites=${suites.length}`,
  );
  console.log(
    `DEEP_STRESS_JSON=${JSON.stringify(report)}`,
  );
}

main().catch(
  (
    error: unknown,
  ) => {
    console.error(
      error instanceof Error
        ? error.stack ??
          error.message
        : String(error),
    );

    process.exitCode = 1;
  },
);
