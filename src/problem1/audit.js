"use strict";

/**
 * Separate audit layer for Problem 1.
 *
 * index.js contains only pure implementations. This file wraps those
 * implementations, records what was called, builds an independent proof for
 * each result, and writes tamper-evident logs.
 *
 * CLI:
 *   node audit.js 5 all
 *   node audit.js -4 a
 *
 * Output:
 *   *.log           Human-readable proof
 *   *.jsonl         SHA-256 hash-chained evidence
 *   *.manifest.json Integrity manifest
 */

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const {
  MAX_SAFE_SUM_N,
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
} = require("./index");

function validateAuditInput(n) {
  if (!Number.isSafeInteger(n)) {
    throw new TypeError("n must be a safe integer");
  }

  if (Math.abs(n) > MAX_SAFE_SUM_N) {
    throw new RangeError(
      `|n| must be <= ${MAX_SAFE_SUM_N} so the result remains a safe integer`,
    );
  }
}

function signedResult(n, positiveValue) {
  return n < 0 ? -positiveValue : positiveValue;
}

function identityMatrix3() {
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
}

function multiply3x3WithProof(left, right, emit, context) {
  const result = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  emit({
    algorithm: "B_LINEAR_ALGEBRA",
    action: "MATRIX_MULTIPLICATION_STARTED",
    data: {
      ...context,
      left,
      right,
    },
  });

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const terms = [];

      for (let index = 0; index < 3; index += 1) {
        const product = left[row][index] * right[index][column];
        result[row][column] += product;
        terms.push({
          leftValue: left[row][index],
          rightValue: right[index][column],
          product,
        });
      }

      emit({
        algorithm: "B_LINEAR_ALGEBRA",
        action: "MATRIX_CELL_CALCULATED",
        data: {
          ...context,
          row,
          column,
          terms,
          cellValue: result[row][column],
        },
      });
    }
  }

  emit({
    algorithm: "B_LINEAR_ALGEBRA",
    action: "MATRIX_MULTIPLICATION_COMPLETED",
    data: {
      ...context,
      result,
    },
  });

  return result;
}

/**
 * Independent proof for solution A.
 *
 * This calculation lives in audit.js, not index.js. The production function is
 * called separately and its returned value is compared with this proof result.
 */
function proveCombinatorics(n, emit) {
  const algorithm = "A_COMBINATORICS";
  const magnitude = Math.abs(n);
  let firstFactor = magnitude;
  let secondFactor = magnitude + 1;

  emit({ algorithm, action: "INPUT_RECEIVED", data: { n } });
  emit({
    algorithm,
    action: "INPUT_VALIDATED",
    data: {
      n,
      isSafeInteger: true,
      isWithinSafeResultRange: true,
    },
  });
  emit({
    algorithm,
    action: "MAGNITUDE_CALCULATED",
    data: { expression: "|n|", magnitude },
  });
  emit({
    algorithm,
    action: "COMBINATION_IDENTITY_APPLIED",
    data: {
      identity: "S(n) = n(n + 1) / 2",
      firstFactor,
      secondFactor,
      divisor: 2,
    },
  });

  if (firstFactor % 2 === 0) {
    const before = firstFactor;
    firstFactor /= 2;
    emit({
      algorithm,
      action: "EVEN_FACTOR_DIVIDED",
      data: {
        factor: "firstFactor",
        before,
        divisor: 2,
        after: firstFactor,
      },
    });
  } else {
    const before = secondFactor;
    secondFactor /= 2;
    emit({
      algorithm,
      action: "EVEN_FACTOR_DIVIDED",
      data: {
        factor: "secondFactor",
        before,
        divisor: 2,
        after: secondFactor,
      },
    });
  }

  const positiveValue = firstFactor * secondFactor;
  const result = signedResult(n, positiveValue);

  emit({
    algorithm,
    action: "FACTORS_MULTIPLIED",
    data: { firstFactor, secondFactor, positiveValue },
  });
  emit({
    algorithm,
    action: "SIGN_RESTORED",
    data: { originalInput: n, positiveValue, result },
  });
  emit({
    algorithm,
    action: "PROOF_COMPLETED",
    data: {
      result,
      complexity: { time: "O(1)", space: "O(1)" },
    },
  });

  return result;
}

/**
 * Independent proof for solution B using the same mathematical state model,
 * but implemented entirely in the audit layer so index.js remains uninstrumented.
 */
function proveLinearAlgebra(n, emit) {
  const algorithm = "B_LINEAR_ALGEBRA";
  const magnitude = Math.abs(n);
  const transitionMatrix = [
    [1, 1, 1],
    [0, 1, 1],
    [0, 0, 1],
  ];

  emit({ algorithm, action: "INPUT_RECEIVED", data: { n } });
  emit({
    algorithm,
    action: "INPUT_VALIDATED",
    data: {
      n,
      isSafeInteger: true,
      isWithinSafeResultRange: true,
    },
  });
  emit({
    algorithm,
    action: "MAGNITUDE_CALCULATED",
    data: { expression: "|n|", magnitude },
  });
  emit({
    algorithm,
    action: "STATE_MODEL_DEFINED",
    data: {
      stateVector: ["sum_k", "k", "1"],
      initialVector: [0, 0, 1],
      transitionMatrix,
    },
  });

  let exponent = magnitude;
  let resultMatrix = identityMatrix3();
  let baseMatrix = transitionMatrix;
  let round = 0;

  emit({
    algorithm,
    action: "MATRIX_POWER_INITIALIZED",
    data: {
      targetPower: magnitude,
      exponent,
      resultMatrix,
      baseMatrix,
    },
  });

  while (exponent > 0) {
    round += 1;

    emit({
      algorithm,
      action: "POWER_ROUND_STARTED",
      data: {
        round,
        exponent,
        isOdd: exponent % 2 === 1,
      },
    });

    if (exponent % 2 === 1) {
      resultMatrix = multiply3x3WithProof(
        resultMatrix,
        baseMatrix,
        emit,
        { round, purpose: "ACCUMULATE_RESULT" },
      );

      emit({
        algorithm,
        action: "RESULT_MATRIX_UPDATED",
        data: { round, resultMatrix },
      });
    } else {
      emit({
        algorithm,
        action: "RESULT_MULTIPLICATION_SKIPPED",
        data: { round, reason: "Exponent is even" },
      });
    }

    const previousExponent = exponent;
    exponent = Math.floor(exponent / 2);

    emit({
      algorithm,
      action: "EXPONENT_HALVED",
      data: {
        round,
        before: previousExponent,
        after: exponent,
      },
    });

    if (exponent > 0) {
      baseMatrix = multiply3x3WithProof(
        baseMatrix,
        baseMatrix,
        emit,
        { round, purpose: "SQUARE_BASE" },
      );

      emit({
        algorithm,
        action: "BASE_MATRIX_SQUARED",
        data: { round, baseMatrix },
      });
    } else {
      emit({
        algorithm,
        action: "FINAL_BASE_SQUARE_SKIPPED",
        data: {
          round,
          reason: "No exponent bits remain",
        },
      });
    }
  }

  const positiveValue = resultMatrix[0][2];
  const result = signedResult(n, positiveValue);

  emit({
    algorithm,
    action: "MATRIX_POWER_COMPLETED",
    data: {
      power: magnitude,
      poweredMatrix: resultMatrix,
    },
  });
  emit({
    algorithm,
    action: "INITIAL_VECTOR_APPLIED",
    data: {
      poweredMatrix: resultMatrix,
      initialVector: [0, 0, 1],
      resultingVector: [
        resultMatrix[0][2],
        resultMatrix[1][2],
        resultMatrix[2][2],
      ],
      positiveValue,
    },
  });
  emit({
    algorithm,
    action: "SIGN_RESTORED",
    data: { originalInput: n, positiveValue, result },
  });
  emit({
    algorithm,
    action: "PROOF_COMPLETED",
    data: {
      result,
      complexity: { time: "O(log |n|)", space: "O(1)" },
    },
  });

  return result;
}

/**
 * Independent O(1) proof for solution C.
 *
 * index.js executes the actual pairing loop. The audit proves the same result
 * from pairCount × pairSum (+ middle value), avoiding a second large loop just
 * for logging.
 */
function proveSymmetricPairing(n, emit) {
  const algorithm = "C_PROBABILITY_SYMMETRY";
  const magnitude = Math.abs(n);
  const pairCount = Math.floor(magnitude / 2);
  const constantPairSum = magnitude + 1;
  const pairedTotal = pairCount * constantPairSum;
  const middleValue = magnitude % 2 === 1
    ? (magnitude + 1) / 2
    : 0;
  const positiveValue = pairedTotal + middleValue;
  const result = signedResult(n, positiveValue);

  emit({ algorithm, action: "INPUT_RECEIVED", data: { n } });
  emit({
    algorithm,
    action: "INPUT_VALIDATED",
    data: {
      n,
      isSafeInteger: true,
      isWithinSafeResultRange: true,
    },
  });
  emit({
    algorithm,
    action: "MAGNITUDE_CALCULATED",
    data: { expression: "|n|", magnitude },
  });
  emit({
    algorithm,
    action: "ANTITHETIC_MODEL_DEFINED",
    data: {
      sampleSpace: `{1, 2, ..., ${magnitude}}`,
      mapping: "x ↔ n + 1 - x",
      pairCount,
      constantPairSum,
    },
  });
  emit({
    algorithm,
    action: "PAIRED_TOTAL_CALCULATED",
    data: {
      pairCount,
      constantPairSum,
      expression: `${pairCount} × ${constantPairSum}`,
      pairedTotal,
    },
  });

  if (middleValue > 0) {
    emit({
      algorithm,
      action: "MIDDLE_VALUE_ADDED",
      data: {
        middleValue,
        pairedTotal,
        positiveValue,
      },
    });
  } else {
    emit({
      algorithm,
      action: "MIDDLE_VALUE_NOT_REQUIRED",
      data: { reason: "The number of values is even" },
    });
  }

  emit({
    algorithm,
    action: "SIGN_RESTORED",
    data: { originalInput: n, positiveValue, result },
  });
  emit({
    algorithm,
    action: "PROOF_COMPLETED",
    data: {
      result,
      implementationComplexity: {
        time: "O(|n|)",
        space: "O(1)",
      },
      auditProofComplexity: {
        time: "O(1)",
        space: "O(1)",
      },
    },
  });

  return result;
}

const DEFAULT_ALGORITHMS = {
  a: {
    name: "A_COMBINATORICS",
    label: "Closed-form arithmetic series",
    run: sum_to_n_a,
    prove: proveCombinatorics,
  },
  b: {
    name: "B_LINEAR_ALGEBRA",
    label: "Fast matrix exponentiation",
    run: sum_to_n_b,
    prove: proveLinearAlgebra,
  },
  c: {
    name: "C_PROBABILITY_SYMMETRY",
    label: "Symmetric pairing",
    run: sum_to_n_c,
    prove: proveSymmetricPairing,
  },
};

function parseArguments(argv) {
  const rawN = argv[2];
  const selectedAlgorithm = (argv[3] ?? "all").toLowerCase();

  if (rawN === undefined) {
    throw new Error("Missing n. Example: node audit.js 5 all");
  }

  const n = Number(rawN);
  validateAuditInput(n);

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

  if (algorithm === "AUDIT_SESSION") {
    switch (action) {
      case "SESSION_STARTED":
        return [
          `Input n = ${data.n}`,
          `Selected algorithms = ${data.selectedAlgorithm}`,
        ];
      case "ALGORITHM_STARTED":
        return [`Start ${data.algorithm}`];
      case "IMPLEMENTATION_CALLED":
        return [`Call index.js export ${data.functionName}(${data.n})`];
      case "IMPLEMENTATION_RETURNED":
        return [`index.js returned ${data.result}`];
      case "IMPLEMENTATION_VERIFIED":
        return [
          `Implementation result = ${data.implementationResult}`,
          `Independent proof result = ${data.proofResult}`,
          `Match = ${data.matches}`,
        ];
      case "ALGORITHM_COMPLETED":
        return [`${data.algorithm} audit completed`];
      case "RESULTS_CROSS_CHECKED":
        return [
          `Results = ${JSON.stringify(data.results)}`,
          `All implementations agree = ${data.consistent}`,
        ];
      case "INDEPENDENT_REFERENCE_CALCULATED":
        return [
          `BigInt reference = ${data.reference}`,
          `All results match reference = ${data.matches}`,
        ];
      case "SESSION_PASSED":
        return ["Audit status = PASSED"];
      case "SESSION_FAILED":
        return ["Audit status = FAILED"];
      case "SESSION_ERROR":
        return [
          "Audit status = ERROR",
          `${data.error.name}: ${data.error.message}`,
        ];
      default:
        return [JSON.stringify(data)];
    }
  }

  switch (action) {
    case "INPUT_RECEIVED":
      return [`Receive n = ${data.n}`];
    case "INPUT_VALIDATED":
      return [
        `Input is a safe integer = ${data.isSafeInteger}`,
        `Result range is safe = ${data.isWithinSafeResultRange}`,
      ];
    case "MAGNITUDE_CALCULATED":
      return [`|n| = ${data.magnitude}`];
    case "COMBINATION_IDENTITY_APPLIED":
      return [
        data.identity,
        `${data.firstFactor} × ${data.secondFactor} ÷ ${data.divisor}`,
      ];
    case "EVEN_FACTOR_DIVIDED":
      return [
        `${data.factor}: ${data.before} ÷ ${data.divisor} = ${data.after}`,
      ];
    case "FACTORS_MULTIPLIED":
      return [
        `${data.firstFactor} × ${data.secondFactor} = ${data.positiveValue}`,
      ];
    case "STATE_MODEL_DEFINED":
      return [
        `State vector = ${formatVector(data.stateVector)}`,
        `Initial vector = ${formatVector(data.initialVector)}`,
        "Transition matrix:",
        formatMatrix(data.transitionMatrix),
      ];
    case "MATRIX_POWER_INITIALIZED":
      return [
        `Compute M^${data.targetPower} by exponentiation by squaring`,
        "Initial result matrix:",
        formatMatrix(data.resultMatrix),
        "Initial base matrix:",
        formatMatrix(data.baseMatrix),
      ];
    case "POWER_ROUND_STARTED":
      return [
        `Round ${data.round}: exponent ${data.exponent} is ${data.isOdd ? "odd" : "even"}`,
      ];
    case "MATRIX_MULTIPLICATION_STARTED":
      return [
        `${data.purpose}, round ${data.round}`,
        "Left:",
        formatMatrix(data.left),
        "Right:",
        formatMatrix(data.right),
      ];
    case "MATRIX_CELL_CALCULATED": {
      const expression = data.terms
        .map((term) => `${term.leftValue}×${term.rightValue}`)
        .join(" + ");
      return [
        `Cell [${data.row + 1},${data.column + 1}] = ${expression} = ${data.cellValue}`,
      ];
    }
    case "MATRIX_MULTIPLICATION_COMPLETED":
      return [`${data.purpose} result:`, formatMatrix(data.result)];
    case "RESULT_MATRIX_UPDATED":
      return ["Accumulated result:", formatMatrix(data.resultMatrix)];
    case "RESULT_MULTIPLICATION_SKIPPED":
    case "FINAL_BASE_SQUARE_SKIPPED":
      return [data.reason];
    case "EXPONENT_HALVED":
      return [`floor(${data.before}/2) = ${data.after}`];
    case "BASE_MATRIX_SQUARED":
      return ["Squared base:", formatMatrix(data.baseMatrix)];
    case "MATRIX_POWER_COMPLETED":
      return [`M^${data.power}:`, formatMatrix(data.poweredMatrix)];
    case "INITIAL_VECTOR_APPLIED":
      return [
        `${formatVector(data.initialVector)} → ${formatVector(data.resultingVector)}`,
        `First component = ${data.positiveValue}`,
      ];
    case "ANTITHETIC_MODEL_DEFINED":
      return [
        `Sample space ${data.sampleSpace}`,
        `Mapping ${data.mapping}`,
        `Pair count = ${data.pairCount}`,
        `Each pair sums to ${data.constantPairSum}`,
      ];
    case "PAIRED_TOTAL_CALCULATED":
      return [
        `${data.expression} = ${data.pairedTotal}`,
      ];
    case "MIDDLE_VALUE_ADDED":
      return [
        `${data.pairedTotal} + middle ${data.middleValue} = ${data.positiveValue}`,
      ];
    case "MIDDLE_VALUE_NOT_REQUIRED":
      return [data.reason];
    case "SIGN_RESTORED":
      return [
        `Restore sign: ${data.positiveValue} → ${data.result}`,
      ];
    case "PROOF_COMPLETED":
      return [`Proof result = ${data.result}`];
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
      const completeEvent = { ...unsignedEvent, eventHash };
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
      const rawText = rawLines.length === 0
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
 * Audit one function exported by index.js.
 *
 * This is the separation requested by the challenge review:
 *   1. call the pure implementation;
 *   2. generate an independent proof in audit.js;
 *   3. log and compare both values.
 */
function auditAlgorithm({ key, n, algorithm, writeEvent }) {
  if (!algorithm || typeof algorithm.run !== "function") {
    throw new TypeError(`Algorithm ${key} must provide a run function`);
  }

  if (typeof algorithm.prove !== "function") {
    throw new TypeError(`Algorithm ${key} must provide a prove function`);
  }

  if (typeof writeEvent !== "function") {
    throw new TypeError("writeEvent must be a function");
  }

  writeEvent({
    algorithm: "AUDIT_SESSION",
    action: "ALGORITHM_STARTED",
    data: { key, algorithm: algorithm.name },
  });
  writeEvent({
    algorithm: "AUDIT_SESSION",
    action: "IMPLEMENTATION_CALLED",
    data: {
      key,
      algorithm: algorithm.name,
      functionName: algorithm.run.name || `sum_to_n_${key}`,
      n,
    },
  });

  const implementationResult = algorithm.run(n);

  writeEvent({
    algorithm: "AUDIT_SESSION",
    action: "IMPLEMENTATION_RETURNED",
    data: {
      key,
      algorithm: algorithm.name,
      result: implementationResult,
    },
  });

  const proofResult = algorithm.prove(n, writeEvent);
  const matches = implementationResult === proofResult;

  writeEvent({
    algorithm: "AUDIT_SESSION",
    action: "IMPLEMENTATION_VERIFIED",
    data: {
      key,
      algorithm: algorithm.name,
      implementationResult,
      proofResult,
      matches,
    },
  });
  writeEvent({
    algorithm: "AUDIT_SESSION",
    action: "ALGORITHM_COMPLETED",
    data: {
      key,
      algorithm: algorithm.name,
      result: implementationResult,
      proofResult,
      matches,
    },
  });

  return {
    result: implementationResult,
    proofResult,
    matches,
  };
}

/**
 * Programmatic session API used by stress-test.js and the CLI.
 */
function runAudit({
  n,
  selectedAlgorithm = "all",
  outputDirectory =
    process.env.PROBLEM1_LOG_DIR ?? path.join(__dirname, "logs"),
  algorithms = DEFAULT_ALGORITHMS,
  consoleOutput = true,
} = {}) {
  validateAuditInput(n);

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
      "SEPARATED IMPLEMENTATION AUDIT",
      `Audit ID: ${auditId}`,
      `Started: ${startedAt}`,
      `Input n: ${n}`,
      `Selection: ${selectedAlgorithm}`,
      "index.js: pure implementations only",
      "audit.js: wrapper, proof, logging, and integrity",
      "",
    ].join("\n"),
    "utf8",
  );
  fs.writeFileSync(files.raw, "", "utf8");

  const writer = createWriter(files, auditId, consoleOutput);
  const results = {};
  const proofChecks = {};
  let status = "ERROR";
  let errorData = null;

  writer.write({
    algorithm: "AUDIT_SESSION",
    action: "SESSION_STARTED",
    data: { n, selectedAlgorithm },
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

      const audited = auditAlgorithm({
        key,
        n,
        algorithm,
        writeEvent: (event) => writer.write(event),
      });

      results[key] = audited.result;
      proofChecks[key] = {
        proofResult: audited.proofResult,
        matches: audited.matches,
      };
    }

    const values = Object.values(results);
    const consistent =
      values.length <= 1 ||
      values.every((value) => value === values[0]);
    const allProofsMatch = Object.values(proofChecks)
      .every((check) => check.matches);

    writer.write({
      algorithm: "AUDIT_SESSION",
      action: "RESULTS_CROSS_CHECKED",
      data: {
        results,
        proofChecks,
        consistent,
        allProofsMatch,
      },
    });

    const reference = directBigIntReference(n);
    const matchesReference = values.every(
      (value) => BigInt(value) === reference,
    );

    writer.write({
      algorithm: "AUDIT_SESSION",
      action: "INDEPENDENT_REFERENCE_CALCULATED",
      data: {
        reference: reference.toString(),
        matches: matchesReference,
      },
    });

    status = consistent && allProofsMatch && matchesReference
      ? "PASSED"
      : "FAILED";

    writer.write({
      algorithm: "AUDIT_SESSION",
      action: status === "PASSED"
        ? "SESSION_PASSED"
        : "SESSION_FAILED",
      data: {
        status,
        results,
        proofChecks,
        consistent,
        allProofsMatch,
        matchesReference,
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
        partialProofChecks: proofChecks,
      },
    });
  }

  const integrity = writer.snapshot();
  const completedAt = new Date().toISOString();

  writeHeading(files.human, "AUDIT SUMMARY");
  append(files.human, `Status: ${status}`);
  append(files.human, `Results: ${JSON.stringify(results)}`);
  append(files.human, `Proof checks: ${JSON.stringify(proofChecks)}`);
  append(files.human, `Events: ${integrity.eventCount}`);
  append(files.human, `Final event hash: ${integrity.finalEventHash}`);
  append(files.human, `Raw evidence SHA-256: ${integrity.rawSha256}`);

  if (errorData) {
    append(files.human, `Error: ${errorData.name}: ${errorData.message}`);
  }

  const manifest = writeManifest(files, {
    schemaVersion: 2,
    auditId,
    input: n,
    selectedAlgorithm,
    status,
    startedAt,
    completedAt,
    results,
    proofChecks,
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
    proofChecks,
    files,
    manifest,
  };
}

function runCli() {
  try {
    const { n, selectedAlgorithm } = parseArguments(process.argv);
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
  auditAlgorithm,
  parseArguments,
  proveCombinatorics,
  proveLinearAlgebra,
  proveSymmetricPairing,
  runAudit,
  sha256,
};
