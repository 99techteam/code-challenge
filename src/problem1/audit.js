"use strict";

/**
 * Separate mathematical audit runner.
 *
 * CLI:
 *   node audit.js 5 all
 *   node audit.js -4 a
 *
 * Environment:
 *   PROBLEM1_LOG_DIR=<directory>
 *
 * Output:
 *   *.log           Human-readable proof
 *   *.jsonl         Hash-chained raw evidence
 *   *.manifest.json Integrity manifest
 */

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const defaultImplementations = require("./index");

const DEFAULT_ALGORITHMS = {
  a: {
    name: "A_COMBINATORICS",
    label: "Combinatorics",
    run: defaultImplementations.sum_to_n_a,
  },
  b: {
    name: "B_LINEAR_ALGEBRA",
    label: "Linear algebra",
    run: defaultImplementations.sum_to_n_b,
  },
  c: {
    name: "C_PROBABILITY_SYMMETRY",
    label: "Probability symmetry",
    run: defaultImplementations.sum_to_n_c,
  },
};

function parseArguments(argv) {
  const rawN = argv[2];
  const selectedAlgorithm = (argv[3] ?? "all").toLowerCase();

  if (rawN === undefined) {
    throw new Error("Missing n. Example: node audit.js 5 all");
  }

  const n = Number(rawN);

  if (!Number.isSafeInteger(n)) {
    throw new TypeError("n must be a safe integer");
  }

  if (
    selectedAlgorithm !== "all" &&
    !Object.hasOwn(DEFAULT_ALGORITHMS, selectedAlgorithm)
  ) {
    throw new Error('Algorithm must be "a", "b", "c", or "all".');
  }

  return { n, selectedAlgorithm };
}

function safeTimestamp() {
  return new Date()
    .toISOString()
    .replaceAll(":", "-")
    .replaceAll(".", "-");
}

function sha256(text) {
  return crypto
    .createHash("sha256")
    .update(text)
    .digest("hex");
}

function formatMatrix(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return String(matrix);
  }

  const widths = matrix[0].map((_, column) =>
    Math.max(...matrix.map((row) => String(row[column]).length)),
  );

  return matrix
    .map((row) => {
      const cells = row.map((value, column) =>
        String(value).padStart(widths[column]),
      );

      return `│ ${cells.join("  ")} │`;
    })
    .join("\n");
}

function formatVector(vector) {
  return `[${vector.join(", ")}]^T`;
}

function append(filepath, text = "") {
  fs.appendFileSync(filepath, `${text}\n`, "utf8");
}

function writeHeading(filepath, title) {
  append(filepath);
  append(filepath, "=".repeat(100));
  append(filepath, title);
  append(filepath, "=".repeat(100));
}

function describeEvent(event) {
  const { algorithm, action, data } = event;

  switch (`${algorithm}:${action}`) {
    case "AUDIT_SESSION:SESSION_STARTED":
      return [
        `Input n = ${data.n}`,
        `Selected algorithms = ${data.selectedAlgorithm}`,
      ];

    case "AUDIT_SESSION:ALGORITHM_STARTED":
      return [`Start ${data.algorithm}`];

    case "AUDIT_SESSION:ALGORITHM_COMPLETED":
      return [`${data.algorithm} returned ${data.result}`];

    case "AUDIT_SESSION:RESULTS_CROSS_CHECKED":
      return [
        `Results = ${JSON.stringify(data.results)}`,
        `Implementations agree = ${data.consistent}`,
      ];

    case "AUDIT_SESSION:INDEPENDENT_REFERENCE_CALCULATED":
      return [
        `Independent BigInt reference = ${data.reference}`,
        `Every result matches reference = ${data.matches}`,
      ];

    case "AUDIT_SESSION:SESSION_PASSED":
      return ["Audit status = PASSED"];

    case "AUDIT_SESSION:SESSION_FAILED":
      return ["Audit status = FAILED"];

    case "AUDIT_SESSION:SESSION_ERROR":
      return [
        `Audit status = ERROR`,
        `${data.error.name}: ${data.error.message}`,
      ];

    case "A_COMBINATORICS:INPUT_RECEIVED":
    case "B_LINEAR_ALGEBRA:INPUT_RECEIVED":
    case "C_PROBABILITY_SYMMETRY:INPUT_RECEIVED":
      return [`Receive n = ${data.n}`];

    case "A_COMBINATORICS:INPUT_VALIDATED":
    case "B_LINEAR_ALGEBRA:INPUT_VALIDATED":
    case "C_PROBABILITY_SYMMETRY:INPUT_VALIDATED":
      return [
        `Input is a safe integer = ${data.isSafeInteger}`,
        `Result range is safe = ${data.isWithinSafeResultRange}`,
      ];

    case "A_COMBINATORICS:MAGNITUDE_CALCULATED":
    case "B_LINEAR_ALGEBRA:MAGNITUDE_CALCULATED":
    case "C_PROBABILITY_SYMMETRY:MAGNITUDE_CALCULATED":
      return [`|n| = ${data.magnitude}`];

    case "A_COMBINATORICS:COMBINATION_IDENTITY_APPLIED":
      return [
        `S(n) = C(n + 1, 2) = n(n + 1)/2`,
        `Substitute: ${data.leftFactor} × ${data.rightFactor} ÷ ${data.divisor}`,
      ];

    case "A_COMBINATORICS:EVEN_FACTOR_DIVIDED":
      return [
        `${data.factor}: ${data.before} ÷ ${data.divisor} = ${data.after}`,
      ];

    case "A_COMBINATORICS:FACTORS_MULTIPLIED":
      return [
        `${data.leftFactor} × ${data.rightFactor} = ${data.positiveSum}`,
      ];

    case "A_COMBINATORICS:SIGN_RESTORED":
    case "B_LINEAR_ALGEBRA:SIGN_RESTORED":
    case "C_PROBABILITY_SYMMETRY:SIGN_RESTORED":
      return [
        `Restore sign: ${data.positiveValue} → ${data.result}`,
      ];

    case "A_COMBINATORICS:COMPLETED":
    case "B_LINEAR_ALGEBRA:COMPLETED":
    case "C_PROBABILITY_SYMMETRY:COMPLETED":
      return [
        `Result = ${data.result}`,
        `Complexity: ${data.complexity.time} time, ${data.complexity.space} space`,
      ];

    case "B_LINEAR_ALGEBRA:STATE_MODEL_DEFINED":
      return [
        `State vector = ${formatVector(data.stateVector)}`,
        `Initial vector = ${formatVector(data.initialVector)}`,
        `Transition matrix:`,
        formatMatrix(data.transitionMatrix),
      ];

    case "B_LINEAR_ALGEBRA:MATRIX_POWER_INITIALIZED":
      return [
        `Compute M^${data.targetPower} using exponentiation by squaring`,
        `Identity result matrix:`,
        formatMatrix(data.resultMatrix),
        `Base matrix:`,
        formatMatrix(data.baseMatrix),
      ];

    case "B_LINEAR_ALGEBRA:POWER_ROUND_STARTED":
      return [
        `Round ${data.round}: exponent ${data.exponent} is ${data.isOdd ? "odd" : "even"}`,
      ];

    case "B_LINEAR_ALGEBRA:ODD_EXPONENT_BRANCH":
      return [`${data.operation}`];

    case "B_LINEAR_ALGEBRA:EVEN_EXPONENT_BRANCH":
      return ["Skip result multiplication"];

    case "B_LINEAR_ALGEBRA:MATRIX_MULTIPLICATION_STARTED":
      return [
        `${data.purpose}, round ${data.round}`,
        `Left:`,
        formatMatrix(data.left),
        `Right:`,
        formatMatrix(data.right),
      ];

    case "B_LINEAR_ALGEBRA:MATRIX_CELL_CALCULATED": {
      const expression = data.terms
        .map((term) => `${term.leftValue}×${term.rightValue}`)
        .join(" + ");

      return [
        `Cell [${data.row + 1},${data.column + 1}] = ${expression} = ${data.cellValue}`,
      ];
    }

    case "B_LINEAR_ALGEBRA:MATRIX_MULTIPLICATION_COMPLETED":
      return [
        `${data.purpose} result:`,
        formatMatrix(data.result),
      ];

    case "B_LINEAR_ALGEBRA:RESULT_MATRIX_UPDATED":
      return [
        `Accumulated result:`,
        formatMatrix(data.resultMatrix),
      ];

    case "B_LINEAR_ALGEBRA:BASE_MATRIX_SQUARED":
      return [
        `Squared base:`,
        formatMatrix(data.baseMatrix),
      ];

    case "B_LINEAR_ALGEBRA:EXPONENT_HALVED":
      return [
        `floor(${data.before}/2) = ${data.after}`,
      ];

    case "B_LINEAR_ALGEBRA:MATRIX_POWER_COMPLETED":
      return [
        `M^${data.power}:`,
        formatMatrix(data.poweredMatrix),
      ];

    case "B_LINEAR_ALGEBRA:INITIAL_VECTOR_APPLIED":
      return [
        `${formatVector(data.initialVector)} → ${formatVector(data.resultingVector)}`,
        `First component is the sum = ${data.positiveSum}`,
      ];

    case "C_PROBABILITY_SYMMETRY:ANTITHETIC_MODEL_DEFINED":
      return [
        `Sample space ${data.sampleSpace}`,
        `Mapping ${data.mapping}`,
        `Pair count = ${data.pairCount}`,
        `Every pair sums to ${data.constantPairSum}`,
      ];

    case "C_PROBABILITY_SYMMETRY:PAIR_ACCUMULATED":
      return [
        `Pair ${data.pairIndex}: ${data.left} + ${data.right} = ${data.pairSum}`,
        `${data.totalBefore} + ${data.pairSum} = ${data.totalAfter}`,
      ];

    case "C_PROBABILITY_SYMMETRY:MIDDLE_VALUE_ACCUMULATED":
      return [
        `Middle value ${data.middleValue}`,
        `${data.totalBefore} + ${data.middleValue} = ${data.totalAfter}`,
      ];

    case "C_PROBABILITY_SYMMETRY:MIDDLE_VALUE_NOT_REQUIRED":
      return [data.reason];

    default:
      return [JSON.stringify(data)];
  }
}

function directBigIntReference(n) {
  const magnitude = BigInt(Math.abs(n));
  const positive = (magnitude * (magnitude + 1n)) / 2n;
  return n < 0 ? -positive : positive;
}

function selectedEntries(selectedAlgorithm, algorithms) {
  if (selectedAlgorithm === "all") {
    return Object.entries(algorithms);
  }

  return [[selectedAlgorithm, algorithms[selectedAlgorithm]]];
}

function createOutputFiles(outputDirectory, n) {
  fs.mkdirSync(outputDirectory, { recursive: true });

  const stat = fs.statSync(outputDirectory);

  if (!stat.isDirectory()) {
    throw new Error(`Log path is not a directory: ${outputDirectory}`);
  }

  const unique =
    `${safeTimestamp()}-pid-${process.pid}-` +
    crypto.randomBytes(5).toString("hex");
  const safeN = String(n).replace("-", "minus-");
  const baseName = `audit-${unique}-n-${safeN}`;

  return {
    human: path.join(outputDirectory, `${baseName}.log`),
    raw: path.join(outputDirectory, `${baseName}.jsonl`),
    manifest: path.join(outputDirectory, `${baseName}.manifest.json`),
  };
}

function createWriter(files, auditId, consoleOutput) {
  let globalStep = 0;
  let previousHash = "GENESIS";
  const rawLines = [];

  return {
    write(event) {
      globalStep += 1;

      const unsignedEvent = {
        auditId,
        timestamp: new Date().toISOString(),
        globalStep,
        algorithm: event.algorithm,
        action: event.action,
        data: event.data ?? {},
        previousHash,
      };

      const eventHash = sha256(JSON.stringify(unsignedEvent));
      const completeEvent = {
        ...unsignedEvent,
        eventHash,
      };

      const rawLine = JSON.stringify(completeEvent);
      rawLines.push(rawLine);
      append(files.raw, rawLine);

      append(
        files.human,
        `[${String(globalStep).padStart(4, "0")}] ` +
        `${completeEvent.algorithm} :: ${completeEvent.action}`,
      );

      for (const line of describeEvent(completeEvent)) {
        for (const subLine of String(line).split("\n")) {
          append(files.human, `       ${subLine}`);
        }
      }

      append(files.human, `       eventHash = ${eventHash}`);
      append(files.human);

      if (consoleOutput) {
        console.log(
          `[${globalStep}] ${completeEvent.algorithm} :: ${completeEvent.action}`,
        );
      }

      previousHash = eventHash;
      return completeEvent;
    },

    snapshot() {
      const rawText =
        rawLines.length === 0
          ? ""
          : `${rawLines.join("\n")}\n`;

      return {
        eventCount: globalStep,
        finalEventHash: previousHash,
        rawSha256: sha256(rawText),
      };
    },
  };
}

function writeManifest(files, manifest) {
  const humanText = fs.readFileSync(files.human, "utf8");
  const enriched = {
    ...manifest,
    humanSha256: sha256(humanText),
  };

  fs.writeFileSync(
    files.manifest,
    JSON.stringify(enriched, null, 2),
    "utf8",
  );

  return enriched;
}

/**
 * Programmatic API used by stress-test.js.
 */
function runAudit({
  n,
  selectedAlgorithm = "all",
  outputDirectory =
    process.env.PROBLEM1_LOG_DIR ??
    path.join(__dirname, "logs"),
  algorithms = DEFAULT_ALGORITHMS,
  consoleOutput = true,
} = {}) {
  if (!Number.isSafeInteger(n)) {
    throw new TypeError("n must be a safe integer");
  }

  if (
    selectedAlgorithm !== "all" &&
    !Object.hasOwn(algorithms, selectedAlgorithm)
  ) {
    throw new Error('Algorithm must be "a", "b", "c", or "all".');
  }

  const auditId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const files = createOutputFiles(outputDirectory, n);

  fs.writeFileSync(
    files.human,
    [
      "99TECH CODE CHALLENGE — PROBLEM 1",
      "MATHEMATICAL PROOF AUDIT",
      `Audit ID: ${auditId}`,
      `Started: ${startedAt}`,
      `Input n: ${n}`,
      `Selection: ${selectedAlgorithm}`,
      "",
    ].join("\n"),
    "utf8",
  );
  fs.writeFileSync(files.raw, "", "utf8");

  const writer = createWriter(files, auditId, consoleOutput);
  const results = {};
  let status = "ERROR";
  let errorData = null;

  writer.write({
    algorithm: "AUDIT_SESSION",
    action: "SESSION_STARTED",
    data: {
      n,
      selectedAlgorithm,
    },
  });

  try {
    for (const [key, algorithm] of selectedEntries(
      selectedAlgorithm,
      algorithms,
    )) {
      writeHeading(
        files.human,
        `${key.toUpperCase()}. ${algorithm.label.toUpperCase()}`,
      );

      writer.write({
        algorithm: "AUDIT_SESSION",
        action: "ALGORITHM_STARTED",
        data: {
          key,
          algorithm: algorithm.name,
        },
      });

      results[key] = algorithm.run(
        n,
        (event) => writer.write(event),
      );

      writer.write({
        algorithm: "AUDIT_SESSION",
        action: "ALGORITHM_COMPLETED",
        data: {
          key,
          algorithm: algorithm.name,
          result: results[key],
        },
      });
    }

    const values = Object.values(results);
    const consistent =
      values.length <= 1 ||
      values.every((value) => value === values[0]);

    writer.write({
      algorithm: "AUDIT_SESSION",
      action: "RESULTS_CROSS_CHECKED",
      data: {
        results,
        consistent,
      },
    });

    const reference = directBigIntReference(n);
    const matches = values.every(
      (value) => BigInt(value) === reference,
    );

    writer.write({
      algorithm: "AUDIT_SESSION",
      action: "INDEPENDENT_REFERENCE_CALCULATED",
      data: {
        reference: reference.toString(),
        matches,
      },
    });

    status = consistent && matches ? "PASSED" : "FAILED";

    writer.write({
      algorithm: "AUDIT_SESSION",
      action:
        status === "PASSED"
          ? "SESSION_PASSED"
          : "SESSION_FAILED",
      data: {
        status,
        results,
        consistent,
        matchesReference: matches,
      },
    });
  } catch (error) {
    errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    writer.write({
      algorithm: "AUDIT_SESSION",
      action: "SESSION_ERROR",
      data: {
        status: "ERROR",
        error: errorData,
        partialResults: results,
      },
    });
  }

  const integrity = writer.snapshot();
  const completedAt = new Date().toISOString();

  writeHeading(files.human, "AUDIT SUMMARY");
  append(files.human, `Status: ${status}`);
  append(files.human, `Results: ${JSON.stringify(results)}`);
  append(files.human, `Events: ${integrity.eventCount}`);
  append(files.human, `Final event hash: ${integrity.finalEventHash}`);
  append(files.human, `Raw evidence SHA-256: ${integrity.rawSha256}`);
  if (errorData) {
    append(files.human, `Error: ${errorData.name}: ${errorData.message}`);
  }

  const manifest = writeManifest(files, {
    schemaVersion: 1,
    auditId,
    input: n,
    selectedAlgorithm,
    status,
    startedAt,
    completedAt,
    results,
    error: errorData,
    eventCount: integrity.eventCount,
    finalEventHash: integrity.finalEventHash,
    rawSha256: integrity.rawSha256,
    files: {
      human: path.basename(files.human),
      raw: path.basename(files.raw),
      manifest: path.basename(files.manifest),
    },
  });

  return {
    status,
    results,
    files,
    manifest,
  };
}

function runCli() {
  try {
    const { n, selectedAlgorithm } =
      parseArguments(process.argv);

    const report = runAudit({
      n,
      selectedAlgorithm,
      consoleOutput: true,
    });

    console.log("");
    console.log(`Audit status : ${report.status}`);
    console.log(`Proof log    : ${report.files.human}`);
    console.log(`Raw evidence : ${report.files.raw}`);
    console.log(`Manifest     : ${report.files.manifest}`);

    if (report.status !== "PASSED") {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`Cannot start audit: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = {
  DEFAULT_ALGORITHMS,
  parseArguments,
  runAudit,
  sha256,
};
