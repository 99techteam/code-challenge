import {
  AuditRecord,
  DEFAULT_AUDIT_FILE,
} from "./audit";

const {
  createHash,
} = require("node:crypto");

const {
  existsSync,
  readFileSync,
} = require("node:fs");

const {
  resolve,
} = require("node:path");

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

export function verifyAuditLog(
  file: string = DEFAULT_AUDIT_FILE,
): number {
  if (!existsSync(file)) {
    throw new Error(
      `Audit file not found: ${file}`,
    );
  }

  const lines: string[] = String(
    readFileSync(file, "utf8"),
  )
    .split(/\r?\n/)
    .filter(Boolean);

  let previousHash: string | null =
    null;

  lines.forEach(
    (
      line: string,
      index: number,
    ) => {
      const record = JSON.parse(
        line,
      ) as AuditRecord;

      const expectedSequence =
        index + 1;

      if (
        record.sequence !==
        expectedSequence
      ) {
        throw new Error(
          `Invalid sequence at line ${expectedSequence}`,
        );
      }

      if (
        record.previousHash !==
        previousHash
      ) {
        throw new Error(
          `Broken audit chain at line ${expectedSequence}`,
        );
      }

      const {
        recordHash,
        ...unsigned
      } = record;

      const expectedHash = sha256(
        canonical(unsigned),
      );

      if (
        recordHash !==
        expectedHash
      ) {
        throw new Error(
          `Audit record was modified at line ${expectedSequence}`,
        );
      }

      previousHash = recordHash;
    },
  );

  return lines.length;
}

if (require.main === module) {
  const file = process.argv[2]
    ? resolve(process.argv[2])
    : DEFAULT_AUDIT_FILE;

  const count = verifyAuditLog(file);

  console.log(
    `AUDIT_OK records=${count}`,
  );
}
