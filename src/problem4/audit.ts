const {
  createHash,
  randomUUID,
} = require("node:crypto");

const {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
} = require("node:fs");

const {
  dirname,
  resolve,
} = require("node:path");

export const DEFAULT_AUDIT_FILE: string = resolve(
  process.cwd(),
  "logs",
  "problem4-audit.jsonl",
);

export interface AuditRecord {
  sequence: number;
  timestamp: string;
  traceId: string;
  action: "SUM_TO_N";
  status: "SUCCESS" | "FAILED";
  input: number | string;
  result: number | null;
  durationMs: number;
  inputHash: string;
  outputHash: string | null;
  error: string | null;
  previousHash: string | null;
  recordHash: string;
}

type UnsignedAuditRecord = Omit<
  AuditRecord,
  "recordHash"
>;

function sha256(value: string): string {
  return createHash("sha256")
    .update(value, "utf8")
    .digest("hex");
}

function canonical(
  record: UnsignedAuditRecord,
): string {
  return JSON.stringify({
    sequence: record.sequence,
    timestamp: record.timestamp,
    traceId: record.traceId,
    action: record.action,
    status: record.status,
    input: record.input,
    result: record.result,
    durationMs: record.durationMs,
    inputHash: record.inputHash,
    outputHash: record.outputHash,
    error: record.error,
    previousHash: record.previousHash,
  });
}

function readRecords(
  file: string,
): AuditRecord[] {
  if (!existsSync(file)) {
    return [];
  }

  const content = String(
    readFileSync(file, "utf8"),
  ).trim();

  if (!content) {
    return [];
  }

  return content
    .split(/\r?\n/)
    .filter(Boolean)
    .map(
      (
        line: string,
        index: number,
      ) => {
        try {
          return JSON.parse(
            line,
          ) as AuditRecord;
        } catch {
          throw new Error(
            `Invalid audit JSON at line ${index + 1}`,
          );
        }
      },
    );
}

function sleep(milliseconds: number): void {
  const buffer = new SharedArrayBuffer(4);
  const view = new Int32Array(buffer);

  Atomics.wait(
    view,
    0,
    0,
    milliseconds,
  );
}

function acquireAuditLock(
  file: string,
): () => void {
  mkdirSync(
    dirname(file),
    { recursive: true },
  );

  const lockDirectory =
    `${file}.lock`;

  const timeoutAt =
    Date.now() + 15_000;

  while (true) {
    try {
      mkdirSync(lockDirectory);

      return () => {
        rmSync(
          lockDirectory,
          {
            recursive: true,
            force: true,
          },
        );
      };
    } catch (error) {
      const code =
        (
          error as {
            code?: string;
          }
        ).code;

      if (code !== "EEXIST") {
        throw error;
      }

      try {
        const ageMilliseconds =
          Date.now() -
          statSync(
            lockDirectory,
          ).mtimeMs;

        if (
          ageMilliseconds >
          30_000
        ) {
          rmSync(
            lockDirectory,
            {
              recursive: true,
              force: true,
            },
          );

          continue;
        }
      } catch {
        // The lock disappeared between the checks; retry immediately.
        continue;
      }

      if (
        Date.now() >= timeoutAt
      ) {
        throw new Error(
          `Timed out waiting for audit lock: ${lockDirectory}`,
        );
      }

      sleep(2);
    }
  }
}

export function appendAudit(
  file: string,
  data: Omit<
    UnsignedAuditRecord,
    "sequence" | "previousHash"
  >,
): AuditRecord {
  const releaseLock =
    acquireAuditLock(file);

  try {
    const existing =
      readRecords(file);

    const previous =
      existing.length > 0
        ? existing[
            existing.length - 1
          ]
        : undefined;

    const unsigned:
      UnsignedAuditRecord = {
        sequence:
          existing.length + 1,
        ...data,
        previousHash:
          previous?.recordHash ??
          null,
      };

    const record:
      AuditRecord = {
        ...unsigned,
        recordHash: sha256(
          canonical(unsigned),
        ),
      };

    appendFileSync(
      file,
      `${JSON.stringify(record)}\n`,
      "utf8",
    );

    return record;
  } finally {
    releaseLock();
  }
}

export function createTraceId(): string {
  return randomUUID();
}

export function hashValue(
  value: unknown,
): string {
  return sha256(String(value));
}
