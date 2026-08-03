import {
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
} from "./index";

import {
  appendAudit,
  createTraceId,
  DEFAULT_AUDIT_FILE,
  hashValue,
} from "./audit";

type SumFunction = (
  n: number,
) => number;

export interface AuditedResult {
  result: number;
  traceId: string;
}

function parseInput(
  input: unknown,
): number {
  const parsed =
    typeof input === "number"
      ? input
      : typeof input === "string" &&
          input.trim() !== ""
        ? Number(input)
        : Number.NaN;

  if (!Number.isSafeInteger(parsed)) {
    throw new TypeError(
      "n must be a safe integer",
    );
  }

  return parsed;
}

function executeWithAudit(
  input: unknown,
  implementation: SumFunction,
  file: string,
): AuditedResult {
  const traceId = createTraceId();
  const startedAt = Date.now();

  const rawInput: number | string =
    typeof input === "number" ||
    typeof input === "string"
      ? input
      : String(input);

  try {
    const n = parseInput(input);
    const result = implementation(n);

    appendAudit(file, {
      timestamp:
        new Date().toISOString(),
      traceId,
      action: "SUM_TO_N",
      status: "SUCCESS",
      input: n,
      result,
      durationMs:
        Date.now() - startedAt,
      inputHash: hashValue(n),
      outputHash:
        hashValue(result),
      error: null,
    });

    return {
      result,
      traceId,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    appendAudit(file, {
      timestamp:
        new Date().toISOString(),
      traceId,
      action: "SUM_TO_N",
      status: "FAILED",
      input: rawInput,
      result: null,
      durationMs:
        Date.now() - startedAt,
      inputHash:
        hashValue(rawInput),
      outputHash: null,
      error: message,
    });

    throw error;
  }
}

/**
 * Executes solution A and writes one audit record.
 */
export function executeSumAWithAudit(
  input: unknown,
  file: string = DEFAULT_AUDIT_FILE,
): AuditedResult {
  return executeWithAudit(
    input,
    sum_to_n_a,
    file,
  );
}

/**
 * Executes solution B and writes one audit record.
 */
export function executeSumBWithAudit(
  input: unknown,
  file: string = DEFAULT_AUDIT_FILE,
): AuditedResult {
  return executeWithAudit(
    input,
    sum_to_n_b,
    file,
  );
}

/**
 * Executes solution C and writes one audit record.
 */
export function executeSumCWithAudit(
  input: unknown,
  file: string = DEFAULT_AUDIT_FILE,
): AuditedResult {
  return executeWithAudit(
    input,
    sum_to_n_c,
    file,
  );
}
