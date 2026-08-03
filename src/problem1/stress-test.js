"use strict";

/**
 * Complete functional, negative-path, audit-integrity, concurrency,
 * mutation-sensitivity, and performance test suite.
 *
 * Run:
 *   node stress-test.js smoke
 *   node stress-test.js standard
 *   node stress-test.js heavy
 *   node stress-test.js standard 20260803
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  spawn,
  spawnSync,
} = require("node:child_process");
const { performance } = require("node:perf_hooks");

const {
  MAX_SAFE_SUM_N,
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
} = require("./index");

const {
  DEFAULT_ALGORITHMS,
  runAudit,
} = require("./audit");

const {
  verifyAudit,
} = require("./verify-audit");

const MODES = {
  smoke: {
    exhaustiveLimit: 100,
    randomAllCases: 100,
    randomFastCases: 500,
    propertyCases: 100,
    concurrentAudits: 3,
    cPerformanceN: 50_000,
    performanceCases: 5_000,
  },
  standard: {
    exhaustiveLimit: 2_000,
    randomAllCases: 500,
    randomFastCases: 5_000,
    propertyCases: 500,
    concurrentAudits: 6,
    cPerformanceN: 1_000_000,
    performanceCases: 50_000,
  },
  heavy: {
    exhaustiveLimit: 10_000,
    randomAllCases: 3_000,
    randomFastCases: 50_000,
    propertyCases: 5_000,
    concurrentAudits: 12,
    cPerformanceN: 5_000_000,
    performanceCases: 500_000,
  },
};

function parseArguments(argv) {
  const mode = (argv[2] ?? "standard").toLowerCase();
  const seed = Number(argv[3] ?? 20260803);

  if (!Object.hasOwn(MODES, mode)) {
    throw new Error(
      `Unknown mode "${mode}". Use smoke, standard, or heavy.`,
    );
  }

  if (!Number.isSafeInteger(seed)) {
    throw new TypeError("Seed must be a safe integer");
  }

  return {
    mode,
    seed,
    config: MODES[mode],
  };
}

function createRandom(seed) {
  let state = seed >>> 0;

  return function random() {
    state += 0x6d2b79f5;
    let value = state;

    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) /
      4_294_967_296;
  };
}

function randomInteger(random, minimum, maximum) {
  return Math.floor(
    random() * (maximum - minimum + 1),
  ) + minimum;
}

function expectedBigInt(n) {
  const magnitude = BigInt(Math.abs(n));
  const positive =
    (magnitude * (magnitude + 1n)) / 2n;

  return n < 0 ? -positive : positive;
}

function expectedNumber(n) {
  return Number(expectedBigInt(n));
}

function safeTimestamp() {
  return new Date()
    .toISOString()
    .replaceAll(":", "-")
    .replaceAll(".", "-");
}

function formatDuration(milliseconds) {
  return milliseconds >= 1_000
    ? `${(milliseconds / 1_000).toFixed(2)} s`
    : `${milliseconds.toFixed(2)} ms`;
}

function spawnPromise(command, arguments_, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, arguments_, options);
    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
    });

    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", (error) => {
      resolve({
        code: null,
        signal: null,
        stdout,
        stderr,
        error,
      });
    });

    child.on("close", (code, signal) => {
      resolve({
        code,
        signal,
        stdout,
        stderr,
        error: null,
      });
    });
  });
}

class Runner {
  constructor({ mode, seed, config }) {
    this.mode = mode;
    this.seed = seed;
    this.config = config;
    this.random = createRandom(seed);
    this.suites = [];
    this.failures = [];
    this.assertions = 0;
    this.started = performance.now();
    this.tempRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), "problem1-quality-"),
    );

    const logsDirectory = path.join(__dirname, "logs");
    fs.mkdirSync(logsDirectory, { recursive: true });

    const base = `stress-test-${safeTimestamp()}`;
    this.textReport = path.join(
      logsDirectory,
      `${base}.log`,
    );
    this.jsonReport = path.join(
      logsDirectory,
      `${base}.json`,
    );

    fs.writeFileSync(this.textReport, "", "utf8");
  }

  log(message = "") {
    console.log(message);
    fs.appendFileSync(
      this.textReport,
      `${message}\n`,
      "utf8",
    );
  }

  assert(condition, message, details = {}) {
    this.assertions += 1;

    if (!condition) {
      const failure = {
        message,
        details,
      };

      this.failures.push(failure);
      throw new Error(
        `${message} | ${JSON.stringify(details)}`,
      );
    }
  }

  async suite(name, operation) {
    const before = this.assertions;
    const started = performance.now();

    this.log(`\n[RUN ] ${name}`);

    try {
      const metadata = await operation();
      const durationMs = performance.now() - started;

      this.suites.push({
        name,
        status: "PASSED",
        durationMs,
        assertions: this.assertions - before,
        metadata: metadata ?? {},
      });

      this.log(
        `[PASS] ${name} | ${formatDuration(durationMs)} | ` +
        `${(this.assertions - before).toLocaleString("en-US")} assertions`,
      );
    } catch (error) {
      const durationMs = performance.now() - started;

      this.suites.push({
        name,
        status: "FAILED",
        durationMs,
        assertions: this.assertions - before,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });

      this.log(`[FAIL] ${name} | ${error.message}`);
    }
  }

  assertCorrect(implementation, n, label) {
    const expected = expectedNumber(n);
    const actual = implementation(n);

    this.assert(
      actual === expected,
      `${label} returned wrong result`,
      { n, expected, actual },
    );

    this.assert(
      Number.isSafeInteger(actual),
      `${label} returned unsafe result`,
      { n, actual },
    );
  }

  async run() {
    this.log("99TECH Problem 1 — Complete quality suite");
    this.log(`Mode: ${this.mode}`);
    this.log(`Seed: ${this.seed}`);
    this.log(`Node: ${process.version}`);
    this.log(`Temporary test root: ${this.tempRoot}`);

    await this.suite(
      "Valid edge cases and exact BigInt oracle",
      () => this.validEdgeCases(),
    );

    await this.suite(
      "Exhaustive signed range",
      () => this.exhaustiveRange(),
    );

    await this.suite(
      "Deterministic randomized coverage",
      () => this.randomCoverage(),
    );

    await this.suite(
      "Safe-result boundary precision",
      () => this.boundaryPrecision(),
    );

    await this.suite(
      "Invalid type and non-integer rejection",
      () => this.invalidInputs(),
    );

    await this.suite(
      "Out-of-contract safe-result overflow rejection",
      () => this.outOfRangeInputs(),
    );

    await this.suite(
      "Mathematical invariants",
      () => this.mathematicalProperties(),
    );

    await this.suite(
      "Audit callback schema and logger failure propagation",
      () => this.auditCallbackContract(),
    );

    await this.suite(
      "Audit CLI happy path and proof verification",
      () => this.auditCliHappyPath(),
    );

    await this.suite(
      "Audit CLI invalid argument paths",
      () => this.auditCliInvalidArguments(),
    );

    await this.suite(
      "File-system failure path",
      () => this.fileSystemFailure(),
    );

    await this.suite(
      "Injected algorithm failure with partial error audit",
      () => this.injectedAlgorithmFailure(),
    );

    await this.suite(
      "Mutation-test sensitivity",
      () => this.mutationSensitivity(),
    );

    await this.suite(
      "Tamper and truncation detection",
      () => this.tamperDetection(),
    );

    await this.suite(
      "Concurrent audit isolation and filename uniqueness",
      () => this.concurrentAudits(),
    );

    await this.suite(
      "Subprocess timeout detection",
      () => this.timeoutDetection(),
    );

    await this.suite(
      "Performance and long-loop execution",
      () => this.performanceChecks(),
    );

    const passed = this.suites.filter(
      (suite) => suite.status === "PASSED",
    ).length;
    const status =
      passed === this.suites.length
        ? "PASSED"
        : "FAILED";
    const durationMs = performance.now() - this.started;

    const report = {
      status,
      mode: this.mode,
      seed: this.seed,
      node: process.version,
      platform: `${process.platform} ${process.arch}`,
      assertions: this.assertions,
      passedSuites: passed,
      totalSuites: this.suites.length,
      durationMs,
      suites: this.suites,
      failures: this.failures,
      reports: {
        text: this.textReport,
        json: this.jsonReport,
      },
    };

    fs.writeFileSync(
      this.jsonReport,
      JSON.stringify(report, null, 2),
      "utf8",
    );

    this.log("\n" + "=".repeat(100));
    this.log(`QUALITY SUITE STATUS: ${status}`);
    this.log(
      `Suites: ${passed}/${this.suites.length} passed`,
    );
    this.log(
      `Assertions: ${this.assertions.toLocaleString("en-US")}`,
    );
    this.log(`Duration: ${formatDuration(durationMs)}`);
    this.log(`Text report: ${this.textReport}`);
    this.log(`JSON report: ${this.jsonReport}`);

    try {
      fs.rmSync(this.tempRoot, {
        recursive: true,
        force: true,
      });
    } catch {
      // Report cleanup failure only as non-fatal diagnostic.
      this.log(
        `Warning: could not remove temp directory ${this.tempRoot}`,
      );
    }

    if (status !== "PASSED") {
      process.exitCode = 1;
    }

    return report;
  }

  validEdgeCases() {
    const cases = [
      0,
      -0,
      1,
      -1,
      2,
      -2,
      3,
      -3,
      5,
      -5,
      10,
      -10,
      99,
      -99,
      10_000,
      -10_000,
      1_000_000,
      -1_000_000,
      MAX_SAFE_SUM_N,
      -MAX_SAFE_SUM_N,
    ];

    for (const n of cases) {
      this.assertCorrect(sum_to_n_a, n, "A");
      this.assertCorrect(sum_to_n_b, n, "B");

      if (Math.abs(n) <= this.config.cPerformanceN) {
        this.assertCorrect(sum_to_n_c, n, "C");
      }
    }

    return {
      cases: cases.length,
    };
  }

  exhaustiveRange() {
    const limit = this.config.exhaustiveLimit;

    for (let n = -limit; n <= limit; n += 1) {
      const expected = expectedNumber(n);
      const a = sum_to_n_a(n);
      const b = sum_to_n_b(n);
      const c = sum_to_n_c(n);

      this.assert(
        a === expected &&
        b === expected &&
        c === expected,
        "Exhaustive result mismatch",
        { n, expected, a, b, c },
      );
    }

    return {
      range: `[-${limit}, ${limit}]`,
      cases: limit * 2 + 1,
    };
  }

  randomCoverage() {
    for (
      let index = 0;
      index < this.config.randomAllCases;
      index += 1
    ) {
      const n = randomInteger(
        this.random,
        -50_000,
        50_000,
      );
      const expected = expectedNumber(n);
      const a = sum_to_n_a(n);
      const b = sum_to_n_b(n);
      const c = sum_to_n_c(n);

      this.assert(
        a === expected &&
        b === expected &&
        c === expected,
        "Random all-implementation mismatch",
        { index, n, expected, a, b, c },
      );
    }

    for (
      let index = 0;
      index < this.config.randomFastCases;
      index += 1
    ) {
      const n = randomInteger(
        this.random,
        -MAX_SAFE_SUM_N,
        MAX_SAFE_SUM_N,
      );
      const expected = expectedNumber(n);
      const a = sum_to_n_a(n);
      const b = sum_to_n_b(n);

      this.assert(
        a === expected && b === expected,
        "Random large precision mismatch",
        { index, n, expected, a, b },
      );
    }

    return {
      allImplementationCases:
        this.config.randomAllCases,
      fastImplementationCases:
        this.config.randomFastCases,
    };
  }

  boundaryPrecision() {
    const offsets = [
      0,
      1,
      2,
      3,
      10,
      100,
      1_000,
      1_000_000,
    ];

    for (const offset of offsets) {
      const magnitude = MAX_SAFE_SUM_N - offset;

      for (const n of [magnitude, -magnitude]) {
        this.assertCorrect(sum_to_n_a, n, "A");
        this.assertCorrect(sum_to_n_b, n, "B");
      }
    }

    this.assert(
      expectedBigInt(MAX_SAFE_SUM_N) <=
      BigInt(Number.MAX_SAFE_INTEGER),
      "MAX_SAFE_SUM_N should be valid",
    );

    this.assert(
      expectedBigInt(MAX_SAFE_SUM_N + 1) >
      BigInt(Number.MAX_SAFE_INTEGER),
      "MAX_SAFE_SUM_N + 1 should overflow safe result",
    );

    return {
      maximumInput: MAX_SAFE_SUM_N,
      maximumResult:
        expectedBigInt(MAX_SAFE_SUM_N).toString(),
    };
  }

  invalidInputs() {
    const invalid = [
      NaN,
      Infinity,
      -Infinity,
      1.5,
      -1.5,
      "5",
      null,
      undefined,
      {},
      [],
      true,
      false,
      5n,
      Symbol("5"),
      Number.MAX_SAFE_INTEGER + 1,
    ];

    for (const [label, implementation] of [
      ["A", sum_to_n_a],
      ["B", sum_to_n_b],
      ["C", sum_to_n_c],
    ]) {
      for (const value of invalid) {
        let error;

        try {
          implementation(value);
        } catch (caught) {
          error = caught;
        }

        this.assert(
          error instanceof TypeError,
          `${label} failed to reject invalid input`,
          {
            type: typeof value,
            value: String(value),
            error: error?.name,
          },
        );
      }
    }

    return {
      invalidValues: invalid.length,
      implementations: 3,
    };
  }

  outOfRangeInputs() {
    const values = [
      MAX_SAFE_SUM_N + 1,
      -(MAX_SAFE_SUM_N + 1),
      Number.MAX_SAFE_INTEGER,
      -Number.MAX_SAFE_INTEGER,
    ];

    for (const [label, implementation] of [
      ["A", sum_to_n_a],
      ["B", sum_to_n_b],
      ["C", sum_to_n_c],
    ]) {
      for (const n of values) {
        let error;

        try {
          implementation(n);
        } catch (caught) {
          error = caught;
        }

        this.assert(
          error instanceof RangeError,
          `${label} should reject unsafe-result range`,
          {
            n,
            error: error?.name,
          },
        );
      }
    }

    return {
      rejectedValues: values,
    };
  }

  mathematicalProperties() {
    const maximum = 50_000;

    for (
      let index = 0;
      index < this.config.propertyCases;
      index += 1
    ) {
      const n = randomInteger(
        this.random,
        1,
        maximum,
      );

      for (const [label, implementation] of [
        ["A", sum_to_n_a],
        ["B", sum_to_n_b],
        ["C", sum_to_n_c],
      ]) {
        const positive = implementation(n);
        const negative = implementation(-n);
        const previous = implementation(n - 1);

        this.assert(
          negative === -positive,
          `${label}: S(-n) = -S(n) failed`,
          { n, positive, negative },
        );

        this.assert(
          positive - previous === n,
          `${label}: recurrence failed`,
          {
            n,
            positive,
            previous,
          },
        );

        this.assert(
          2 * positive === n * (n + 1),
          `${label}: triangular invariant failed`,
          {
            n,
            positive,
          },
        );
      }
    }

    return {
      cases: this.config.propertyCases,
      properties: [
        "S(-n) = -S(n)",
        "S(n) - S(n - 1) = n",
        "2S(n) = n(n + 1)",
      ],
    };
  }

  auditCallbackContract() {
    for (const [label, algorithm, implementation] of [
      ["A", "A_COMBINATORICS", sum_to_n_a],
      ["B", "B_LINEAR_ALGEBRA", sum_to_n_b],
      ["C", "C_PROBABILITY_SYMMETRY", sum_to_n_c],
    ]) {
      const events = [];
      const result = implementation(
        5,
        (event) => events.push(event),
      );

      this.assert(result === 15, `${label} result mismatch`);
      this.assert(events.length > 0, `${label} emitted no events`);
      this.assert(
        events[0].action === "INPUT_RECEIVED",
        `${label} first event mismatch`,
      );
      this.assert(
        events.at(-1).action === "COMPLETED",
        `${label} terminal event mismatch`,
      );
      this.assert(
        events.every(
          (event) =>
            event.algorithm === algorithm &&
            typeof event.action === "string" &&
            event.data &&
            typeof event.data === "object",
        ),
        `${label} event schema mismatch`,
      );
    }

    const sentinel = new Error("logger failure");
    let propagated;

    try {
      sum_to_n_a(5, () => {
        throw sentinel;
      });
    } catch (error) {
      propagated = error;
    }

    this.assert(
      propagated === sentinel,
      "Audit callback failure was silently swallowed",
    );

    return {
      implementations: 3,
      loggerFailurePropagates: true,
    };
  }

  auditCliHappyPath() {
    const outputDirectory = path.join(
      this.tempRoot,
      "audit-happy",
    );

    const result = runAudit({
      n: 5,
      selectedAlgorithm: "all",
      outputDirectory,
      consoleOutput: false,
    });

    this.assert(
      result.status === "PASSED",
      "Programmatic audit did not pass",
      { status: result.status },
    );

    this.assert(
      result.results.a === 15 &&
      result.results.b === 15 &&
      result.results.c === 15,
      "Programmatic audit results mismatch",
      { results: result.results },
    );

    const verification =
      verifyAudit(result.files.manifest);

    this.assert(
      verification.valid,
      "Fresh audit evidence failed verification",
      { errors: verification.errors },
    );

    const cliDirectory = path.join(
      this.tempRoot,
      "audit-cli",
    );

    const cli = spawnSync(
      process.execPath,
      [path.join(__dirname, "audit.js"), "5", "all"],
      {
        cwd: __dirname,
        env: {
          ...process.env,
          PROBLEM1_LOG_DIR: cliDirectory,
        },
        encoding: "utf8",
        timeout: 30_000,
      },
    );

    this.assert(
      cli.status === 0,
      "Audit CLI returned non-zero",
      {
        status: cli.status,
        stderr: cli.stderr,
      },
    );

    const manifests = fs
      .readdirSync(cliDirectory)
      .filter((name) =>
        name.endsWith(".manifest.json"),
      );

    this.assert(
      manifests.length === 1,
      "Audit CLI should create exactly one manifest",
      { manifests },
    );

    const cliVerification = verifyAudit(
      path.join(cliDirectory, manifests[0]),
    );

    this.assert(
      cliVerification.valid,
      "Audit CLI evidence failed verification",
      { errors: cliVerification.errors },
    );

    return {
      programmaticManifest: result.files.manifest,
      cliManifest: path.join(
        cliDirectory,
        manifests[0],
      ),
    };
  }

  auditCliInvalidArguments() {
    const auditPath = path.join(__dirname, "audit.js");
    const cases = [
      [],
      ["abc"],
      ["1.5"],
      ["5", "xyz"],
      ["Infinity", "all"],
    ];

    for (const arguments_ of cases) {
      const result = spawnSync(
        process.execPath,
        [auditPath, ...arguments_],
        {
          cwd: __dirname,
          encoding: "utf8",
          timeout: 10_000,
        },
      );

      this.assert(
        result.status !== 0,
        "Invalid CLI arguments unexpectedly succeeded",
        {
          arguments_,
          stdout: result.stdout,
          stderr: result.stderr,
        },
      );

      this.assert(
        result.stderr.includes("Cannot start audit"),
        "Invalid CLI failure is not explicit",
        {
          arguments_,
          stderr: result.stderr,
        },
      );
    }

    return {
      cases: cases.length,
    };
  }

  fileSystemFailure() {
    const fakeDirectory = path.join(
      this.tempRoot,
      "not-a-directory",
    );

    fs.writeFileSync(
      fakeDirectory,
      "I am a file",
      "utf8",
    );

    const result = spawnSync(
      process.execPath,
      [path.join(__dirname, "audit.js"), "5", "all"],
      {
        cwd: __dirname,
        env: {
          ...process.env,
          PROBLEM1_LOG_DIR: fakeDirectory,
        },
        encoding: "utf8",
        timeout: 10_000,
      },
    );

    this.assert(
      result.status !== 0,
      "Audit unexpectedly succeeded with invalid log path",
      {
        stdout: result.stdout,
        stderr: result.stderr,
      },
    );

    this.assert(
      result.stderr.includes("Cannot start audit"),
      "File-system failure was not surfaced",
      {
        stderr: result.stderr,
      },
    );

    return {
      invalidLogPath: fakeDirectory,
    };
  }

  injectedAlgorithmFailure() {
    const outputDirectory = path.join(
      this.tempRoot,
      "injected-error",
    );

    const brokenAlgorithms = {
      ...DEFAULT_ALGORITHMS,
      b: {
        ...DEFAULT_ALGORITHMS.b,
        run(n, audit) {
          audit({
            algorithm: "B_LINEAR_ALGEBRA",
            action: "FAULT_INJECTION_STARTED",
            data: { n },
          });

          throw new Error("Injected matrix failure");
        },
      },
    };

    const result = runAudit({
      n: 5,
      selectedAlgorithm: "all",
      outputDirectory,
      algorithms: brokenAlgorithms,
      consoleOutput: false,
    });

    this.assert(
      result.status === "ERROR",
      "Injected algorithm failure did not produce ERROR status",
      { status: result.status },
    );

    this.assert(
      result.results.a === 15 &&
      result.results.b === undefined,
      "Partial results were not preserved correctly",
      { results: result.results },
    );

    const verification =
      verifyAudit(result.files.manifest);

    this.assert(
      verification.valid,
      "Error audit evidence should remain structurally valid",
      { errors: verification.errors },
    );

    this.assert(
      verification.manifest.status === "ERROR",
      "Error manifest status mismatch",
    );

    return {
      manifest: result.files.manifest,
      partialResults: result.results,
    };
  }

  mutationSensitivity() {
    const mutants = [
      {
        name: "off-by-one",
        run: (n) => sum_to_n_a(n) + 1,
      },
      {
        name: "wrong-negative-sign",
        run: (n) =>
          n < 0
            ? Math.abs(sum_to_n_a(n))
            : sum_to_n_a(n),
      },
      {
        name: "skip-odd-middle",
        run(n) {
          const magnitude = Math.abs(n);
          const pairCount = Math.floor(magnitude / 2);
          const positive = pairCount * (magnitude + 1);
          return n < 0 ? -positive : positive;
        },
      },
      {
        name: "matrix-result-column-bug",
        run: (n) => Math.abs(n),
      },
    ];

    const detectionCases = [
      -10,
      -5,
      -1,
      0,
      1,
      2,
      3,
      5,
      10,
      99,
    ];

    for (const mutant of mutants) {
      const detectedBy = [];

      for (const n of detectionCases) {
        let actual;

        try {
          actual = mutant.run(n);
        } catch {
          detectedBy.push(n);
          continue;
        }

        if (actual !== expectedNumber(n)) {
          detectedBy.push(n);
        }
      }

      this.assert(
        detectedBy.length > 0,
        "Test oracle failed to detect mutant",
        {
          mutant: mutant.name,
        },
      );
    }

    return {
      mutants: mutants.map((mutant) => mutant.name),
      allDetected: true,
    };
  }

  tamperDetection() {
    const originalDirectory = path.join(
      this.tempRoot,
      "tamper-original",
    );

    const result = runAudit({
      n: 5,
      selectedAlgorithm: "all",
      outputDirectory: originalDirectory,
      consoleOutput: false,
    });

    this.assert(
      verifyAudit(result.files.manifest).valid,
      "Original evidence must be valid",
    );

    const tamperDirectory = path.join(
      this.tempRoot,
      "tamper-copy",
    );
    fs.cpSync(
      originalDirectory,
      tamperDirectory,
      { recursive: true },
    );

    const manifestName =
      path.basename(result.files.manifest);
    const tamperedManifest = path.join(
      tamperDirectory,
      manifestName,
    );

    const manifest = JSON.parse(
      fs.readFileSync(
        tamperedManifest,
        "utf8",
      ),
    );
    const rawPath = path.join(
      tamperDirectory,
      manifest.files.raw,
    );

    const lines = fs
      .readFileSync(rawPath, "utf8")
      .trimEnd()
      .split(/\r?\n/);

    const event = JSON.parse(lines[4]);
    event.data = {
      ...event.data,
      maliciousChange: true,
    };
    lines[4] = JSON.stringify(event);

    fs.writeFileSync(
      rawPath,
      `${lines.join("\n")}\n`,
      "utf8",
    );

    const tamperedVerification =
      verifyAudit(tamperedManifest);

    this.assert(
      !tamperedVerification.valid,
      "Modified JSONL evidence was not detected",
    );

    this.assert(
      tamperedVerification.errors.some(
        (error) =>
          error.name.includes("SHA-256") ||
          error.name.includes("event hash"),
      ),
      "Tampering failed for the expected reason",
      {
        errors: tamperedVerification.errors,
      },
    );

    const truncatedDirectory = path.join(
      this.tempRoot,
      "truncate-copy",
    );
    fs.cpSync(
      originalDirectory,
      truncatedDirectory,
      { recursive: true },
    );

    const truncatedManifest = path.join(
      truncatedDirectory,
      manifestName,
    );
    const truncatedManifestData = JSON.parse(
      fs.readFileSync(
        truncatedManifest,
        "utf8",
      ),
    );
    const truncatedRaw = path.join(
      truncatedDirectory,
      truncatedManifestData.files.raw,
    );
    const truncatedLines = fs
      .readFileSync(truncatedRaw, "utf8")
      .trimEnd()
      .split(/\r?\n/);

    truncatedLines.pop();
    fs.writeFileSync(
      truncatedRaw,
      `${truncatedLines.join("\n")}\n`,
      "utf8",
    );

    this.assert(
      !verifyAudit(truncatedManifest).valid,
      "Truncated evidence was not detected",
    );

    return {
      modifiedEventDetected: true,
      truncationDetected: true,
    };
  }

  async concurrentAudits() {
    const outputDirectory = path.join(
      this.tempRoot,
      "concurrent",
    );
    fs.mkdirSync(outputDirectory, {
      recursive: true,
    });

    const auditPath = path.join(
      __dirname,
      "audit.js",
    );

    const jobs = Array.from(
      { length: this.config.concurrentAudits },
      (_, index) =>
        spawnPromise(
          process.execPath,
          [
            auditPath,
            String(index + 5),
            "all",
          ],
          {
            cwd: __dirname,
            env: {
              ...process.env,
              PROBLEM1_LOG_DIR: outputDirectory,
            },
            stdio: [
              "ignore",
              "pipe",
              "pipe",
            ],
          },
        ),
    );

    const results = await Promise.all(jobs);

    this.assert(
      results.every((result) => result.code === 0),
      "One or more concurrent audits failed",
      {
        results: results.map((result) => ({
          code: result.code,
          stderr: result.stderr,
        })),
      },
    );

    const manifests = fs
      .readdirSync(outputDirectory)
      .filter((name) =>
        name.endsWith(".manifest.json"),
      );

    this.assert(
      manifests.length ===
      this.config.concurrentAudits,
      "Concurrent audits did not create unique manifests",
      {
        expected: this.config.concurrentAudits,
        actual: manifests.length,
      },
    );

    const auditIds = new Set();
    const filenames = new Set();

    for (const name of manifests) {
      filenames.add(name);
      const verification = verifyAudit(
        path.join(outputDirectory, name),
      );

      this.assert(
        verification.valid,
        "Concurrent audit evidence is invalid",
        {
          name,
          errors: verification.errors,
        },
      );

      auditIds.add(
        verification.manifest.auditId,
      );
    }

    this.assert(
      auditIds.size ===
      this.config.concurrentAudits,
      "Concurrent audit IDs are not unique",
      {
        uniqueAuditIds: auditIds.size,
      },
    );

    this.assert(
      filenames.size ===
      this.config.concurrentAudits,
      "Concurrent filenames collided",
    );

    return {
      processes: this.config.concurrentAudits,
      uniqueAuditIds: auditIds.size,
      uniqueManifests: filenames.size,
    };
  }

  timeoutDetection() {
    const result = spawnSync(
      process.execPath,
      [
        "-e",
        "setTimeout(() => console.log('late'), 5000)",
      ],
      {
        encoding: "utf8",
        timeout: 100,
      },
    );

    this.assert(
      result.error?.code === "ETIMEDOUT" ||
      result.signal !== null,
      "Subprocess timeout was not detected",
      {
        error: result.error?.code,
        signal: result.signal,
        status: result.status,
      },
    );

    return {
      timeoutMilliseconds: 100,
      detected: true,
    };
  }

  performanceChecks() {
    const inputs = Array.from(
      {
        length: this.config.performanceCases,
      },
      () =>
        randomInteger(
          this.random,
          -MAX_SAFE_SUM_N,
          MAX_SAFE_SUM_N,
        ),
    );

    function benchmark(implementation) {
      let checksum = 0;
      const started = performance.now();

      for (const n of inputs) {
        checksum =
          (checksum + implementation(n)) %
          1_000_000_007;
      }

      return {
        durationMs:
          performance.now() - started,
        checksum,
      };
    }

    const a = benchmark(sum_to_n_a);
    const b = benchmark(sum_to_n_b);

    this.assert(
      a.checksum === b.checksum,
      "Performance batch checksum mismatch",
      { a, b },
    );

    const cInput = this.config.cPerformanceN;
    const cStarted = performance.now();
    const cResult = sum_to_n_c(cInput);
    const cDuration =
      performance.now() - cStarted;

    this.assert(
      cResult === expectedNumber(cInput),
      "Long-loop C result mismatch",
      {
        cInput,
        cResult,
      },
    );

    this.assert(
      cDuration < 20_000,
      "Long-loop C exceeded generous 20-second budget",
      {
        cInput,
        cDuration,
      },
    );

    return {
      batchCases: inputs.length,
      A: a,
      B: b,
      C: {
        input: cInput,
        durationMs: cDuration,
      },
    };
  }
}

async function main() {
  try {
    const arguments_ = parseArguments(process.argv);
    const runner = new Runner(arguments_);
    await runner.run();
  } catch (error) {
    console.error(
      `Cannot start quality suite: ${error.message}`,
    );
    process.exitCode = 1;
  }
}

main();
